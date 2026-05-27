<script setup lang="ts">
const inputNums = ref('1,1,1,2,2,3')
const inputK = ref('2')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  if (nums.some(isNaN)) return 'Enter comma-separated integers.'
  const k = Number(inputK.value.trim())
  if (isNaN(k) || k < 1 || k > nums.length) return `k must be between 1 and ${nums.length}.`
  return ''
})

interface TraceStep {
  description: string
  freq: Record<number, number>
  sorted: [number, number][]
  selected: number[]
  phase: 'count' | 'sort' | 'select' | 'done'
  currentVal: number | null
}

function buildSteps(nums: number[], k: number): TraceStep[] {
  const steps: TraceStep[] = []
  const freq: Record<number, number> = {}

  steps.push({ description: 'Phase 1: Build frequency map.', freq: {}, sorted: [], selected: [], phase: 'count', currentVal: null })

  for (const n of nums) {
    freq[n] = (freq[n] ?? 0) + 1
    steps.push({
      description: `Count ${n}: freq[${n}] = ${freq[n]}.`,
      freq: { ...freq }, sorted: [], selected: [], phase: 'count', currentVal: n,
    })
  }

  const sorted = Object.entries(freq).map(([v, c]) => [Number(v), c] as [number, number]).sort((a, b) => b[1] - a[1])
  steps.push({ description: `Phase 2: Sort by frequency desc → [${sorted.map(([v, c]) => `(${v}:${c})`).join(', ')}].`, freq: { ...freq }, sorted: [...sorted], selected: [], phase: 'sort', currentVal: null })

  const selected = sorted.slice(0, k).map(([v]) => v)
  steps.push({ description: `Phase 3: Take top k=${k} → [${selected.join(', ')}]. Done!`, freq: { ...freq }, sorted: [...sorted], selected: [...selected], phase: 'done', currentVal: null })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  return buildSteps(nums, Number(inputK.value.trim()))
})

const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch([inputNums, inputK], () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>
      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field v-model="inputNums" label="nums" density="compact" style="max-width:260px" hide-details />
        <v-text-field v-model="inputK" label="k" density="compact" style="max-width:80px" hide-details />
      </div>
      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>
      <template v-if="!warning && currentStep">
        <div class="map-label mb-1">frequency map</div>
        <div class="d-flex ga-1 flex-wrap mb-3">
          <div v-if="Object.keys(currentStep.freq).length === 0" class="text-caption text-medium-emphasis">{ }</div>
          <div v-for="(count, val) in currentStep.freq" :key="val" class="freq-entry" :class="{ 'freq-entry--active': currentStep.currentVal === Number(val) }">
            {{ val }}: {{ count }}
          </div>
        </div>
        <template v-if="currentStep.sorted.length > 0">
          <div class="map-label mb-1">sorted by freq</div>
          <div class="d-flex ga-1 flex-wrap mb-3">
            <div v-for="([val, count], i) in currentStep.sorted" :key="i" class="freq-entry" :class="{ 'freq-entry--selected': currentStep.selected.includes(val) }">
              {{ val }}: {{ count }}
            </div>
          </div>
        </template>
        <v-card variant="tonal" :color="currentStep.phase === 'done' ? 'success' : 'primary'" class="mb-4">
          <v-card-text class="text-body-2 py-2"><strong>Step {{ stepIndex + 1 }} / {{ steps.length }}</strong> — {{ currentStep.description }}</v-card-text>
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
.section-label { display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgb(var(--v-theme-primary)); border-bottom: 2px solid rgb(var(--v-theme-accent)); padding-bottom: 2px; }
.map-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.freq-entry { padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; background: rgba(var(--v-theme-secondary), 0.1); border: 1px solid rgba(var(--v-theme-secondary), 0.25); }
.freq-entry--active { background: rgba(var(--v-theme-primary), 0.2); border-color: rgb(var(--v-theme-primary)); }
.freq-entry--selected { background: rgba(var(--v-theme-success), 0.2); border-color: rgb(var(--v-theme-success)); }
</style>
