# Pattern Detail Enhancement — Design Spec
**Date:** 2026-05-27  
**Status:** Approved

---

## Goal

Enhance each pattern detail page from a terse reference card into a full professor-style learning module. A student should be able to open a pattern, understand *why* it works from first principles, step through a live interactive trace on their own input, and know exactly when to reach for it — and when not to.

---

## Scope

- **Phase 1 (this spec):** Full implementation for `frequency-map`. All other 17 patterns get data stubs (empty strings / empty arrays) so the UI doesn't break when fields are missing.
- **Phase 2 (future):** Fill in content and build dedicated trace components for remaining patterns.

---

## Data Shape — `patterns.json`

Four new fields added to every pattern object. Only `frequency-map` gets real content in Phase 1; all others get stubs.

```json
{
  "intuition": "string — 2-3 paragraph mental model explanation",
  "complexity": {
    "time": "O(n)",
    "space": "O(k)",
    "explanation": "string — why, not just the answer"
  },
  "workedExample": {
    "input": "string — e.g. s = 'anagram', t = 'nagaram'",
    "steps": ["string", "..."]
  },
  "whenNotToUse": ["string", "..."]
}
```

The interactive trace is **not** stored in JSON — it is a Vue component because it requires reactive state.

---

## UI Layout — Pattern Detail Page (`[id].vue`)

Sections in display order:

| Section | Source | Status |
|---|---|---|
| Title + status toggle | existing | unchanged |
| **INTUITION** | `pattern.intuition` | new |
| **WORKED EXAMPLE** | `pattern.workedExample` | new |
| **INTERACTIVE TRACE** | `traces/{id}.vue` | new |
| JS SKELETON | existing | moved below trace |
| **COMPLEXITY** | `pattern.complexity` | new |
| TRIGGERS | existing | unchanged |
| INVARIANT | existing | unchanged |
| FAILURE MODES | existing | unchanged |
| **WHEN NOT TO USE** | `pattern.whenNotToUse` | new |
| CONTRAST CASES | existing | unchanged |

New sections with empty/missing data render nothing (no empty cards, no placeholders).

---

## Component Structure

```
app/components/pattern/
  PatternIntuition.vue        — renders intuition prose
  PatternComplexity.vue       — time/space O() badges + explanation paragraph
  PatternWorkedExample.vue    — numbered step list with input shown above
  PatternWhenNotToUse.vue     — bullet list
  traces/
    frequency-map.vue         — interactive stepper (Phase 1 only)

app/pages/patterns/[id].vue   — enhanced to include new sections
server/data/patterns.json     — new fields added
```

Trace components are lazy-loaded in `[id].vue` by pattern id:

```ts
const traceComponent = computed(() =>
  defineAsyncComponent(() =>
    import(`~/components/pattern/traces/${traceId}.vue`)
      .catch(() => null)
  )
)
```

Patterns without a trace component simply show nothing in the trace slot.

---

## Interactive Trace — `FrequencyMapTrace.vue`

**Behavior:**
- Two editable string inputs, defaulting to `"anagram"` / `"nagaram"`
- A row of 26 labeled buckets (a–z), each displaying its current integer count
- Prev / Next / Reset controls + step counter ("Step 3 of 15") + current step description
- Steps are generated from the input strings at runtime (not hardcoded)

**Step sequence generated from inputs `s` and `t`:**
1. Init — all 26 buckets at 0
2. For each character `c` in `s`: highlight `c` in the input string, animate bucket `c` up (+1, green flash)
3. For each character `c` in `t`: highlight `c` in the input string, animate bucket `c` down (−1, red flash)
4. Final step: scan buckets — if all zero show "✓ Anagram" (green); else highlight first nonzero bucket and show "✗ Not an Anagram" (red)

**Animations:** CSS transitions only (no animation libraries). Bucket highlight is a brief background-color flash via a Vue class binding toggled on/off with `nextTick`.

**Input validation:** if either string contains non-lowercase-alpha characters, show an inline warning and disable the trace.

---

## Content — `frequency-map` Pattern Fields

### intuition
> A frequency map answers one question: *how many times did each value appear?* The key insight is that two strings are anagrams if and only if they are identical frequency distributions — "anagram" and "nagaram" both have {a:3, g:1, n:1, r:1, m:1}.
>
> The trick that makes this O(n) instead of O(n²) is that counting is a one-pass operation. You iterate `s` once to build the counts, then iterate `t` once to cancel them out. If every count returns to zero, the distributions matched exactly.
>
> When the key space is small and fixed (26 lowercase letters), you can use a plain array of size 26 instead of a Map — `count[c.charCodeAt(0) - 'a'.charCodeAt(0)]` — which is faster in practice because array access is cache-friendly and avoids hash computation.

### complexity
```json
{
  "time": "O(n)",
  "space": "O(1)",
  "explanation": "Two linear passes over strings of length n. Space is O(1) because the count array is always size 26 regardless of input size — it's bounded by the alphabet, not the input."
}
```

### workedExample
```json
{
  "input": "s = \"anagram\", t = \"nagaram\"",
  "steps": [
    "Early exit check: both strings have length 7. Continue.",
    "Pass 1 — count s: a→3, n→1, g→1, r→1, m→1. All other buckets stay 0.",
    "Pass 2 — subtract t ('n','a','g','a','r','a','m'): n→0, a→2, g→0, a→1, r→0, a→0, m→0.",
    "Final check: every bucket is 0. Return true."
  ]
}
```

### whenNotToUse
```json
[
  "Pure existence check (has anything repeated?) — a Set is enough; no counts needed. See: Contains Duplicate.",
  "You need to group many strings by equivalence — use Canonical Key Grouping; the frequency array becomes the canonical key.",
  "Unicode input — a fixed 26-slot array breaks. Use a Map keyed on the full character instead."
]
```

---

## Rendering Rules

- **PatternIntuition:** renders only if `pattern.intuition` is a non-empty string.
- **PatternComplexity:** renders only if `pattern.complexity?.time` exists.
- **PatternWorkedExample:** renders only if `pattern.workedExample?.steps?.length > 0`.
- **PatternWhenNotToUse:** renders only if `pattern.whenNotToUse?.length > 0`.
- **Trace slot:** renders only if the async import resolves (catch → null → v-if check).

---

## Out of Scope (Phase 1)

- Trace components for patterns other than `frequency-map`
- Content (intuition, complexity, workedExample, whenNotToUse) for patterns other than `frequency-map`
- Any backend changes — all new data lives in `patterns.json`
- Animations beyond CSS transitions
