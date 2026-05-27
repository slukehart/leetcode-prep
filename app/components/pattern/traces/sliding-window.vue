<script setup lang="ts">
const inputS = ref('abcabcbb')

const warning = computed(() =>
  !/^[a-zA-Z0-9 ]*$/.test(inputS.value) || inputS.value.length === 0
    ? 'Enter a non-empty string.'
    : ''
)

interface TraceStep {
  description: string
  left: number
  right: number
  freq: Record<string, number>
  best: number
  shrinking: boolean
}

function buildSteps(s: string): TraceStep[] {
  const steps: TraceStep[] = []
  let left = 0
  let best = 0
  const freq: Record<string, number> = {}

  steps.push({
    description: `Start. left=0, right=−1, best=0, window empty.`,
    left: 0, right: -1, freq: {}, best: 0, shrinking: false,
  })

  for (let right = 0; right < s.length; right++) {
    const c = s[right]
    freq[c] = (freq[c] ?? 0) + 1

    if (freq[c] > 1) {
      steps.push({
        description: `Expand: right=${right} ('${c}'). freq['${c}']=${freq[c]} — duplicate! Must shrink from left.`,
        left, right, freq: { ...freq }, best, shrinking: true,
      })
      while (freq[c] > 1) {
        const remove = s[left]
        freq[remove]--
        if (freq[remove] === 0) delete freq[remove]
        left++
        steps.push({
          description: `Shrink: removed '${remove}', left=${left}. freq['${c}']=${freq[c] ?? 0}.${freq[c] <= 1 ? ' Window valid.' : ''}`,
          left, right, freq: { ...freq }, best, shrinking: freq[c] > 1,
        })
      }
    } else {
      steps.push({
        description: `Expand: right=${right} ('${c}'). No duplicate. Window = "${s.slice(left, right + 1)}".`,
        left, right, freq: { ...freq }, best, shrinking: false,
      })
    }

    if (right - left + 1 > best) {
      best = right - left + 1
      steps.push({
        description: `New best: window "${s.slice(left, right + 1)}" has length ${best}.`,
        left, right, freq: { ...freq }, best, shrinking: false,
      })
    }
  }

  steps.push({
    description: `Done. Longest substring without repeating characters: ${best}.`,
    left, right: s.length - 1, freq: { ...freq }, best, shrinking: false,
  })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  return buildSteps(inputS.value)
})

const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch(inputS, () => { stepIndex.value = 0 })

function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>

      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field v-model="inputS" label="s" density="compact" style="max-width:300px" hide-details />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>

      <template v-if="!warning && currentStep">
        <!-- Character cells -->
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div
            v-for="(c, i) in inputS.split('')"
            :key="i"
            class="char-cell"
            :class="{
              'char-cell--window': currentStep.right >= 0 && i >= currentStep.left && i <= currentStep.right,
              'char-cell--left': i === currentStep.left,
              'char-cell--right': i === currentStep.right,
              'char-cell--shrink': currentStep.shrinking && i === currentStep.left,
            }"
          >
            <span class="char-cell__val">{{ c }}</span>
            <span class="char-cell__idx">{{ i }}</span>
          </div>
        </div>

        <!-- Window info -->
        <div class="d-flex ga-3 mb-3 flex-wrap">
          <v-chip color="primary" variant="tonal" size="small">Window: "{{ currentStep.right >= 0 ? inputS.slice(currentStep.left, currentStep.right + 1) : '' }}"</v-chip>
          <v-chip color="success" variant="tonal" size="small">Best: {{ currentStep.best }}</v-chip>
        </div>

        <v-card variant="tonal" :color="currentStep.shrinking ? 'warning' : 'primary'" class="mb-4">
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
  display: inline-block; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent)); padding-bottom: 2px;
}
.char-cell {
  display: flex; flex-direction: column; align-items: center;
  width: 36px; padding: 5px 3px; border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.03);
  transition: background 0.2s, border-color 0.2s;
}
.char-cell--window { background: rgba(var(--v-theme-primary), 0.08); }
.char-cell--left { border-left: 3px solid rgb(var(--v-theme-primary)); }
.char-cell--right { border-right: 3px solid rgb(var(--v-theme-secondary)); }
.char-cell--shrink { border-left-color: rgb(var(--v-theme-warning)); background: rgba(var(--v-theme-warning), 0.15); }
.char-cell__val { font-size: 0.95rem; font-weight: 700; font-family: monospace; }
.char-cell__idx { font-size: 0.58rem; opacity: 0.45; }
</style>
