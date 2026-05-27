<script setup lang="ts">
const inputNums = ref('1,2,3,1')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => s.trim())
  if (nums.some(n => isNaN(Number(n)) || n === '')) return 'Enter comma-separated numbers.'
  return ''
})

interface TraceStep {
  description: string
  seen: Set<number>
  currentIdx: number
  duplicate: number | null
}

function buildSteps(nums: number[]): TraceStep[] {
  const steps: TraceStep[] = []
  const seen = new Set<number>()

  steps.push({
    description: 'Start. seen = {}. Walking the array.',
    seen: new Set(seen),
    currentIdx: -1,
    duplicate: null,
  })

  for (let i = 0; i < nums.length; i++) {
    const n = nums[i]
    if (seen.has(n)) {
      steps.push({
        description: `i=${i} val=${n}: ${n} IS in seen → duplicate found! Return true.`,
        seen: new Set(seen),
        currentIdx: i,
        duplicate: n,
      })
      return steps
    }
    seen.add(n)
    steps.push({
      description: `i=${i} val=${n}: ${n} not in seen → add it. seen = {${[...seen].join(', ')}}.`,
      seen: new Set(seen),
      currentIdx: i,
      duplicate: null,
    })
  }

  steps.push({
    description: 'No duplicates found. Return false.',
    seen: new Set(seen),
    currentIdx: -1,
    duplicate: null,
  })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  return buildSteps(nums)
})

const nums = computed(() =>
  warning.value ? [] : inputNums.value.split(',').map(s => Number(s.trim()))
)

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

      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field v-model="inputNums" label="nums (comma-separated)" density="compact" style="max-width:280px" hide-details />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>

      <template v-if="!warning && currentStep">
        <!-- Array -->
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div
            v-for="(n, i) in nums"
            :key="i"
            class="array-cell"
            :class="{
              'array-cell--active': currentStep.currentIdx === i && !currentStep.duplicate,
              'array-cell--dup': currentStep.duplicate !== null && currentStep.currentIdx === i,
            }"
          >
            <span class="array-cell__val">{{ n }}</span>
            <span class="array-cell__idx">[{{ i }}]</span>
          </div>
        </div>

        <!-- Set state -->
        <div class="map-label mb-1">seen set</div>
        <div class="d-flex ga-1 flex-wrap mb-4">
          <div v-if="currentStep.seen.size === 0" class="text-caption text-medium-emphasis">{ }</div>
          <div
            v-for="val in currentStep.seen"
            :key="val"
            class="set-entry"
            :class="{ 'set-entry--dup': currentStep.duplicate === val }"
          >{{ val }}</div>
        </div>

        <!-- Step description -->
        <v-card variant="tonal" :color="currentStep.duplicate !== null ? 'error' : (stepIndex === steps.length - 1 ? 'success' : 'primary')" class="mb-4">
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
.array-cell {
  display: flex; flex-direction: column; align-items: center;
  width: 44px; padding: 6px 4px; border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.04);
  transition: background 0.2s, border-color 0.2s;
}
.array-cell--active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.12); }
.array-cell--dup { border-color: rgb(var(--v-theme-error)); background: rgba(var(--v-theme-error), 0.15); }
.array-cell__val { font-size: 0.9rem; font-weight: 700; }
.array-cell__idx { font-size: 0.6rem; opacity: 0.5; }
.map-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.set-entry {
  padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
  background: rgba(var(--v-theme-accent), 0.12);
  border: 1px solid rgba(var(--v-theme-accent), 0.3);
  transition: background 0.2s;
}
.set-entry--dup { background: rgba(var(--v-theme-error), 0.25); border-color: rgb(var(--v-theme-error)); }
</style>
