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
| `data/meta.json` | When the data was last updated |
| `scripts/update_tracker.py` | The updater the workflow runs |
