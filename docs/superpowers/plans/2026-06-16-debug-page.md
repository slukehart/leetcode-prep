# Debug Page ("Explain the Bug" Trainer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/debug` page where the user reads buggy code + a failing case and identifies the root cause from multiple-choice options, with immediate feedback and a canonical explanation reveal.

**Architecture:** Content-driven, mirroring `/practice`. Exercises live in a new `server/data/debug-exercises.json`, served through the existing `/api/content` endpoint and consumed via `useContent()`. A `DebugExerciseCard` component renders one exercise; the page handles filtering and an in-memory session score. No progress persistence.

**Tech Stack:** Nuxt 4.4.6, Vue 3.5 (`<script setup lang="ts">`), Vuetify 3.12, Nitro server routes. Node for content verification. No test framework in this repo — content is verified by running snippets with `node`; the page is verified by `npm run build` and dev-server render.

## Global Constraints

- Nuxt auto-imports components from `app/components/` and composables from `app/composables/` — do not add manual imports for them.
- Use `<script setup lang="ts">` and Vuetify components, matching existing pages (`app/pages/practice/index.vue` is the closest reference).
- Page container is single-column, `max-width: 960px` (set by `app/layouts/default.vue`) — do not add another container.
- Results are **session-only**: keep score/answers in a `ref`. Never call `useProgress` or `/api/progress` from this feature.
- `bugType` is a bounded enum of exactly these 8 values: `off-by-one`, `mutation-during-iteration`, `wrong-base-case`, `integer-overflow`, `wrong-comparison`, `uninitialized-accumulator`, `wrong-pointer-update`, `missing-visited-check`.
- Every exercise's `patternId` MUST be an existing pattern id from `server/data/patterns.json`.
- Each exercise's `choices` array has 3–4 entries, exactly one with `correct: true`.

---

## File Structure

- `app/types/index.ts` (modify) — add `BugType`, `DebugChoice`, `DebugExercise`; add `debugExercises` to `Content`.
- `server/data/debug-exercises.json` (create) — array of `DebugExercise` content.
- `server/api/content.get.ts` (modify) — read the 5th file, return `debugExercises`.
- `app/components/DebugExerciseCard.vue` (create) — renders one exercise (code, chips, failing case, choices, feedback, reveal).
- `app/pages/debug/index.vue` (create) — filter bar, session score, exercise list.
- `app/layouts/default.vue` (modify) — add the `Debug` nav link.

---

## Task 1: Types and content API wiring

**Files:**
- Modify: `app/types/index.ts`
- Create: `server/data/debug-exercises.json`
- Modify: `server/api/content.get.ts`

**Interfaces:**
- Consumes: existing `Content` interface, existing `content.get.ts` handler.
- Produces:
  - `BugType` = union of the 8 enum values listed in Global Constraints.
  - `interface DebugChoice { text: string; correct: boolean }`
  - `interface DebugExercise { id: string; title: string; patternId: string; bugType: BugType; difficulty: 'easy'|'medium'|'hard'; buggyCode: string; failingInput: string; expected: string; actual: string; choices: DebugChoice[]; explanation: string }`
  - `Content.debugExercises: DebugExercise[]`
  - `/api/content` response includes `debugExercises`.

- [ ] **Step 1: Add the types to `app/types/index.ts`**

Add after the existing `Problem` interface (anywhere in the file is fine; group near `Problem` for readability):

```ts
export type BugType =
  | 'off-by-one'
  | 'mutation-during-iteration'
  | 'wrong-base-case'
  | 'integer-overflow'
  | 'wrong-comparison'
  | 'uninitialized-accumulator'
  | 'wrong-pointer-update'
  | 'missing-visited-check'

export interface DebugChoice {
  text: string
  correct: boolean
}

export interface DebugExercise {
  id: string
  title: string
  patternId: string                          // existing pattern id
  bugType: BugType
  difficulty: 'easy' | 'medium' | 'hard'
  buggyCode: string
  failingInput: string                        // e.g. "nums = [3,3], target = 6"
  expected: string                            // correct output, e.g. "[0,1]"
  actual: string                              // buggy output, e.g. "[] (or throws)"
  choices: DebugChoice[]                      // 3-4; exactly one correct: true
  explanation: string                         // revealed after answering
}
```

