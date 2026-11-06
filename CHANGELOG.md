# Changelog

Each version is frozen on a `release/vN` branch. `main` is the live site, and the automatic activity logs and new videos land there between versions.

## v3.1 (2026-11-06)

Goals now have three states.

- A Current / Archived / Completed switcher at the top of Goals, with live counts and a sliding highlight. It remembers the last tab you opened and works with the arrow keys.
- Every goal card has actions: Mark complete and Archive on current goals, Restore and Mark complete on archived ones, and Move to current and Delete on completed ones. Delete asks for confirmation first, and every action can be undone from the toast that follows.
- Archived goals keep their progress, show it in a paused ring, and fold their milestones away. Completed goals show a green ring and the day they were finished.
- These changes are saved on the device; `status` in `data/goals.json` (`active`, `archived` or `done`) makes them permanent everywhere.
- "Complete CampusX evals" and "Get an AI engineer job" are moved to Archived.

## v3 (2026-11-05)

A full redesign into a platform-style app called Built.

- App layout: a sidebar on desktop with icons, live counts for each section, a 48-day sprint ring, and your profile. On phones a floating bottom bar replaces the sidebar.
- Sticky top bar with the page title, a live date and time, a GitHub link, and a light or dark switch that is remembered.
- Goals opens with a greeting hero and a "Focus today" panel showing the goal due today and its next step.
- Goal countdowns are now rings that empty as time runs out (hours on the due day, days otherwise).
- New visual system: glass cards, soft glow background with a faint grid, Geist and Geist Mono type, gradient accents, smooth tab transitions, and hover states everywhere.
- Learning opens on Completed when nothing is half-watched.

## v2.1 (2026-11-05)

- Removed the four summary cards from the top of the Goals tab, so the goal cards come first.

## v2 (2026-11-05)

New look and a goal dashboard.

- New Goals tab, now the first thing you see. Each goal shows a live countdown (hours left on the due day, days left otherwise), progress from its milestones, time used, and a milestone checklist.
- Two goals: finish CampusX evals (due Nov 5) and get an AI engineer job (Nov 5 to Dec 5), with applications, interviews, offers and interview videos counted. The interview-video count and the "watch 30 videos" milestone update by themselves from the Learning tab.
- Redesign: indigo and violet palette in light and dark, gradient title, softer cards with shadows, and a pill-style tab bar that stays at the top while you scroll.

## v1 (2026-11-05)

The first saved version, covering everything built so far.

- Dashboard with streak stats, a 48-day build plan (Oct 25 to Dec 11, 2026) and a categorized table of every project.
- Automatic updates every 4 hours from public GitHub commits, which log each day as Done, Today or Missed and add new repos.
- Home-screen app for iPhone and Android: install prompt, icons, and offline support.
- Learning tab for YouTube AI-engineering study, with three lists: In progress (half-watched videos and where you stopped), Completed (grouped by tracker, numbered, with the completion date) and Course trackers.
- Trackers: CampusX 100 Days of Machine Learning, and 100 AI engineer interview videos.
- Parked native app source (Expo) in `app/`.
