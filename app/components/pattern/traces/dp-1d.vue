<script setup lang="ts">
const mode = ref<'climbing-stairs' | 'house-robber'>('house-robber')
const inputNums = ref('2,7,9,3,1')
const inputN = ref('6')

const warning = computed(() => {
  if (mode.value === 'house-robber') {
    const nums = inputNums.value.split(',').map(s => Number(s.trim()))
    if (nums.some(isNaN) || nums.length < 1) return 'Enter comma-separated numbers.'
  } else {
    if (isNaN(Number(inputN.value)) || Number(inputN.value) < 1) return 'Enter a positive integer n.'
  }
  return ''
})

interface TraceStep {
  description: string
  dp: number[]
  currentIdx: number
  prev1: number
  prev2: number
}

function buildRobberSteps(nums: number[]): TraceStep[] {
  const steps: TraceStep[] = []
  let prev2 = 0, prev1 = 0
  const dp: number[] = []

  steps.push({ description: 'Start. prev2=0, prev1=0 (no houses yet).', dp: [], currentIdx: -1, prev1, prev2 })

  for (let i = 0; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i])
    dp.push(curr)
    steps.push({
      description: `House ${i} (val=${nums[i]}): max(skip=${prev1}, rob=${prev2}+${nums[i]}=${prev2 + nums[i]}) = ${curr}. prev2=${prev1}, prev1=${curr}.`,
      dp: [...dp], currentIdx: i, prev1: curr, prev2: prev1,
    })
    prev2 = prev1
    prev1 = curr
  }

  steps.push({ description: `Done. Max loot = ${prev1}.`, dp: [...dp], currentIdx: -1, prev1, prev2 })
  return steps
}

function buildStairsSteps(n: number): TraceStep[] {
  const steps: TraceStep[] = []
  if (n <= 2) {
    steps.push({ description: `n=${n} ≤ 2, return ${n} directly.`, dp: [n], currentIdx: 0, prev1: n, prev2: 0 })
    return steps
  }
  let prev2 = 1, prev1 = 2
  const dp = [1, 2]
  steps.push({ description: 'Base cases: dp[1]=1 (1 way for 1 stair), dp[2]=2 (2 ways for 2 stairs).', dp: [...dp], currentIdx: 1, prev1, prev2 })

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2
    dp.push(curr)
    steps.push({
      description: `dp[${i}] = dp[${i-1}](${prev1}) + dp[${i-2}](${prev2}) = ${curr}.`,
      dp: [...dp], currentIdx: dp.length - 1, prev1: curr, prev2: prev1,
    })
    prev2 = prev1
    prev1 = curr
  }

  steps.push({ description: `Done. Ways to climb ${n} stairs = ${prev1}.`, dp: [...dp], currentIdx: -1, prev1, prev2 })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  if (mode.value === 'house-robber') {
    return buildRobberSteps(inputNums.value.split(',').map(s => Number(s.trim())))
  } else {
    return buildStairsSteps(Number(inputN.value))
  }
})

const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch([mode, inputNums, inputN], () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>

      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-4">
        <v-btn value="house-robber" size="small">House Robber</v-btn>
        <v-btn value="climbing-stairs" size="small">Climbing Stairs</v-btn>
      </v-btn-toggle>

      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field v-if="mode === 'house-robber'" v-model="inputNums" label="house values" density="compact" style="max-width:260px" hide-details />
        <v-text-field v-else v-model="inputN" label="n (stairs)" density="compact" style="max-width:120px" hide-details />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>

      <template v-if="!warning && currentStep">
        <div class="map-label mb-1">dp table</div>
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div v-if="currentStep.dp.length === 0" class="text-caption text-medium-emphasis">[ ]</div>
          <div v-for="(val, i) in currentStep.dp" :key="i" class="array-cell"
            :class="{ 'array-cell--active': currentStep.currentIdx === i }">
            <span class="array-cell__val">{{ val }}</span>
            <span class="array-cell__idx">[{{ i + 1 }}]</span>
          </div>
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
.array-cell { display: flex; flex-direction: column; align-items: center; width: 44px; padding: 6px 4px; border-radius: 6px; border: 1px solid rgba(var(--v-theme-on-surface), 0.15); background: rgba(var(--v-theme-on-surface), 0.04); transition: background 0.2s; }
.array-cell--active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.15); }
.array-cell__val { font-size: 0.9rem; font-weight: 700; }
.array-cell__idx { font-size: 0.6rem; opacity: 0.5; }
</style>
