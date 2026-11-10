# Changelog

Each version is frozen on a `release/vN` branch. `main` is the live site, and the automatic activity logs and new videos land there between versions.

## v6 (2026-11-10)

Type a title and the rest fills itself.

- In the film and book log sheets, results appear with posters and covers as you type. Pick one with a tap, or with ↑ ↓ and Enter.
- Films are looked up on IMDb (through the free imdbapi.dev). Choosing a match fills in the year, director, genre, runtime and IMDb rating, the same details as the existing list, and keeps the IMDb id.
- Books are looked up on Open Library. Choosing a match fills in the author, the year first published and a category where one can be worked out, and keeps the Open Library id.
- A "Found on IMDb / Open Library" card shows what was matched, and the filled fields briefly glow. Everything stays editable, and if the lookup is unavailable the fields can still be filled in by hand.
- Matches you have already logged are labelled in the results.
- Shortcut links: `#log/hanuman-chalisa` marks today's reading done the moment it opens, so it works as a one-tap home-screen button. `#log/movies` and `#log/books` open the log sheet straight away.

## v5 (2026-11-10)

Log progress straight from the site.

- Every tracker card has its own button: "Log a book", "Log a film", or "Mark today's reading done" for Hanuman Chalisa, which saves in one tap. A floating "Log progress" button sits on every Trackers page.
- The log sheet shows the bar moving before you save (for example 47 → 48 books, 9.4% → 9.6%) and says when an entry hits a milestone. It suggests authors, directors and categories you've used before, and warns before logging the same title twice.
- Saving sets off confetti, animates the bar and count to the new value, and shows a toast with the new numbers and an Undo button. Milestones and finishing a tracker get a bigger celebration.
- Entries save directly to `data/trackers.json` on GitHub using a fine-grained token that is kept only in your browser. Connect once per device; visitors cannot add entries. If you're offline, entries are kept on the device and sync when you're back online.

## v4 (2026-11-10)

A new Trackers tab for long-running personal goals.

- Trackers sits in the sidebar and the phone dock, with a live count of everything finished.
- Three trackers, each a card with a 0 to 100% progress bar, milestone markers and what is next: 500 Books (47 read), 250 Films (176 watched) and the Hanuman Chalisa 96-reading commitment (10 done).
- An overview with activity-style rings for all three and the next book, film and reading up.
- Each tracker opens a full page: a large progress bar with milestones, stat tiles, charts (films by decade and top directors; books by era, top authors and finishes by month; a 96-bead reading grid, pace and a calendar of reading days), the latest entries, and a searchable, sortable list of every entry.
- Data lives in `data/trackers.json`; logging a new book, film or reading is one line added to its `entries` list.
- Fixed the phone dock not highlighting the right tab when a page is opened from a link.

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