- [ ] **Step 2: Add `debugExercises` to the `Content` interface**

Modify the existing `Content` interface in `app/types/index.ts`:

```ts
export interface Content {
  patterns: Pattern[]
  problems: Problem[]
  curriculum: CurriculumTrack[]
  scaffolds: Record<string, string>
  debugExercises: DebugExercise[]
}
```

- [ ] **Step 3: Create `server/data/debug-exercises.json` with one verified seed exercise**

This single exercise is authored and verified now so the wiring is testable end-to-end. The remaining exercises are added in Task 2.

```json
[
  {
    "id": "binary-search-off-by-one",
    "title": "Binary Search — never finds the last element",
    "patternId": "binary-search",
    "bugType": "off-by-one",
    "difficulty": "easy",
    "buggyCode": "function search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo < hi) {            // BUG: should be lo <= hi\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}",
    "failingInput": "nums = [1, 3, 5], target = 5",
    "expected": "2",
    "actual": "-1",
    "choices": [
      { "text": "The loop condition `lo < hi` exits before checking the final single-element range, so a target at the high end is missed.", "correct": true },
      { "text": "`(lo + hi) >> 1` overflows for large arrays and computes the wrong midpoint.", "correct": false },
      { "text": "`hi` should be initialized to `nums.length`, not `nums.length - 1`.", "correct": false },
      { "text": "The comparison `nums[mid] < target` should be `nums[mid] <= target`.", "correct": false }
    ],
    "explanation": "With `lo < hi`, when the search space narrows to one element (`lo === hi`) the loop stops without testing `nums[lo]`. For target 5 in [1,3,5], lo and hi converge on index 2 but the loop never checks it. The fix is `while (lo <= hi)`."
  }
]
```

- [ ] **Step 4: Verify the seed exercise's bug reproduces**

Create a throwaway file `/tmp/verify-bs.js` with the `buggyCode` plus a call, and run it:

```bash
cat > /tmp/verify-bs.js <<'EOF'
function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {            // BUG
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
console.log('buggy:', search([1,3,5], 5));   // expect -1 (the bug)
EOF
node /tmp/verify-bs.js
```

Expected output: `buggy: -1` — confirms `actual` ("-1") is what the buggy code produces, not `expected` ("2").

- [ ] **Step 5: Extend `server/api/content.get.ts` to serve the new file**

Replace the file contents with:

```ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
const dir = join(process.cwd(), 'server', 'data')
export default defineEventHandler(async () => {
  const [patterns, problems, curriculum, scaffolds, debugExercises] = await Promise.all([
    readFile(join(dir, 'patterns.json'), 'utf8'),
    readFile(join(dir, 'problems.json'), 'utf8'),
    readFile(join(dir, 'curriculum.json'), 'utf8'),
    readFile(join(dir, 'scaffolds.json'), 'utf8'),
    readFile(join(dir, 'debug-exercises.json'), 'utf8'),
  ])
  return {
    patterns: JSON.parse(patterns),
    problems: JSON.parse(problems),
    curriculum: JSON.parse(curriculum),
    scaffolds: JSON.parse(scaffolds),
    debugExercises: JSON.parse(debugExercises),
  }
})
```

- [ ] **Step 6: Verify the API returns `debugExercises`**

Start the dev server (`npm run dev`) in one shell, then in another:

```bash
curl -s http://localhost:3000/api/content | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('debugExercises count:', d.debugExercises.length, '| first id:', d.debugExercises[0].id)"
```

Expected output: `debugExercises count: 1 | first id: binary-search-off-by-one`

- [ ] **Step 7: Commit**

```bash
git add app/types/index.ts server/data/debug-exercises.json server/api/content.get.ts
git commit -m "feat(debug): add DebugExercise types and wire content API"
```

---

## Task 2: Author and verify the full exercise set

