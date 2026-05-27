<script setup lang="ts">
const inputNums = ref('1,2,3,4')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  if (nums.some(isNaN) || nums.length < 2) return 'Enter at least 2 comma-separated numbers.'
  return ''
})

interface TraceStep {
  description: string
  result: number[]
  passLabel: string
  currentIdx: number
  prefix: number
  suffix: number
}

function buildSteps(nums: number[]): TraceStep[] {
  const steps: TraceStep[] = []
  const n = nums.length
  const result = new Array(n).fill(1)

  steps.push({ description: `Start. result = [${result.join(', ')}] (all 1s). Will do two passes.`, result: [...result], passLabel: '', currentIdx: -1, prefix: 1, suffix: 1 })

  let prefix = 1
  for (let i = 0; i < n; i++) {
    result[i] = prefix
    steps.push({ description: `Pass 1, i=${i}: result[${i}] = prefix=${prefix}. Then prefix *= nums[${i}]=${nums[i]} → prefix=${prefix * nums[i]}.`, result: [...result], passLabel: 'prefix', currentIdx: i, prefix, suffix: 1 })
    prefix *= nums[i]
  }

  let suffix = 1
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix
    steps.push({ description: `Pass 2, i=${i}: result[${i}] *= suffix=${suffix} → ${result[i]}. Then suffix *= nums[${i}]=${nums[i]} → suffix=${suffix * nums[i]}.`, result: [...result], passLabel: 'suffix', currentIdx: i, prefix, suffix })
    suffix *= nums[i]
  }

  steps.push({ description: `Done! result = [${result.join(', ')}].`, result: [...result], passLabel: 'done', currentIdx: -1, prefix, suffix })
  return steps
}

const nums = computed(() => warning.value ? [] : inputNums.value.split(',').map(s => Number(s.trim())))
const steps = computed(() => { if (warning.value) return []; return buildSteps(nums.value) })
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
      <div class="section-label mb-4">Interactive Trace</div>
      <div class="d-flex ga-3 mb-4">
        <v-text-field v-model="inputNums" label="nums" density="compact" style="max-width:260px" hide-details />
      </div>
      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>
      <template v-if="!warning && currentStep">
        <div class="array-label mb-1">input</div>
        <div class="d-flex ga-1 mb-3 flex-wrap">
          <div v-for="(n, i) in nums" :key="i" class="array-cell" :class="{ 'array-cell--active': currentStep.currentIdx === i }">
            <span class="array-cell__val">{{ n }}</span>
            <span class="array-cell__idx">[{{ i }}]</span>
          </div>
        </div>
        <div class="array-label mb-1">result</div>
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div v-for="(n, i) in currentStep.result" :key="i" class="array-cell"
            :class="{
              'array-cell--prefix': currentStep.passLabel === 'prefix' && currentStep.currentIdx === i,
              'array-cell--suffix': currentStep.passLabel === 'suffix' && currentStep.currentIdx === i,
              'array-cell--done': currentStep.passLabel === 'done',
            }">
            <span class="array-cell__val">{{ n }}</span>
            <span class="array-cell__idx">[{{ i }}]</span>
          </div>
        </div>
        <v-card variant="tonal" :color="currentStep.passLabel === 'done' ? 'success' : currentStep.passLabel === 'suffix' ? 'secondary' : 'primary'" class="mb-4">
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
.array-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.array-cell { display: flex; flex-direction: column; align-items: center; width: 44px; padding: 6px 4px; border-radius: 6px; border: 1px solid rgba(var(--v-theme-on-surface), 0.15); background: rgba(var(--v-theme-on-surface), 0.04); transition: background 0.2s; }
.array-cell--active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.12); }
.array-cell--prefix { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.18); }
.array-cell--suffix { border-color: rgb(var(--v-theme-secondary)); background: rgba(var(--v-theme-secondary), 0.18); }
.array-cell--done { border-color: rgb(var(--v-theme-success)); background: rgba(var(--v-theme-success), 0.1); }
.array-cell__val { font-size: 0.9rem; font-weight: 700; }
.array-cell__idx { font-size: 0.6rem; opacity: 0.5; }
</style>
