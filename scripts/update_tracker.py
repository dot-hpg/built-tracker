"""Pull recent commits from GitHub and log them into the tracker data.

Runs from the GitHub Action every few hours. It only reads public repos
(the workflow token cannot see private ones), so it never lowers a count
that was logged by hand.
"""
import datetime as dt
import json
import os
import urllib.request
from collections import defaultdict
from pathlib import Path
from zoneinfo import ZoneInfo

USER = os.environ.get("TRACKER_USER", "dot-hpg")
TZ = ZoneInfo(os.environ.get("TRACKER_TZ", "Asia/Kolkata"))
SKIP = {"built-tracker"}
DATA = Path(__file__).resolve().parent.parent / "data"
TOKEN = os.environ.get("GITHUB_TOKEN", "")


def api(path):
    out, url = [], f"https://api.github.com{path}"
    while url:
        req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "built-tracker"})
        if TOKEN:
            req.add_header("Authorization", f"Bearer {TOKEN}")
        with urllib.request.urlopen(req, timeout=30) as r:
            body = json.load(r)
            nxt = None
            for part in r.headers.get("Link", "").split(","):
                if 'rel="next"' in part:
                    nxt = part[part.index("<") + 1 : part.index(">")]
        if isinstance(body, list):
            out.extend(body)
            url = nxt
        else:
            return body
    return out


def pretty(repo):
    return repo.replace("_", " ").replace("-", " ").strip().title()


def main():
    tracker = json.loads((DATA / "tracker.json").read_text())
    projects = json.loads((DATA / "projects.json").read_text())
    rows, prows = tracker["rows"], projects["rows"]
    start = dt.date.fromisoformat(rows[0]["date"])
    today = dt.datetime.now(TZ).date()

    repos = [r for r in api(f"/users/{USER}/repos?type=owner&per_page=100") if not r["fork"] and r["name"] not in SKIP]
    since = dt.datetime.combine(start, dt.time(), TZ).astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    per_day = defaultdict(lambda: {"commits": 0, "repos": [], "messages": []})
    per_repo = {}
    for repo in repos:
        if (repo.get("pushed_at") or "") < since:
            continue
        try:
            commits = api(f"/repos/{USER}/{repo['name']}/commits?since={since}&author={USER}&per_page=100")
        except Exception as e:  # empty repos return 409
            print(f"skip {repo['name']}: {e}")
            continue
        if not commits:
            continue
        per_repo[repo["name"]] = (repo, commits)
        for c in commits:
            when = dt.datetime.fromisoformat(c["commit"]["author"]["date"].replace("Z", "+00:00")).astimezone(TZ).date()
            d = per_day[when.isoformat()]
            d["commits"] += 1
            if repo["name"] not in d["repos"]:
                d["repos"].append(repo["name"])
            msg = c["commit"]["message"].splitlines()[0]
            if not msg.lower().startswith("merge"):
                d["messages"].append(msg)

    for r in rows:
        day = dt.date.fromisoformat(r["date"])
        if day > today:
            r["status"] = "Planned"
            continue
        seen = per_day.get(r["date"])
        logged = int(r.get("commits") or 0)
        count = max(logged, seen["commits"] if seen else 0)
        if not r.get("locked") and seen:
            r.setdefault("plan_project", r["project"])
            r.setdefault("plan_focus", r["focus"])
            r["project"] = ", ".join(pretty(n) for n in seen["repos"])
            r["focus"] = "; ".join(seen["messages"][:3]) or r["focus"]
        r["commits"] = count
        r["status"] = "Today" if day == today else ("Done" if count > 0 else "Missed")

    known = {p["repo"] for p in prows}
    for name, (repo, commits) in per_repo.items():
        last = max(c["commit"]["author"]["date"][:10] for c in commits)
        if name in known:
            p = next(p for p in prows if p["repo"] == name)
            p["last"] = max(p["last"], last)
            p["commits"] = max(int(p["commits"]), len(commits))
        else:
            prows.append({
                "name": pretty(name),
                "category": "New this sprint",
                "description": repo.get("description") or "New repo picked up automatically. Tell Claude what it is to categorise it.",
                "stack": repo.get("language") or "",
                "repo": name,
                "repo_url": repo["html_url"],
                "start": repo["created_at"][:10],
                "last": last,
                "commits": len(commits),
                "status": "Active",
                "progress": 20,
                "evidence": "GitHub (auto)",
            })

    (DATA / "tracker.json").write_text(json.dumps(tracker, indent=1) + "\n")
    (DATA / "projects.json").write_text(json.dumps(projects, indent=1) + "\n")
    meta = {"updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "by": "GitHub Action"}
    (DATA / "meta.json").write_text(json.dumps(meta) + "\n")
    print(f"{today}: {sum(1 for r in rows if r['status'] in ('Done', 'Today'))} active days, {len(prows)} projects")


if __name__ == "__main__":
    main()