**Files:**
- Modify: `server/data/debug-exercises.json`

**Interfaces:**
- Consumes: `DebugExercise` shape from Task 1.
- Produces: ~13 verified exercises in `debug-exercises.json` (the Task 1 seed plus 12 more), ~2 per `bugType`, each `patternId` an existing pattern.

Author the exercises below. Each row gives the pattern, bug-type, the exact defect to introduce, and the failing case. For each one: write a correct reference implementation, introduce the single stated bug, run the buggy version on the failing input to confirm it produces the wrong `actual` (and the fixed version produces `expected`), then write 3–4 `choices` (one correct root cause + plausible distractors drawn from the *other* bug-types) and a 2–4 sentence `explanation`.

| id | patternId | bugType | bug to introduce | failingInput |
|----|-----------|---------|------------------|--------------|
| `binary-search-off-by-one` | binary-search | off-by-one | (seed from Task 1) | nums=[1,3,5], target=5 |
| `binary-search-mid-overflow` | binary-search | wrong-comparison | use `nums[mid] <= target` so it returns the wrong index / loops past | nums=[1,2,3], target=2 |
| `sliding-window-shrink` | sliding-window | wrong-comparison | shrink window on `sum > target` but never on `sum >= target`, or compare against wrong bound (longest-substring style: only shrink when `> k` but should be `>= `) | s="abba" (longest substring w/o repeat) |
| `sliding-window-stale-max` | sliding-window | uninitialized-accumulator | init `maxLen = 1` instead of `0`, breaking empty/edge input | s="" |
| `bfs-no-visited` | bfs-queue | missing-visited-check | enqueue neighbors without marking visited → infinite loop / overcount | small cyclic graph adjacency |
| `bfs-mark-on-dequeue` | bfs-queue | missing-visited-check | mark visited on dequeue not enqueue → duplicates enqueued | grid with diamond paths |
| `linkedlist-reverse-lost-next` | linked-list-traversal | wrong-pointer-update | reverse list but reassign `curr.next` before saving `next` → truncated/looped list | list 1->2->3 |
| `linkedlist-cycle-pointer` | linked-list-traversal | wrong-pointer-update | fast/slow: advance fast by one not two → never detects cycle | list with cycle |
| `dp-climb-base-case` | dp-1d | wrong-base-case | climbing stairs with `dp[0]=0` instead of `1` → all results halved | n=3 |
| `dp-coin-base-case` | dp-1d | wrong-base-case | init dp array to `0` instead of `Infinity` (min-coins) → wrong min | coins=[2], amount=3 |
| `freqmap-uninit` | frequency-map | uninitialized-accumulator | `map[c] = map[c] + 1` without `?? 0` → NaN counts | s="aab" |
| `twosum-mutate-loop` | two-pointers | mutation-during-iteration | `splice` from the array being iterated → skips elements | nums=[2,2,3], remove pairs |
| `heap-topk-compare` | heap-top-k | wrong-comparison | min-heap comparator returns `a-b` where `b-a` needed (or `<` vs `>`) → keeps wrong k | nums=[1,2,3,4], k=2 |

Notes:
- Keep each `buggyCode` self-contained and runnable with `node` (plain functions, no imports).
- Distractors should be *plausible* — phrase them as real-sounding root causes (e.g. "integer overflow", "wrong base case") that don't actually apply here.
- If a chosen bug doesn't cleanly reproduce on `node`, adjust the input or pick a cleaner defect for that pattern — do NOT ship an exercise whose `actual` you haven't observed.

- [ ] **Step 1: Author exercises 2–13 and append them to the array in `server/data/debug-exercises.json`**

Write each as a `DebugExercise` object following the seed's structure. (Full JSON authored during execution; the table above is the authoring spec.)

- [ ] **Step 2: Verify every exercise's bug reproduces**

For each exercise, write its `buggyCode` to a temp file, call it with `failingInput`, and confirm the printed result equals `actual` (the wrong value), not `expected`. Example loop driver:

