# Built Tracker (iPhone app)

The iPhone app for [Built Tracker](https://dot-hpg.github.io/built-tracker/): every project I build, and my 48-day daily build streak.

The app reads the same live data files as the website (`dot-hpg.github.io/built-tracker/data/*.json`), so anything that updates the tracker shows up in the app on the next open or pull-to-refresh. No app update needed.

## What it does

- **Dashboard:** headline numbers, a tappable 48-day streak heatmap, commits per day, projects by category, progress for each project, and how the 48 days split by track
- **Projects:** search and filter every project, with progress, stack and a link to its repo
- **48 days:** the day-by-day log and plan, grouped by week, with a jump to today
- **Daily reminder:** an optional local notification at 9 pm to keep the streak going
- Works offline from the last saved copy, and follows light and dark mode

## Android (free)

Every push to `main` builds an APK on GitHub Actions and attaches it to the [latest release](../../releases/tag/latest). Open that page on an Android phone, download `BuiltTracker.apk` and open it to install. Android asks once to allow installs from your browser.

## iPhone build

Builds run in Expo's cloud (EAS), so no Mac is needed.

1. Repository secrets (Settings → Secrets and variables → Actions):
   - `EXPO_TOKEN`: an access token from expo.dev
   - `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`: an App Store Connect API key (App Manager role); `ASC_KEY_P8` holds the .p8 file contents
   - `APPLE_TEAM_ID`: your Apple Developer team ID
2. Actions → **iOS build** → Run workflow. The build is uploaded to TestFlight when it finishes.

## Local development

```bash
npm install
npx expo start
```
