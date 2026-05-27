<script setup lang="ts">
const inputVals = ref('1,2,3,4,5')

const warning = computed(() => {
  const vals = inputVals.value.split(',').map(s => Number(s.trim()))
  if (vals.some(isNaN) || vals.length < 2) return 'Enter at least 2 comma-separated numbers.'
  return ''
})

interface TraceStep {
  description: string
  nodes: number[]
  prevIdx: number | null
  currIdx: number | null
  reversedUpTo: number
}

function buildSteps(vals: number[]): TraceStep[] {
  const steps: TraceStep[] = []
  const n = vals.length

  steps.push({ description: 'Start. prev=null, curr=head (index 0). Will reverse by rerouting next pointers.', nodes: [...vals], prevIdx: null, currIdx: 0, reversedUpTo: -1 })

  let prevIdx: number | null = null
  let currIdx: number | null = 0

  while (currIdx !== null && currIdx < n) {
    const nextIdx = currIdx + 1 < n ? currIdx + 1 : null
    steps.push({
      description: `Save next=${nextIdx !== null ? vals[nextIdx] : 'null'}. Set node[${currIdx}](${vals[currIdx]}).next → prev(${prevIdx !== null ? vals[prevIdx] : 'null'}). Move prev=${currIdx}, curr=${nextIdx !== null ? nextIdx : 'null'}.`,
      nodes: [...vals],
      prevIdx: currIdx,
      currIdx: nextIdx,
      reversedUpTo: currIdx,
    })
    prevIdx = currIdx
    currIdx = nextIdx
  }

  steps.push({ description: `curr=null → done. New head = node at index ${prevIdx} (val ${vals[prevIdx!]}). Reversed: ${[...vals].reverse().join(' → ')}.`, nodes: [...vals], prevIdx, currIdx: null, reversedUpTo: n - 1 })
  return steps
}

const vals = computed(() => warning.value ? [] : inputVals.value.split(',').map(s => Number(s.trim())))
const steps = computed(() => { if (warning.value) return []; return buildSteps(vals.value) })
const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch(inputVals, () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Reverse Linked List</div>
      <div class="d-flex ga-3 mb-4">
        <v-text-field v-model="inputVals" label="node values" density="compact" style="max-width:260px" hide-details />
      </div>
      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>
      <template v-if="!warning && currentStep">
        <div class="d-flex align-center ga-1 mb-4 flex-wrap">
          <template v-for="(v, i) in vals" :key="i">
            <div class="ll-node"
              :class="{
                'll-node--prev': currentStep.prevIdx === i,
                'll-node--curr': currentStep.currIdx === i,
                'll-node--reversed': i <= currentStep.reversedUpTo,
              }">
              <span class="ll-node__label">{{ currentStep.prevIdx === i ? 'prev' : currentStep.currIdx === i ? 'curr' : '' }}</span>
              <span class="ll-node__val">{{ v }}</span>
            </div>
            <span v-if="i < vals.length - 1" class="ll-arrow">→</span>
          </template>
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
.ll-node { display: flex; flex-direction: column; align-items: center; width: 44px; padding: 4px; border-radius: 8px; border: 1px solid rgba(var(--v-theme-on-surface), 0.15); background: rgba(var(--v-theme-on-surface), 0.04); transition: background 0.2s; }
.ll-node--prev { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.12); }
.ll-node--curr { border-color: rgb(var(--v-theme-secondary)); background: rgba(var(--v-theme-secondary), 0.12); }
.ll-node--reversed { opacity: 0.5; }
.ll-node__label { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; opacity: 0.7; min-height: 10px; }
.ll-node__val { font-size: 0.95rem; font-weight: 700; }
.ll-arrow { font-size: 1rem; opacity: 0.4; }
</style>
