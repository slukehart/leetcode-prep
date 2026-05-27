# LC Prep Tracker

A local, single-user study tracker for LeetCode interview prep — patterns, a study
path, and a problem/mistake log. Built with Nuxt 4 + Vuetify 3.

## Setup

```bash
cd tracker
npm install
npm run dev
```

Open http://localhost:3000.

## Your data is local and private

Your progress (logged attempts, pattern statuses, checked path items, mistakes) is
stored in `server/data/progress.json`. **This file is gitignored and never committed.**

- On first server start it's created automatically (seeded empty) in your own checkout.
- It stays on your machine. `git pull`ing updates to the app or curriculum never
  touches it, and you never commit your personal data.

To reset your progress, delete `server/data/progress.json` and restart the dev
server — a fresh empty one is created on boot.

## What's shared vs. local

- **Shared (committed):** the app code and the curriculum content —
  `server/data/patterns.json`, `problems.json`, `curriculum.json`. Improvements here
  are welcome via PR.
- **Local (gitignored):** `server/data/progress.json` — your personal tracking data.

## Contributing

Fork, branch, and open a PR. Since `progress.json` is gitignored, your local activity
won't show up in diffs. Please keep PRs focused on the app or the curriculum content.
