# LC Prep Tracker

A local, single-user study tracker for LeetCode interview prep — patterns, a study
path, and a problem/mistake log. Built with Nuxt 4 + Vuetify 3.

## Prerequisites

You need **Node.js** (which includes `npm`). Nuxt 4 requires Node `20.19+` or `22.12+`
— the latest LTS is recommended.

- Don't have it? Install from **https://nodejs.org/** (the LTS installer bundles npm),
  or use a version manager like [nvm](https://github.com/nvm-sh/nvm) /
  [fnm](https://github.com/Schniz/fnm).
- Verify your install:

```bash
node -v   # should print v20.19+ or v22.12+
npm -v
```

## Get the code

```bash
git clone git@github.com:slukehart/leetcode-prep.git
cd leetcode-prep
```

## Setup

Install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview the production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment)
and the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) for
more information.

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
