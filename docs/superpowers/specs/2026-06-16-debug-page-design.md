# Debug Page — "Explain the Bug" Trainer

**Date:** 2026-06-16
**Status:** Approved design

## Overview

A new page at `/debug` for diagnostic debugging practice. Each exercise presents
buggy code and a concrete failing case, then asks the user to identify the
**root cause** from multiple-choice candidates. After answering, the user sees
immediate correct/incorrect feedback and a reveal of the canonical root-cause
explanation.

The focus is *diagnosis* ("why is this wrong"), not fixing — it trains the
interview skill of reading code and spotting the defect.

This mirrors the existing `/practice` and `/patterns` pages in look, layout, and
data-flow conventions (Vuetify single-column, `CodeBlock`, `DifficultyChip`,
`useContent()`).

## User experience

The page lists exercises. Each exercise card shows:

- **Buggy code** rendered in the existing `CodeBlock`.
- **Chips**: pattern, bug-type, and difficulty (`DifficultyChip`).
- **A failing case**: the input, plus expected vs. actual output — so the user
  sees *how* it breaks, not merely that it breaks.
- **3–4 candidate root-cause explanations** as multiple choice; exactly one is
  correct.
- On selection: immediate correct/incorrect feedback, plus a reveal of the
  canonical `explanation` of the real root cause.

A **filter bar** lets the user filter by pattern *or* by bug-type. A small
session score (e.g. "4/7 correct") sits at the top.

## Persistence

**Session-only.** MC results live in an in-memory `ref` for the current session
and reset on reload. Nothing is written to `progress.json`; `/api/progress` is
not touched.

Note the distinction: *results* are session-only, but exercise *content* is
still served from the backend (see below). "Session-only" governs the score, not
the content pipeline.

## Data model

### New content file

`server/data/debug-exercises.json` — an array of `DebugExercise`, served exactly
like `scaffolds`. This is the only backend change, and it is for **content
serving only**.

`server/api/content.get.ts` reads a 5th file and returns `debugExercises`.
`Content` (in `app/types/index.ts`) gains `debugExercises: DebugExercise[]`.

### Types (`app/types/index.ts`)

```ts
export type BugType =
  | 'off-by-one' | 'mutation-during-iteration' | 'wrong-base-case'
  | 'integer-overflow' | 'wrong-comparison' | 'uninitialized-accumulator'
  | 'wrong-pointer-update' | 'missing-visited-check'

export interface DebugChoice { text: string; correct: boolean }

export interface DebugExercise {
  id: string
  title: string
  patternId: string          // existing pattern id
  bugType: BugType           // bounded enum, ~2 exercises each
  difficulty: 'easy' | 'medium' | 'hard'
  buggyCode: string          // shown in CodeBlock
  failingInput: string       // e.g. "nums = [3,3], target = 6"
  expected: string           // "[0,1]"
  actual: string             // "[] (or throws)"
  choices: DebugChoice[]     // 3-4; exactly one has correct: true
  explanation: string        // canonical root-cause writeup, revealed after answering
}
```

`bugType` is a **bounded enum** (8 values) so the bug-type filter groups
meaningfully — roughly 2 exercises per type rather than unique singletons.

## Content

Author **~13 exercises**, roughly 2 per bug-type, each tied to a core pattern.
Representative coverage:

- binary-search — off-by-one (loop bound / mid update)
- sliding-window — wrong-comparison (window-shrink condition)
- bfs-queue — missing-visited-check
- linked-list-traversal — wrong-pointer-update
- dp-1d — wrong-base-case
- frequency-map / hash-map-complement — uninitialized-accumulator
- two-pointers — mutation-during-iteration
- heap-top-k / canonical-key-grouping — integer-overflow or wrong-comparison

### Verification gate (required)

The snippets are plain JS, runnable with `node` like the practice scaffolds.
Before any exercise ships, it MUST be verified by execution:

1. Run `buggyCode` on `failingInput` and confirm it produces `actual`
   (the wrong/throwing result) — **not** `expected`.
2. Confirm that fixing the identified root cause produces `expected`.
3. Confirm exactly one `choices` entry has `correct: true`, and that it
   genuinely describes the verified root cause; distractors are
   plausible-but-wrong.

An answer key that is subtly wrong is worse than no trainer. This verification is
an explicit implementation task, not an afterthought. A passing page render does
not validate content correctness.

## Wiring

- New page: `app/pages/debug/index.vue`, using `useContent()`. No `useProgress`
  writes.
- New component: `app/components/DebugExerciseCard.vue` — renders one exercise
  (code, chips, failing case, choices, feedback, reveal). Keeps the page file
  focused.
- Nav: add `{ label: 'Debug', to: '/debug' }` to `links` in
  `app/layouts/default.vue`, between Practice and Tracker.

## Out of scope

- Persisting results / spaced-repetition of missed bugs (session-only for now).
- Free-form explanation grading (multiple choice only).
- Fixing the bug in-page (diagnosis only).
