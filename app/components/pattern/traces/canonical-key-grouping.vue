<script setup lang="ts">
const inputStrs = ref('eat,tea,tan,ate,nat,bat')

const warning = computed(() => {
  const strs = inputStrs.value.split(',').map(s => s.trim())
  if (strs.some(s => s === '' || !/^[a-z]+$/.test(s))) return 'Enter comma-separated lowercase words.'
  return ''
})

interface TraceStep {
  description: string
  groups: Record<string, string[]>
  currentWord: string
  currentKey: string
}

function buildSteps(strs: string[]): TraceStep[] {
  const steps: TraceStep[] = []
  const groups: Record<string, string[]> = {}

  steps.push({ description: 'Start. groups map is empty.', groups: {}, currentWord: '', currentKey: '' })

  for (const word of strs) {
    const key = word.split('').sort().join('')
    if (!groups[key]) groups[key] = []
    groups[key].push(word)
    steps.push({
      description: `"${word}" → sorted key "${key}". Add to groups["${key}"] = [${groups[key].map(w => `"${w}"`).join(', ')}].`,
      groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, [...v]])),
      currentWord: word, currentKey: key,
    })
  }

  steps.push({
    description: `Done! ${Object.keys(groups).length} group(s): ${Object.values(groups).map(g => '[' + g.join(',') + ']').join(', ')}.`,
    groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, [...v]])),
    currentWord: '', currentKey: '',
  })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  const strs = inputStrs.value.split(',').map(s => s.trim())
  return buildSteps(strs)
})

const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch(inputStrs, () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }

const palette = ['primary', 'secondary', 'accent', 'success', 'warning']
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>
      <div class="d-flex ga-3 mb-4">
        <v-text-field v-model="inputStrs" label="words (comma-separated)" density="compact" style="max-width:340px" hide-details />
      </div>
      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>
      <template v-if="!warning && currentStep">
        <!-- Groups -->
        <div class="map-label mb-2">groups map</div>
        <div class="d-flex ga-2 flex-wrap mb-4">
          <div v-if="Object.keys(currentStep.groups).length === 0" class="text-caption text-medium-emphasis">{ }</div>
          <v-chip
            v-for="(words, key, idx) in currentStep.groups"
            :key="key"
            :color="palette[idx % palette.length]"
            variant="tonal"
            size="small"
            :class="{ 'chip--active': currentStep.currentKey === key }"
          >
            "{{ key }}" → [{{ words.join(', ') }}]
          </v-chip>
        </div>
        <v-card variant="tonal" :color="stepIndex === steps.length - 1 ? 'success' : 'primary'" class="mb-4">
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
.chip--active { outline: 2px solid currentColor; }
</style>
