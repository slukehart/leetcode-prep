<script setup lang="ts">
const inputNums = ref('2,7,11,15')
const inputTarget = ref('9')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  if (nums.some(isNaN)) return 'Enter comma-separated numbers.'
  if (isNaN(Number(inputTarget.value.trim()))) return 'Target must be a number.'
  const sorted = [...nums].sort((a, b) => a - b)
  if (sorted.some((n, i) => i > 0 && n < sorted[i - 1])) return ''
  return ''
})

interface TraceStep {
  description: string
  left: number
  right: number
  sum: number | null
  found: boolean
}

function buildSteps(nums: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = []
  let left = 0
  let right = nums.length - 1

  steps.push({
    description: `Start. left=${left} (val ${nums[left]}), right=${right} (val ${nums[right]}). Target=${target}.`,
    left, right, sum: null, found: false,
  })

  while (left < right) {
    const sum = nums[left] + nums[right]
    if (sum === target) {
      steps.push({
        description: `sum = ${nums[left]} + ${nums[right]} = ${sum} = target. ✓ Found! Return [${left + 1}, ${right + 1}].`,
        left, right, sum, found: true,
      })
      return steps
    } else if (sum < target) {
      steps.push({
        description: `sum = ${nums[left]} + ${nums[right]} = ${sum} < ${target}. Too small → move left right.`,
        left, right, sum, found: false,
      })
      left++
    } else {
      steps.push({
        description: `sum = ${nums[left]} + ${nums[right]} = ${sum} > ${target}. Too big → move right left.`,
        left, right, sum, found: false,
      })
      right--
    }
  }

  steps.push({
    description: 'Pointers crossed — no pair found. Return [-1, -1].',
    left, right, sum: null, found: false,
  })
  return steps
}

const nums = computed(() =>
  warning.value ? [] : inputNums.value.split(',').map(s => Number(s.trim()))
)
const steps = computed(() => {
  if (warning.value) return []
  return buildSteps(nums.value, Number(inputTarget.value.trim()))
})

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
        <v-text-field v-model="inputNums" label="sorted nums" density="compact" style="max-width:260px" hide-details />
        <v-text-field v-model="inputTarget" label="target" density="compact" style="max-width:100px" hide-details />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>

      <template v-if="!warning && currentStep">
        <!-- Array with pointer labels -->
        <div class="pointer-row mb-1">
          <div
            v-for="(_, i) in nums"
            :key="i"
            class="pointer-cell"
          >
            <span v-if="currentStep.left === i && currentStep.right === i" class="pointer-tag pointer-tag--both">L/R</span>
            <span v-else-if="currentStep.left === i" class="pointer-tag pointer-tag--left">L</span>
            <span v-else-if="currentStep.right === i" class="pointer-tag pointer-tag--right">R</span>
            <span v-else class="pointer-tag pointer-tag--empty"> </span>
          </div>
        </div>
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div
            v-for="(n, i) in nums"
            :key="i"
            class="array-cell"
            :class="{
              'array-cell--left': currentStep.left === i && !currentStep.found,
              'array-cell--right': currentStep.right === i && !currentStep.found,
              'array-cell--found': currentStep.found && (currentStep.left === i || currentStep.right === i),
            }"
          >
            <span class="array-cell__val">{{ n }}</span>
            <span class="array-cell__idx">[{{ i }}]</span>
          </div>
        </div>

        <v-card variant="tonal" :color="currentStep.found ? 'success' : 'primary'" class="mb-4">
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
.pointer-row { display: flex; gap: 4px; }
.pointer-cell { width: 44px; display: flex; justify-content: center; }
.pointer-tag { font-size: 0.6rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; }
.pointer-tag--left { background: rgba(var(--v-theme-primary), 0.2); color: rgb(var(--v-theme-primary)); }
.pointer-tag--right { background: rgba(var(--v-theme-secondary), 0.2); color: rgb(var(--v-theme-secondary)); }
.pointer-tag--both { background: rgba(var(--v-theme-warning), 0.2); color: rgb(var(--v-theme-warning)); }
.pointer-tag--empty { opacity: 0; }
.array-cell {
  display: flex; flex-direction: column; align-items: center;
  width: 44px; padding: 6px 4px; border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.04);
  transition: background 0.2s, border-color 0.2s;
}
.array-cell--left { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.12); }
.array-cell--right { border-color: rgb(var(--v-theme-secondary)); background: rgba(var(--v-theme-secondary), 0.12); }
.array-cell--found { border-color: rgb(var(--v-theme-success)); background: rgba(var(--v-theme-success), 0.15); }
.array-cell__val { font-size: 0.9rem; font-weight: 700; }
.array-cell__idx { font-size: 0.6rem; opacity: 0.5; }
</style>