```bash
node -e '
const ex = require("./server/data/debug-exercises.json");
console.log("Total exercises:", ex.length);
ex.forEach(e => {
  if (!Array.isArray(e.choices) || e.choices.filter(c => c.correct).length !== 1)
    throw new Error("BAD CHOICES: " + e.id);
  if (e.choices.length < 3 || e.choices.length > 4)
    throw new Error("CHOICE COUNT: " + e.id);
});
console.log("Schema checks passed for all", ex.length, "exercises");
'
```

Expected output: `Total exercises: 13` then `Schema checks passed for all 13 exercises`. Additionally, manually run each `buggyCode` snippet via `node` against its `failingInput` and record that the observed result matches `actual`.

- [ ] **Step 3: Verify all `patternId` values exist**

```bash
node -e '
const ex = require("./server/data/debug-exercises.json");
const pats = new Set(require("./server/data/patterns.json").map(p => p.id));
const bad = ex.filter(e => !pats.has(e.patternId));
if (bad.length) throw new Error("Unknown patternId: " + bad.map(b=>b.id+"->"+b.patternId).join(", "));
console.log("All", ex.length, "patternIds valid");
'
```

Expected output: `All 13 patternIds valid`

- [ ] **Step 4: Verify all `bugType` values are in the enum**

```bash
node -e '
const ex = require("./server/data/debug-exercises.json");
const types = new Set(["off-by-one","mutation-during-iteration","wrong-base-case","integer-overflow","wrong-comparison","uninitialized-accumulator","wrong-pointer-update","missing-visited-check"]);
const bad = ex.filter(e => !types.has(e.bugType));
if (bad.length) throw new Error("Bad bugType: " + bad.map(b=>b.id).join(", "));
const counts = {}; ex.forEach(e => counts[e.bugType]=(counts[e.bugType]||0)+1);
console.log("bugType counts:", counts);
'
```

Expected output: `bugType counts:` with each type appearing (most ~2). Confirm no type is missing.

- [ ] **Step 5: Commit**

```bash
git add server/data/debug-exercises.json
git commit -m "feat(debug): author and verify full debug exercise set"
```

---

## Task 3: DebugExerciseCard component

**Files:**
- Create: `app/components/DebugExerciseCard.vue`

**Interfaces:**
- Consumes: `DebugExercise` type; `CodeBlock` (prop `code: string`); `DifficultyChip` (prop `difficulty`).
- Produces: component `DebugExerciseCard` with prop `exercise: DebugExercise` and emit `answered(correct: boolean)` fired once, the first time the user selects a choice.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { DebugExercise } from '~/types'

const props = defineProps<{ exercise: DebugExercise }>()
const emit = defineEmits<{ answered: [correct: boolean] }>()

const selected = ref<number | null>(null)
const answered = computed(() => selected.value !== null)

function choose(i: number) {
  if (answered.value) return            // lock after first answer
  selected.value = i
  emit('answered', props.exercise.choices[i].correct)
}

function choiceColor(i: number): string | undefined {
  if (!answered.value) return undefined
  if (props.exercise.choices[i].correct) return 'success'
  if (i === selected.value) return 'error'
  return undefined
}

const gotItRight = computed(() =>
  selected.value !== null && props.exercise.choices[selected.value].correct
)
</script>

