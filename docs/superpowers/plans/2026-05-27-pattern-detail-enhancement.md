# Pattern Detail Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the pattern detail page with professor-style explanations (intuition, complexity, worked example, when-not-to-use) and an interactive step-through trace for the Frequency Map pattern.

**Architecture:** Add 4 new optional fields to the `Pattern` type and `patterns.json` (populated fully for `frequency-map`, empty stubs for the rest). Add 4 small display components and one dedicated trace component (`traces/frequency-map.vue`) that generates steps from reactive string inputs and animates bucket state. Enhance `[id].vue` to render the new sections; trace is lazy-loaded by pattern id so missing traces render nothing.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Vuetify 3, TypeScript, CSS transitions (no animation library)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `app/types/index.ts` | Add new optional fields to `Pattern` interface |
| Modify | `server/data/patterns.json` | Add new fields; full content for `frequency-map`, stubs for rest |
| Create | `app/components/pattern/PatternIntuition.vue` | Render intuition prose; hidden if empty |
| Create | `app/components/pattern/PatternComplexity.vue` | Render time/space badges + explanation; hidden if empty |
| Create | `app/components/pattern/PatternWorkedExample.vue` | Render input + numbered steps; hidden if empty |
| Create | `app/components/pattern/PatternWhenNotToUse.vue` | Render bullet list; hidden if empty |
| Create | `app/components/pattern/traces/frequency-map.vue` | Interactive stepper for frequency-map |
| Modify | `app/pages/patterns/[id].vue` | Add new sections + lazy-load trace by pattern id |

---

## Task 1: Extend the Pattern type

**Files:**
- Modify: `app/types/index.ts`

- [ ] **Step 1: Add new optional fields to the Pattern interface**

Open `app/types/index.ts` and replace the `Pattern` interface with:

```ts
export interface PatternComplexity {
  time: string
  space: string
  explanation: string
}

export interface PatternWorkedExample {
  input: string
  steps: string[]
}

export interface Pattern {
  id: string
  name: string
  triggers: string[]
  whatItGives: string
  invariant: string
  jsSkeleton: string
  failureModes: string[]
  contrastCases: string[]
  relatedProblems: string[]
  // New fields — all optional so existing patterns without content still type-check
  intuition?: string
  complexity?: PatternComplexity
  workedExample?: PatternWorkedExample
  whenNotToUse?: string[]
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
cd /Users/slukehart/Documents/Github/LeetCode_Prep/tracker && npx nuxi typecheck 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to Pattern).

- [ ] **Step 3: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: add optional learning fields to Pattern type"
```

---

## Task 2: Add new fields to patterns.json

**Files:**
- Modify: `server/data/patterns.json`

- [ ] **Step 1: Add full content to the `frequency-map` entry**

Find the object with `"id": "frequency-map"` in `server/data/patterns.json` and add these fields after `"relatedProblems"`:

```json
"intuition": "A frequency map answers one question: how many times did each value appear? The key insight is that two strings are anagrams if and only if they have identical frequency distributions — \"anagram\" and \"nagaram\" both produce {a:3, g:1, n:1, r:1, m:1}.\n\nThe trick that makes this O(n) instead of O(n²) is that counting is a one-pass operation. You iterate s once to build the counts, then iterate t once to cancel them out. If every count returns to zero, the distributions matched exactly.\n\nWhen the key space is small and fixed (26 lowercase letters), you can use a plain array of size 26 instead of a Map — count[c.charCodeAt(0) - 'a'.charCodeAt(0)] — which is faster in practice because array access is cache-friendly and avoids hash computation.",
"complexity": {
  "time": "O(n)",
  "space": "O(1)",
  "explanation": "Two linear passes over strings of length n. Space is O(1) because the count array is always size 26 regardless of input size — it is bounded by the alphabet, not the input."
},
"workedExample": {
  "input": "s = \"anagram\", t = \"nagaram\"",
  "steps": [
    "Early exit: both strings have length 7. Continue.",
    "Pass 1 — count s: a→3, n→1, g→1, r→1, m→1. All other buckets stay 0.",
    "Pass 2 — subtract t (n,a,g,a,r,a,m): n→0, a→2→1→0, g→0, r→0, m→0.",
    "Final check: every bucket is 0. Return true — anagram confirmed."
  ]
},
"whenNotToUse": [
  "Pure existence check (has anything repeated?) — a Set is enough; no counts needed. See: Contains Duplicate.",
  "You need to group many strings by equivalence — use Canonical Key Grouping; the frequency array becomes the canonical key.",
  "Unicode or multi-byte input — a fixed 26-slot array breaks. Use a Map keyed on the full character instead."
]
```

