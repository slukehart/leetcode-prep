<script setup lang="ts">
const inputS = ref('({[]})')

const warning = computed(() => {
  if (!/^[()[\]{}]*$/.test(inputS.value) || inputS.value.length === 0)
    return 'Enter a non-empty string of brackets: ( ) [ ] { }'
  return ''
})

interface TraceStep {
  description: string
  stack: string[]
  currentIdx: number
  valid: boolean | null
}

function buildSteps(s: string): TraceStep[] {
  const steps: TraceStep[] = []
  const stack: string[] = []
  const close: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

  steps.push({ description: 'Start. stack = []. Walking the string.', stack: [], currentIdx: -1, valid: null })

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if ('([{'.includes(c)) {
      stack.push(c)
      steps.push({
        description: `i=${i} '${c}' is an open bracket → push. stack = [${stack.join(', ')}].`,
        stack: [...stack], currentIdx: i, valid: null,
      })
    } else {
      const expected = close[c]
      const top = stack[stack.length - 1]
      if (stack.length === 0 || top !== expected) {
        steps.push({
          description: `i=${i} '${c}' is a close. Expected '${expected}' but got '${top ?? 'empty stack'}'. ✗ Invalid!`,
          stack: [...stack], currentIdx: i, valid: false,
        })
        return steps
      }
      stack.pop()
      steps.push({
        description: `i=${i} '${c}' is a close. Popped '${expected}' — matched! stack = [${stack.join(', ')}].`,
        stack: [...stack], currentIdx: i, valid: null,
      })
    }
  }

  const isValid = stack.length === 0
  steps.push({
    description: isValid
      ? `Stack is empty → all brackets matched. ✓ Valid!`
      : `Stack has unmatched opens: [${stack.join(', ')}]. ✗ Invalid!`,
    stack: [...stack], currentIdx: -1, valid: isValid,
  })
  return steps
}

const steps = computed(() => {
  if (warning.value) return []
  return buildSteps(inputS.value)
})

const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch(inputS, () => { stepIndex.value = 0 })

function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace</div>

      <div class="d-flex ga-3 mb-4 flex-wrap">
        <v-text-field v-model="inputS" label="s (brackets only)" density="compact" style="max-width:260px" hide-details />
      </div>

      <v-alert v-if="warning" type="warning" density="compact" class="mb-4" variant="tonal">{{ warning }}</v-alert>

      <template v-if="!warning && currentStep">
        <!-- String chars -->
        <div class="d-flex ga-1 mb-4 flex-wrap">
          <div
            v-for="(c, i) in inputS.split('')"
            :key="i"
            class="char-cell"
            :class="{
              'char-cell--active': currentStep.currentIdx === i && currentStep.valid === null,
              'char-cell--invalid': currentStep.valid === false && currentStep.currentIdx === i,
            }"
          >
            <span class="char-cell__val">{{ c }}</span>
            <span class="char-cell__idx">{{ i }}</span>
          </div>
        </div>

        <!-- Stack visualization -->
        <div class="map-label mb-2">stack (top → right)</div>
        <div class="stack-row mb-4">
          <div v-if="currentStep.stack.length === 0" class="text-caption text-medium-emphasis">[ empty ]</div>
          <div v-for="(item, i) in currentStep.stack" :key="i" class="stack-item" :class="{ 'stack-item--top': i === currentStep.stack.length - 1 }">
            {{ item }}
          </div>
        </div>

        <v-card variant="tonal"
          :color="currentStep.valid === true ? 'success' : currentStep.valid === false ? 'error' : 'primary'"
          class="mb-4">
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
.char-cell {
  display: flex; flex-direction: column; align-items: center;
  width: 36px; padding: 5px 3px; border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.04);
  transition: background 0.2s;
}
.char-cell--active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.12); }
.char-cell--invalid { border-color: rgb(var(--v-theme-error)); background: rgba(var(--v-theme-error), 0.15); }
.char-cell__val { font-size: 1rem; font-weight: 700; font-family: monospace; }
.char-cell__idx { font-size: 0.58rem; opacity: 0.45; }
.map-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.stack-row { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
.stack-item {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; font-size: 1rem; font-weight: 700; font-family: monospace;
  background: rgba(var(--v-theme-secondary), 0.12);
  border: 1px solid rgba(var(--v-theme-secondary), 0.3);
}
.stack-item--top {
  background: rgba(var(--v-theme-primary), 0.2);
  border-color: rgb(var(--v-theme-primary));
}
</style>
