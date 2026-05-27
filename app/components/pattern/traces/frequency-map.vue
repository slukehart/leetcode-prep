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
  counts: number[]
  highlightChar: string
  highlightPhase: 'add' | 'sub' | 'check' | 'none'
  done: boolean
  isAnagram: boolean | null
}

function buildSteps(s: string, t: string): TraceStep[] {
  const steps: TraceStep[] = []
  const counts = new Array(26).fill(0)
  const a = 'a'.charCodeAt(0)

  steps.push({
    description: 'Initial state — all 26 buckets at 0. Ready to count letters in s.',
    counts: [...counts],
    highlightChar: '',
    highlightPhase: 'none',
    done: false,
    isAnagram: null,
  })

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

  steps.push({
    description: `Finished counting s. Now subtracting each letter in t to cancel matches.`,
    counts: [...counts],
    highlightChar: '',
    highlightPhase: 'none',
    done: false,
    isAnagram: null,
  })

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

        <v-card
          variant="tonal"
          :color="currentStep.done ? (currentStep.isAnagram ? 'success' : 'error') : 'primary'"
          class="mb-4"
        >
          <v-card-text class="text-body-2 py-2">
            <strong>Step {{ stepIndex + 1 }} / {{ steps.length }}</strong> — {{ currentStep.description }}
          </v-card-text>
        </v-card>

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