<template>
  <v-card variant="outlined" rounded="lg" class="mb-8 pa-4">
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <h2 class="text-subtitle-1 font-weight-bold mr-1">{{ exercise.title }}</h2>
      <DifficultyChip :difficulty="exercise.difficulty" />
      <v-chip size="small" label variant="tonal" color="primary">{{ exercise.patternId }}</v-chip>
      <v-chip size="small" label variant="tonal">{{ exercise.bugType }}</v-chip>
    </div>

    <CodeBlock :code="exercise.buggyCode" />

    <div class="mt-3 mb-4 text-body-2">
      <div><strong>Input:</strong> <code>{{ exercise.failingInput }}</code></div>
      <div><strong>Expected:</strong> <code>{{ exercise.expected }}</code></div>
      <div><strong>Actual:</strong> <code>{{ exercise.actual }}</code></div>
    </div>

    <p class="text-body-2 font-weight-medium mb-2">What is the root cause?</p>
    <div class="d-flex flex-column ga-2">
      <v-btn
        v-for="(c, i) in exercise.choices"
        :key="i"
        :color="choiceColor(i)"
        :variant="answered && (c.correct || i === selected) ? 'tonal' : 'outlined'"
        class="text-none justify-start text-left"
        style="height: auto; white-space: normal; padding: 10px 14px"
        block
        :disabled="answered && !c.correct && i !== selected"
        @click="choose(i)"
      >
        {{ c.text }}
      </v-btn>
    </div>

    <v-alert
      v-if="answered"
      :type="gotItRight ? 'success' : 'error'"
      variant="tonal"
      density="comfortable"
      class="mt-4"
    >
      <div class="font-weight-medium mb-1">{{ gotItRight ? 'Correct' : 'Not quite' }}</div>
      {{ exercise.explanation }}
    </v-alert>
  </v-card>
</template>
```

- [ ] **Step 2: Verify it compiles (typecheck via build prep)**

```bash
npx nuxi typecheck 2>&1 | tail -20 || npx vue-tsc --noEmit 2>&1 | tail -20
```

Expected: no errors referencing `DebugExerciseCard.vue` or `~/types`. (If neither typecheck command is configured, skip — the dev-server render in Task 4 Step 3 is the functional gate.)

- [ ] **Step 3: Commit**

```bash
git add app/components/DebugExerciseCard.vue
git commit -m "feat(debug): add DebugExerciseCard component"
```

---

## Task 4: The /debug page

**Files:**
- Create: `app/pages/debug/index.vue`

**Interfaces:**
- Consumes: `useContent()` (returns `{ data }` with `.value.debugExercises`); `DebugExerciseCard` (prop `exercise`, emit `answered`).
- Produces: route `/debug`.

- [ ] **Step 1: Create the page**

```vue
<script setup lang="ts">
import type { BugType } from '~/types'

const { data: content } = await useContent()

const all = computed(() => content.value?.debugExercises ?? [])

const patternFilter = ref<string | null>(null)
const bugTypeFilter = ref<BugType | null>(null)

const patternOptions = computed(() =>
  [...new Set(all.value.map((e) => e.patternId))].sort()
)
const bugTypeOptions = computed(() =>
  [...new Set(all.value.map((e) => e.bugType))].sort()
)

const visible = computed(() =>
  all.value.filter((e) =>
    (!patternFilter.value || e.patternId === patternFilter.value) &&
    (!bugTypeFilter.value || e.bugType === bugTypeFilter.value)
  )
)

// Session-only score, keyed by exercise id so re-filtering doesn't double-count.
const results = ref<Record<string, boolean>>({})
const answeredCount = computed(() => Object.keys(results.value).length)
const correctCount = computed(() => Object.values(results.value).filter(Boolean).length)

function onAnswered(id: string, correct: boolean) {
  if (!(id in results.value)) results.value[id] = correct
}
</script>

<template>
  <div>
    <div class="d-flex align-baseline ga-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Debug</h1>
      <span class="text-body-2 text-medium-emphasis">{{ all.length }} exercises</span>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Read the buggy code and the failing case, then pick the root cause. Diagnosis only —
      no fixing required. Score is for this session and resets on reload.
    </p>

    <div class="d-flex flex-wrap ga-3 align-center mb-6">
      <v-select
        v-model="patternFilter"
        :items="patternOptions"
        label="Pattern"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        style="max-width: 220px"
      />
      <v-select
        v-model="bugTypeFilter"
        :items="bugTypeOptions"
        label="Bug type"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        style="max-width: 220px"
      />
      <v-spacer />
      <v-chip v-if="answeredCount" color="primary" label variant="tonal">
        {{ correctCount }}/{{ answeredCount }} correct
      </v-chip>
    </div>

    <DebugExerciseCard
      v-for="e in visible"
      :key="e.id"
      :exercise="e"
      @answered="(correct) => onAnswered(e.id, correct)"
    />

    <div v-if="!visible.length" class="text-medium-emphasis text-body-2 py-8 text-center">
      No exercises match these filters.
    </div>
  </div>
