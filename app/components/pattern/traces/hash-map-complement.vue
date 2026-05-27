<script setup lang="ts">
const inputNums = ref('2,7,11,15')
const inputTarget = ref('9')

const warning = computed(() => {
  const nums = inputNums.value.split(',').map(s => s.trim())
  if (nums.some(n => isNaN(Number(n)) || n === '')) return 'Enter comma-separated numbers (e.g. 2,7,11,15).'
  if (isNaN(Number(inputTarget.value.trim()))) return 'Target must be a number.'
  return ''
})

interface TraceStep {
  description: string
  seen: Record<string, number>   // value → index
  currentIdx: number
  need: number | null
  foundPair: [number, number] | null
}

function buildSteps(nums: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = []
  const seen: Record<string, number> = {}

  steps.push({
    description: `Start. Target = ${target}. seen map is empty.`,
    seen: {},
    currentIdx: -1,
    need: null,
    foundPair: null,
  })

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen[need] !== undefined) {
      steps.push({
        description: `i=${i} val=${nums[i]}: need ${need}. ✓ Found! seen[${need}]=${seen[need]}. Return [${seen[need]}, ${i}].`,
        seen: { ...seen },
        currentIdx: i,
        need,
        foundPair: [seen[need], i],
      })
      return steps
    }
    steps.push({
      description: `i=${i} val=${nums[i]}: need ${need}. Not in seen. Insert seen[${nums[i]}]=${i}.`,
      seen: { ...seen },
      currentIdx: i,
      need,
      foundPair: null,
    })
    seen[String(nums[i])] = i
    steps[steps.length - 1].seen = { ...seen }
  }

  steps.push({
    description: 'No pair found. Return [-1, -1].',
    seen: { ...seen },
    currentIdx: -1,
    need: null,
    foundPair: null,
  })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  const nums = inputNums.value.split(',').map(s => Number(s.trim()))
  const target = Number(inputTarget.value.trim())
  return buildSteps(nums, target)
})

const nums = computed(() =>
  warning.value ? [] : inputNums.value.split(',').map(s => Number(s.trim()))
)

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
        <v-text-field v-model="inputNums" label="nums (comma-separated)" density="compact" style="max-width:260px" hide-details />
        <v-text-field v-model="inputTarget" label="target" density="compact" style="max-width:100px" hide-details />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>

      <template v-if="!warning && currentStep">
        <!-- Array visualization -->
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div
            v-for="(n, i) in nums"
            :key="i"
            class="array-cell"
            :class="{
              'array-cell--active': currentStep.currentIdx === i,
              'array-cell--found': currentStep.foundPair && (currentStep.foundPair[0] === i || currentStep.foundPair[1] === i),
            }"
          >
            <span class="array-cell__val">{{ n }}</span>
            <span class="array-cell__idx">[{{ i }}]</span>
          </div>
        </div>

        <!-- Hash map state -->
        <div class="map-label mb-1">seen map</div>
        <div class="d-flex ga-1 flex-wrap mb-4">
          <div v-if="Object.keys(currentStep.seen).length === 0" class="text-caption text-medium-emphasis">{ }</div>
          <div
            v-for="(idx, val) in currentStep.seen"
            :key="val"
            class="map-entry"
            :class="{ 'map-entry--highlight': currentStep.need !== null && String(currentStep.need) === String(val) }"
          >
            {{ val }} → {{ idx }}
          </div>
        </div>

        <!-- Step description -->
        <v-card variant="tonal" :color="currentStep.foundPair ? 'success' : 'primary'" class="mb-4">
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
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  border-bottom: 2px solid rgb(var(--v-theme-accent));
  padding-bottom: 2px;
}
.array-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 44px;
  padding: 6px 4px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.04);
  transition: background 0.2s, border-color 0.2s;
}
.array-cell--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}
.array-cell--found {
  border-color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.15);
}
.array-cell__val { font-size: 0.9rem; font-weight: 700; }
.array-cell__idx { font-size: 0.6rem; opacity: 0.5; }
.map-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
}
.map-entry {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(var(--v-theme-secondary), 0.12);
  border: 1px solid rgba(var(--v-theme-secondary), 0.3);
  transition: background 0.2s;
}
.map-entry--highlight {
  background: rgba(var(--v-theme-success), 0.25);
  border-color: rgb(var(--v-theme-success));
}
</style>