- [ ] **Step 2: Add empty stubs to all other 16 patterns**

For every other pattern object in `patterns.json` (all entries where `"id"` is NOT `"frequency-map"`), add these four stub fields after `"relatedProblems"`:

```json
"intuition": "",
"complexity": null,
"workedExample": null,
"whenNotToUse": []
```

Do this for: `hash-map-complement`, `two-pointers`, `sliding-window`, `bfs-queue`, `dfs-cycle-detection`, `set-membership`, `canonical-key-grouping`, `stack-matching`, `tree-dfs`, `grid-flood-fill`, `prefix-suffix-products`, `heap-top-k`, `backtracking`, `dp-1d`, `binary-search`, `linked-list-traversal`, `graph-traversal`.

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('server/data/patterns.json','utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add server/data/patterns.json
git commit -m "feat: add learning content to frequency-map pattern, stubs to rest"
```

---

## Task 3: PatternIntuition component

**Files:**
- Create: `app/components/pattern/PatternIntuition.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <v-card v-if="text" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-3">The Why — Intuition</div>
      <p
        v-for="(para, i) in text.split('\n\n').filter(Boolean)"
        :key="i"
        class="mb-2 text-body-2"
        style="line-height: 1.7"
      >{{ para }}</p>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.section-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/pattern/PatternIntuition.vue
git commit -m "feat: add PatternIntuition component"
```

---

## Task 4: PatternComplexity component

**Files:**
- Create: `app/components/pattern/PatternComplexity.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { PatternComplexity } from '~/types'
defineProps<{ complexity: PatternComplexity | null | undefined }>()
</script>

<template>
  <v-card v-if="complexity" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-3">Complexity</div>
      <div class="d-flex ga-2 mb-3">
        <v-chip color="primary" variant="tonal" size="small">
          Time: {{ complexity.time }}
        </v-chip>
        <v-chip color="secondary" variant="tonal" size="small">
          Space: {{ complexity.space }}
        </v-chip>
      </div>
      <p class="mb-0 text-body-2" style="line-height: 1.7">{{ complexity.explanation }}</p>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.section-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/pattern/PatternComplexity.vue
git commit -m "feat: add PatternComplexity component"
```

---

## Task 5: PatternWorkedExample component

**Files:**
- Create: `app/components/pattern/PatternWorkedExample.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { PatternWorkedExample } from '~/types'
defineProps<{ example: PatternWorkedExample | null | undefined }>()
</script>

<template>
  <v-card v-if="example && example.steps.length" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-3">Worked Example</div>
      <p class="text-body-2 text-medium-emphasis mb-3">
        <strong>Input:</strong> {{ example.input }}
      </p>
      <div
        v-for="(step, i) in example.steps"
        :key="i"
        class="step-row"
      >
        <span class="step-number">{{ i + 1 }}</span>
        <span class="text-body-2" style="line-height: 1.6">{{ step }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.section-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
.step-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.step-row:last-child { border-bottom: none; }
.step-number {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/pattern/PatternWorkedExample.vue
git commit -m "feat: add PatternWorkedExample component"
```

---

## Task 6: PatternWhenNotToUse component

**Files:**
- Create: `app/components/pattern/PatternWhenNotToUse.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
defineProps<{ items: string[] | undefined }>()
</script>

<template>
  <v-card v-if="items && items.length" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-2">When Not To Use</div>
      <div v-for="item in items" :key="item" class="list-row">
        <span class="list-row__dot" />
        <span class="text-body-2" style="line-height: 1.6">{{ item }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.section-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
.list-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px 0;
  line-height: 1.5;
}
.list-row__dot {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-error));
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/pattern/PatternWhenNotToUse.vue
git commit -m "feat: add PatternWhenNotToUse component"
```

---

## Task 7: FrequencyMap interactive trace component

**Files:**
- Create: `app/components/pattern/traces/frequency-map.vue`

This component generates trace steps at runtime from two editable string inputs, then lets the user step forward/backward watching 26 letter buckets animate.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
const inputS = ref('anagram')
const inputT = ref('nagaram')

const warning = computed(() => {
  const valid = /^[a-z]*$/
  if (!valid.test(inputS.value) || !valid.test(inputT.value))
    return 'Inputs must contain only lowercase letters a–z.'
  return ''
})

interface TraceStep {
  description: string
  counts: number[]        // 26 slots, a=0 … z=25
  highlightChar: string   // letter currently being processed, or ''
  highlightPhase: 'add' | 'sub' | 'check' | 'none'
  done: boolean
  isAnagram: boolean | null
}

function buildSteps(s: string, t: string): TraceStep[] {
  const steps: TraceStep[] = []
  const counts = new Array(26).fill(0)
  const a = 'a'.charCodeAt(0)

  // Step 0: initial state
  steps.push({
    description: 'Initial state — all 26 buckets at 0. Ready to count letters in s.',
    counts: [...counts],
    highlightChar: '',
    highlightPhase: 'none',
    done: false,
    isAnagram: null,
  })

  // Pass 1: count s
  for (const c of s) {
    const idx = c.charCodeAt(0) - a
    counts[idx]++
    steps.push({
      description: `Processing s[${steps.length - 1}] = '${c}' → bucket '${c}' goes to ${counts[idx]}.`,
      counts: [...counts],
      highlightChar: c,
      highlightPhase: 'add',
      done: false,
      isAnagram: null,
    })
  }

  // Transition
  steps.push({
    description: `Finished counting s. Now subtracting each letter in t to cancel matches.`,
    counts: [...counts],
    highlightChar: '',
    highlightPhase: 'none',
    done: false,
    isAnagram: null,
  })

  // Pass 2: subtract t
  for (const c of t) {
    const idx = c.charCodeAt(0) - a
    counts[idx]--
    steps.push({
      description: `Processing t[${steps.length - s.length - 2}] = '${c}' → bucket '${c}' goes to ${counts[idx]}.`,
      counts: [...counts],
      highlightChar: c,
      highlightPhase: 'sub',
      done: false,
      isAnagram: null,
    })
  }

  // Final check
  const allZero = counts.every(n => n === 0)
  const firstNonZero = counts.findIndex(n => n !== 0)
  const resultChar = firstNonZero >= 0 ? String.fromCharCode(a + firstNonZero) : ''
  steps.push({
    description: allZero
      ? `All 26 buckets are 0 — every letter matched. ✓ "${s}" and "${t}" are anagrams.`
      : `Bucket '${resultChar}' is ${counts[firstNonZero]} (not 0) — counts don't match. ✗ Not anagrams.`,
    counts: [...counts],
    highlightChar: resultChar,
    highlightPhase: 'check',
    done: true,
    isAnagram: allZero,
  })

  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  return buildSteps(inputS.value, inputT.value)
})