</template>
```

- [ ] **Step 2: Build to confirm no compile errors**

```bash
npm run build 2>&1 | tail -25
```

Expected: build completes; output ends with a success summary (e.g. "✔ ... built in ...") and no errors mentioning `debug/index.vue` or `DebugExerciseCard`.

- [ ] **Step 3: Render-check in the dev server**

Start `npm run dev`, open `http://localhost:3000/debug`. Confirm:
- Exercise count shows in the header.
- Buggy code, Input/Expected/Actual, and 3–4 choice buttons render.
- Clicking a wrong choice turns it red, marks the correct one green, shows the explanation alert, and locks further selection.
- Clicking choices across two exercises updates the "x/y correct" chip.
- Selecting a Pattern and Bug-type filter narrows the list.

- [ ] **Step 4: Commit**

```bash
git add app/pages/debug/index.vue
git commit -m "feat(debug): add /debug page with filters and session score"
```

---

## Task 5: Add the nav link

**Files:**
- Modify: `app/layouts/default.vue`

**Interfaces:**
- Consumes: existing `links` array in the layout.
- Produces: a `Debug` entry in the top nav between Practice and Tracker.

- [ ] **Step 1: Add the link**

In `app/layouts/default.vue`, modify the `links` array:

```ts
const links = [
  { label: 'Study Path', to: '/path' },
  { label: 'Patterns', to: '/patterns' },
  { label: 'Practice', to: '/practice' },
  { label: 'Debug', to: '/debug' },
  { label: 'Tracker', to: '/tracker' },
]
```

- [ ] **Step 2: Verify the link in the dev server**

With `npm run dev` running, load any page and confirm a "Debug" item appears in the top bar between Practice and Tracker, that clicking it navigates to `/debug`, and that it shows the active-link highlight when on `/debug`.

- [ ] **Step 3: Commit**

```bash
git add app/layouts/default.vue
git commit -m "feat(debug): add Debug to top navigation"
```

---

## Self-Review

**Spec coverage:**
- Page at `/debug`, explain-the-bug format → Tasks 3, 4. ✓
- Buggy code + failing case (input/expected/actual) → `DebugExercise` fields (Task 1), card render (Task 3). ✓
- Multiple choice, one correct, immediate feedback + explanation reveal → Task 3 card logic. ✓
- Filter by pattern OR bug-type → Task 4 page. ✓
- Session-only score, no progress.json writes → Task 4 `results` ref; Global Constraints. ✓
- Both dimensions tagged; bug-type bounded enum (~2 each) → Task 1 type, Task 2 authoring + Step 4 count check. ✓
- ~13 exercises tied to existing patterns → Task 2 table + Step 3 patternId validation. ✓
- Backend touched for content-serving only → Task 1 (content.get.ts, debug-exercises.json); no progress changes anywhere. ✓
- Verification gate (run snippets with node before shipping) → Task 1 Step 4, Task 2 Steps 2–4. ✓
- Component to keep page focused; nav link → Tasks 3, 5. ✓

**Placeholder scan:** Task 2 Step 1 authors content from the table spec rather than inlining 12 full JSON objects — this is creative content work, but every exercise has an exact pattern, bug-type, defect, and failing input specified, plus mandatory per-exercise `node` verification (Steps 2–4) that fails loudly on bad content. No "add error handling"-style placeholders elsewhere.

**Type consistency:** `DebugExercise`/`DebugChoice`/`BugType` field names are identical across Task 1 (definition), Task 3 (`exercise.buggyCode`, `.choices`, `.explanation`, `.failingInput`, `.expected`, `.actual`, `.patternId`, `.bugType`), and Task 4 (`.debugExercises`, `.patternId`, `.bugType`). Emit signature `answered(correct: boolean)` matches between card (Task 3) and page handler (Task 4). ✓
