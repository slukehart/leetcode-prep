<script setup lang="ts">
const inputNums = ref('1,2,3')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  if (nums.some(isNaN) || nums.length < 1 || nums.length > 5) return 'Enter 1–5 comma-separated numbers.'
  return ''
})

interface TraceStep {
  description: string
  current: number[]
  result: number[][]
  action: 'push' | 'collect' | 'pop' | 'start' | 'done'
}

function buildSteps(nums: number[]): TraceStep[] {
  const steps: TraceStep[] = []
  const result: number[][] = []
  const current: number[] = []

  steps.push({ description: 'Start. current=[], result=[].', current: [], result: [], action: 'start' })

  function bt(start: number) {
    result.push([...current])
    steps.push({
      description: `Collect subset: [${current.join(', ') || '∅'}] → result has ${result.length} subset(s).`,
      current: [...current], result: result.map(r => [...r]), action: 'collect',
    })
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i])
      steps.push({
        description: `Push ${nums[i]}. current=[${current.join(', ')}]. Recurse from index ${i + 1}.`,
        current: [...current], result: result.map(r => [...r]), action: 'push',
      })
      bt(i + 1)
      const popped = current.pop()
      steps.push({
        description: `Backtrack: pop ${popped}. current=[${current.join(', ') || '∅'}].`,
        current: [...current], result: result.map(r => [...r]), action: 'pop',
      })
    }
  }

  bt(0)
  steps.push({ description: `Done! All ${result.length} subsets: ${result.map(r => '[' + r.join(',') + ']').join(', ')}.`, current: [], result: result.map(r => [...r]), action: 'done' })
  return steps
}

const steps = computed(() => { if (warning.value) return []; return buildSteps(inputNums.value.split(',').map(s => Number(s.trim()))) })
const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch(inputNums, () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Subsets</div>
      <div class="d-flex ga-3 mb-4">
        <v-text-field v-model="inputNums" label="nums (max 5)" density="compact" style="max-width:200px" hide-details />
      </div>
      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>
      <template v-if="!warning && currentStep">
        <div class="d-flex ga-3 mb-4 flex-wrap">
          <div>
            <div class="map-label mb-1">current path</div>
            <div class="d-flex ga-1">
              <div v-if="currentStep.current.length === 0" class="text-caption text-medium-emphasis">[ ∅ ]</div>
              <div v-for="(v, i) in currentStep.current" :key="i" class="path-node"
                :class="{
                  'path-node--push': currentStep.action === 'push' && i === currentStep.current.length - 1,
                  'path-node--pop': currentStep.action === 'pop',
                }">{{ v }}</div>
            </div>
          </div>
          <div>
            <div class="map-label mb-1">result ({{ currentStep.result.length }} subsets)</div>
            <div class="d-flex ga-1 flex-wrap">
              <v-chip v-for="(sub, i) in currentStep.result" :key="i" size="x-small" variant="tonal" color="primary">
                [{{ sub.join(',') || '∅' }}]
              </v-chip>
            </div>
          </div>
        </div>
        <v-card variant="tonal"
          :color="currentStep.action === 'done' ? 'success' : currentStep.action === 'collect' ? 'accent' : currentStep.action === 'pop' ? 'warning' : 'primary'"
          class="mb-4">
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
.path-node { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 0.9rem; font-weight: 700; background: rgba(var(--v-theme-primary), 0.1); border: 1px solid rgba(var(--v-theme-primary), 0.3); transition: background 0.2s; }
.path-node--push { background: rgba(var(--v-theme-success), 0.25); border-color: rgb(var(--v-theme-success)); }
.path-node--pop { background: rgba(var(--v-theme-warning), 0.25); border-color: rgb(var(--v-theme-warning)); }
</style>