const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)

// flash state: letter → 'add' | 'sub' | null
const flashMap = ref<Record<string, 'add' | 'sub' | 'check' | null>>({})

watch(stepIndex, async (newIdx) => {
  const step = steps.value[newIdx]
  if (!step || !step.highlightChar || step.highlightPhase === 'none') {
    flashMap.value = {}
    return
  }
  flashMap.value = { [step.highlightChar]: step.highlightPhase }
  await nextTick()
  setTimeout(() => { flashMap.value = {} }, 400)
})

watch([inputS, inputT], () => { stepIndex.value = 0 })

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>

      <!-- Inputs -->
      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field
          v-model="inputS"
          label="s"
          density="compact"
          style="max-width: 200px"
          hide-details
        />
        <v-text-field
          v-model="inputT"
          label="t"
          density="compact"
          style="max-width: 200px"
          hide-details
        />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">
        {{ warning }}
      </v-alert>

      <template v-if="!warning && currentStep">
        <!-- Buckets -->
        <div class="buckets mb-4">
          <div
            v-for="(letter, i) in letters"
            :key="letter"
            class="bucket"
            :class="{
              'bucket--add': flashMap[letter] === 'add',
              'bucket--sub': flashMap[letter] === 'sub',
              'bucket--check': flashMap[letter] === 'check',
              'bucket--nonzero': currentStep.counts[i] !== 0,
            }"
          >
            <span class="bucket__count">{{ currentStep.counts[i] }}</span>
            <span class="bucket__label">{{ letter }}</span>
          </div>
        </div>

        <!-- Step description -->
        <v-card
          variant="tonal"
          :color="currentStep.done ? (currentStep.isAnagram ? 'success' : 'error') : 'primary'"
          class="mb-4"
        >
          <v-card-text class="text-body-2 py-2">
            <strong>Step {{ stepIndex + 1 }} / {{ steps.length }}</strong> — {{ currentStep.description }}
          </v-card-text>
        </v-card>

        <!-- Controls -->
        <div class="d-flex ga-2 align-center">
          <v-btn size="small" variant="outlined" :disabled="stepIndex === 0" @click="prev">← Prev</v-btn>
          <v-btn size="small" variant="outlined" :disabled="stepIndex === steps.length - 1" @click="next">Next →</v-btn>
          <v-btn size="small" variant="text" @click="reset">Reset</v-btn>
          <span class="text-caption text-medium-emphasis ml-2">{{ stepIndex + 1 }} / {{ steps.length }}</span>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.section-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
