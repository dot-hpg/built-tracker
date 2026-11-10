# Built Tracker

A live tracker for everything I build: every project so far, and a 48-day daily build streak from **Oct 25 to Dec 11, 2026**.

**Live site:** https://dot-hpg.github.io/built-tracker/

## What's on it

- **Dashboard:** headline numbers, a 48-day streak heatmap, commits per day, projects by category, progress for each project, and how the 48 days split by track
- **All projects:** a sortable, searchable table with category, status, progress, stack, dates, commits and repo links
- **48-day tracker:** one row per day showing what was built and what's planned next

It works on phones (the tables turn into cards) and follows the device's light or dark setting.

## How it stays up to date

- `.github/workflows/update.yml` runs every 4 hours. It reads my commits from GitHub and logs them into `data/`. A day with commits is marked **Done**, a past day with none is marked **Missed**, and a new repo is added to the project list.
- Without a token, the workflow only sees public repos. To count private repos too, add a fine-grained personal access token with read-only **Contents** access to all repos as a repository secret named `TRACKER_TOKEN`.
- Claude edits the data files directly to add write-ups, categories and progress.

## Files

| Path | What it holds |
|---|---|
| `index.html` | The whole site (static, no build step) |
| `data/projects.json` | One row per project |
| `data/tracker.json` | One row per day of the 48-day sprint. `locked: true` keeps the updater from rewriting a day that was logged by hand. |
| `data/learning.json` | YouTube courses and playlists: `watched` of `total` videos. A course shows as Completed once every video is watched. |
| `data/trackers.json` | Personal trackers (books, films, Hanuman Chalisa readings). Each tracker has a `target` and an `entries` list; the count is the number of entries. To log one, append an object such as `{"title": "...", "author": "...", "date": "YYYY-MM-DD"}` to the end of that tracker's `entries`. |
| `data/meta.json` | When the data was last updated |
| `scripts/update_tracker.py` | The updater the workflow runs |

## Logging from the site

On the Trackers page, the log buttons save a new entry straight into `data/trackers.json` through the GitHub API. Each device connects once with a fine-grained personal access token limited to this repository with **Contents: Read and write**. The token is kept only in that browser's localStorage, so visitors cannot add entries. If a device is offline, entries are queued on it and committed when it reconnects.

Typing a film or book title searches IMDb (via imdbapi.dev) or Open Library and fills in the other fields. Shortcut links: `#log/hanuman-chalisa` logs today's reading at once, and `#log/movies` or `#log/books` opens the log sheet.

## Native app (parked)

`app/` holds the Expo source for a native iPhone and Android version of the tracker. It is not built or published, because the home-screen web app covers phone use for free. Its build workflows live in `app/.github/workflows/` and only run if they are moved to a repository of their own.

## Versions

Each meaningful change to the site is saved as a version branch (`release/v1`, `release/v2`, ...) that stays frozen at that point, and is listed in [CHANGELOG.md](CHANGELOG.md). `main` is always the live site.
