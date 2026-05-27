<script setup lang="ts">
const inputNums = ref('-1,0,3,5,9,12')
const inputTarget = ref('9')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  if (nums.some(isNaN)) return 'Enter comma-separated numbers.'
  if (isNaN(Number(inputTarget.value.trim()))) return 'Target must be a number.'
  return ''
})

interface TraceStep {
  description: string
  left: number
  right: number
  mid: number | null
  found: number | null
}

function buildSteps(nums: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = []
  let left = 0, right = nums.length - 1

  steps.push({ description: `Start. left=0, right=${right}. target=${target}.`, left, right, mid: null, found: null })

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) {
      steps.push({ description: `mid=${mid} (val ${nums[mid]}) = target. ✓ Found at index ${mid}!`, left, right, mid, found: mid })
      return steps
    } else if (nums[mid] < target) {
      steps.push({ description: `mid=${mid} (val ${nums[mid]}) < ${target} → eliminate left half. left = ${mid + 1}.`, left, right, mid, found: null })
      left = mid + 1
    } else {
      steps.push({ description: `mid=${mid} (val ${nums[mid]}) > ${target} → eliminate right half. right = ${mid - 1}.`, left, right, mid, found: null })
      right = mid - 1
    }
  }

  steps.push({ description: 'Search space exhausted. Target not found. Return -1.', left, right, mid: null, found: -1 })
  return steps
}

const nums = computed(() => warning.value ? [] : inputNums.value.split(',').map(s => Number(s.trim())))
const steps = computed(() => { if (warning.value) return []; return buildSteps(nums.value, Number(inputTarget.value.trim())) })
const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch([inputNums, inputTarget], () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>
      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field v-model="inputNums" label="sorted nums" density="compact" style="max-width:280px" hide-details />
        <v-text-field v-model="inputTarget" label="target" density="compact" style="max-width:100px" hide-details />
      </div>
      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>
      <template v-if="!warning && currentStep">
        <div class="pointer-row mb-1">
          <div v-for="(_, i) in nums" :key="i" class="pointer-cell">
            <span v-if="currentStep.mid === i" class="ptr ptr--mid">M</span>
            <span v-else-if="currentStep.left === i" class="ptr ptr--left">L</span>
            <span v-else-if="currentStep.right === i" class="ptr ptr--right">R</span>
            <span v-else class="ptr ptr--empty"> </span>
          </div>
        </div>
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div v-for="(n, i) in nums" :key="i" class="array-cell"
            :class="{
              'array-cell--active': i >= currentStep.left && i <= currentStep.right && currentStep.found === null,
              'array-cell--mid': currentStep.mid === i && currentStep.found === null,
              'array-cell--found': currentStep.found === i,
              'array-cell--eliminated': i < currentStep.left || i > currentStep.right,
            }">
            <span class="array-cell__val">{{ n }}</span>
            <span class="array-cell__idx">[{{ i }}]</span>
          </div>
        </div>
        <v-card variant="tonal" :color="currentStep.found !== null ? (currentStep.found >= 0 ? 'success' : 'error') : 'primary'" class="mb-4">
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
.pointer-row { display: flex; gap: 4px; }
.pointer-cell { width: 44px; display: flex; justify-content: center; }
.ptr { font-size: 0.6rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; }
.ptr--left { background: rgba(var(--v-theme-primary), 0.2); color: rgb(var(--v-theme-primary)); }
.ptr--right { background: rgba(var(--v-theme-secondary), 0.2); color: rgb(var(--v-theme-secondary)); }
.ptr--mid { background: rgba(var(--v-theme-warning), 0.3); color: rgb(var(--v-theme-warning)); }
.ptr--empty { opacity: 0; }
.array-cell { display: flex; flex-direction: column; align-items: center; width: 44px; padding: 6px 4px; border-radius: 6px; border: 1px solid rgba(var(--v-theme-on-surface), 0.15); background: rgba(var(--v-theme-on-surface), 0.04); transition: background 0.2s, opacity 0.2s; }
.array-cell--active { background: rgba(var(--v-theme-primary), 0.06); }
.array-cell--mid { border-color: rgb(var(--v-theme-warning)); background: rgba(var(--v-theme-warning), 0.15); }
.array-cell--found { border-color: rgb(var(--v-theme-success)); background: rgba(var(--v-theme-success), 0.15); }
.array-cell--eliminated { opacity: 0.25; }
.array-cell__val { font-size: 0.9rem; font-weight: 700; }
.array-cell__idx { font-size: 0.6rem; opacity: 0.5; }
</style>