.buckets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.bucket {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  padding: 4px 2px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  transition: background 0.25s ease, transform 0.15s ease;
}
.bucket--add {
  background: rgba(var(--v-theme-success), 0.3);
  transform: scale(1.15);
}
.bucket--sub {
  background: rgba(var(--v-theme-error), 0.3);
  transform: scale(1.15);
}
.bucket--check {
  background: rgba(var(--v-theme-warning), 0.3);
  transform: scale(1.15);
}
.bucket--nonzero {
  background: rgba(var(--v-theme-primary), 0.12);
}
.bucket__count {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-surface));
}
.bucket__label {
  font-size: 0.65rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/pattern/traces/frequency-map.vue
git commit -m "feat: add interactive trace component for frequency-map"
```

---

## Task 8: Wire everything into [id].vue

**Files:**
- Modify: `app/pages/patterns/[id].vue`

- [ ] **Step 1: Replace the full contents of `app/pages/patterns/[id].vue`**

```vue
<script setup lang="ts">
import type { PatternStatus } from '~/types'

const route = useRoute()
const { data: content } = await useContent()
const { progress, setPatternStatus } = useProgress()

const pattern = computed(() => content.value?.patterns.find(p => p.id === route.params.id))
const statuses: PatternStatus[] = ['to-learn', 'learning', 'learned']
const current = computed<PatternStatus>(() =>
  pattern.value ? (progress.value.patternStatus[pattern.value.id] ?? 'to-learn') : 'to-learn',
)

function onStatusChange(value: unknown) {
  if (pattern.value && value) setPatternStatus(pattern.value.id, value as PatternStatus)
}

// Lazy-load trace component by pattern id — resolves to null if no trace exists yet
const traceComponent = computed(() => {
  if (!pattern.value) return null
  return defineAsyncComponent({
    loader: () => import(`../../components/pattern/traces/${pattern.value!.id}.vue`),
    errorComponent: { template: '<span />' },
    onError: () => {},
  })
})
</script>

<template>
  <div v-if="pattern">
    <v-btn variant="text" size="small" to="/patterns" class="mb-2 px-1 text-medium-emphasis">&larr; All patterns</v-btn>
    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-6">
      <h1 class="text-h5 font-weight-bold">{{ pattern.name }}</h1>
      <v-btn-toggle
        :model-value="current"
        mandatory
        density="comfortable"
        variant="outlined"
        color="primary"
        divided
        rounded="lg"
        @update:model-value="onStatusChange"
      >
        <v-btn v-for="s in statuses" :key="s" :value="s" size="small" class="text-capitalize">{{ s.replace('-', ' ') }}</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Intuition -->
    <PatternIntuition v-if="pattern.intuition" :text="pattern.intuition" />

    <!-- Worked Example -->
    <PatternWorkedExample v-if="pattern.workedExample" :example="pattern.workedExample" />

    <!-- Interactive Trace -->
    <component :is="traceComponent" v-if="traceComponent" />

    <!-- JS Skeleton -->
    <div class="section-label mb-2">JS skeleton</div>
    <CodeBlock :code="pattern.jsSkeleton" class="mb-4" />

    <!-- Complexity -->
    <PatternComplexity v-if="pattern.complexity" :complexity="pattern.complexity" />

    <!-- Triggers -->
    <v-card variant="elevated" elevation="2" class="mb-4">
      <v-card-text>
        <div class="section-label mb-2">Triggers</div>
        <div v-for="t in pattern.triggers" :key="t" class="list-row">
          <span class="list-row__dot" />
          <span>{{ t }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Invariant -->
    <v-card variant="elevated" elevation="2" class="mb-4">
      <v-card-text>
        <div class="section-label mb-2">Invariant</div>
        <p class="mb-0">{{ pattern.invariant }}</p>
      </v-card-text>
    </v-card>

    <!-- Failure Modes -->
    <v-card variant="elevated" elevation="2" class="mb-4">
      <v-card-text>
        <div class="section-label mb-2">Failure modes</div>
        <div v-for="f in pattern.failureModes" :key="f" class="list-row">
          <span class="list-row__dot list-row__dot--warn" />
          <span>{{ f }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- When Not To Use -->
    <PatternWhenNotToUse v-if="pattern.whenNotToUse" :items="pattern.whenNotToUse" />

    <!-- Contrast Cases -->
    <v-card variant="elevated" elevation="2">
      <v-card-text>
        <div class="section-label mb-2">Contrast cases</div>
        <div v-for="c in pattern.contrastCases" :key="c" class="list-row">
          <span class="list-row__dot list-row__dot--accent" />
          <span>{{ c }}</span>
        </div>
      </v-card-text>
    </v-card>
  </div>
  <div v-else class="text-medium-emphasis py-8">Pattern not found.</div>
</template>

<style scoped>
.section-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
.list-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px 0;
  line-height: 1.5;
}
.list-row__dot {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
}
.list-row__dot--warn { background: rgb(var(--v-theme-warning)); }
.list-row__dot--accent { background: rgb(var(--v-theme-accent)); }
</style>
```

- [ ] **Step 2: Verify the dev server runs without errors**

```bash
cd /Users/slukehart/Documents/Github/LeetCode_Prep/tracker && npm run dev 2>&1 &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/patterns/frequency-map
```

Expected: `200`

- [ ] **Step 3: Smoke-check all 4 new sections appear on frequency-map**

Open `http://localhost:3000/patterns/frequency-map` and verify:
1. "The Why — Intuition" card appears with 3 paragraphs
2. "Worked Example" card appears with 4 numbered steps
3. Interactive trace appears with 26 letter buckets and Prev/Next/Reset controls
4. "Complexity" card appears with Time: O(n) and Space: O(1) badges
5. "When Not To Use" card appears with 3 bullets

- [ ] **Step 4: Smoke-check a pattern without content shows no broken UI**

Open `http://localhost:3000/patterns/hash-map-complement` and verify:
- The 4 new sections do NOT appear (they are empty/null in JSON)
- Existing sections (Triggers, Invariant, JS skeleton, Failure modes, Contrast cases) still render correctly

- [ ] **Step 5: Commit**

```bash
git add app/pages/patterns/[id].vue
git commit -m "feat: wire enhanced pattern detail sections and lazy-load trace"
```

---

## Task 9: Verify interactive trace behavior

- [ ] **Step 1: Test default inputs (anagram / nagaram)**

On `http://localhost:3000/patterns/frequency-map`:
- Click Next repeatedly — buckets should fill for "anagram" then drain for "nagaram"
- Last step should show green "✓ anagrams" message
- All buckets should read 0 at the final step

- [ ] **Step 2: Test a non-anagram (rat / car)**

Change inputs to `s=rat`, `t=car`:
- Buckets for r, a, t should increment then decrement correctly
- Final step should show green "✓ anagrams" (rat/car are anagrams)

- [ ] **Step 3: Test a true non-anagram (rat / dog)**

Change inputs to `s=rat`, `t=dog`:
- Final step should show red "✗ Not anagrams" with a nonzero bucket highlighted

- [ ] **Step 4: Test invalid input**

Type `Hello` (capital H) in the s field:
- Warning "Inputs must contain only lowercase letters a–z." should appear
- Buckets and controls should hide

- [ ] **Step 5: Test Reset**

Step forward a few steps, hit Reset — should jump back to step 1 with all buckets at 0

- [ ] **Step 6: Commit verification note**

```bash
git commit --allow-empty -m "chore: interactive trace manually verified"
```
