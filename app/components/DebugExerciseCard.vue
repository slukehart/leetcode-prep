<script setup lang="ts">
import type { DebugExercise } from '~/types'

const props = defineProps<{ exercise: DebugExercise }>()
const emit = defineEmits<{ answered: [correct: boolean] }>()

const selected = ref<number | null>(null)
const answered = computed(() => selected.value !== null)

function choose(i: number) {
  if (answered.value) return            // lock after first answer
  selected.value = i
  emit('answered', props.exercise.choices[i].correct)
}

function choiceColor(i: number): string | undefined {
  if (!answered.value) return undefined
  if (props.exercise.choices[i].correct) return 'success'
  if (i === selected.value) return 'error'
  return undefined
}

const gotItRight = computed(() =>
  selected.value !== null && props.exercise.choices[selected.value].correct
)
</script>

<template>
  <v-card variant="outlined" rounded="lg" class="mb-8 pa-4">
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <h2 class="text-subtitle-1 font-weight-bold mr-1">{{ exercise.title }}</h2>
      <DifficultyChip :difficulty="exercise.difficulty" />
      <v-chip size="small" label variant="tonal" color="primary">{{ exercise.patternId }}</v-chip>
      <v-chip size="small" label variant="tonal">{{ exercise.bugType }}</v-chip>
    </div>

    <CodeBlock :code="exercise.buggyCode" />

    <div class="mt-3 mb-4 text-body-2">
      <div><strong>Input:</strong> <code>{{ exercise.failingInput }}</code></div>
      <div><strong>Expected:</strong> <code>{{ exercise.expected }}</code></div>
      <div><strong>Actual:</strong> <code>{{ exercise.actual }}</code></div>
    </div>

    <p class="text-body-2 font-weight-medium mb-2">What is the root cause?</p>
    <div class="d-flex flex-column ga-2">
      <v-btn
        v-for="(c, i) in exercise.choices"
        :key="i"
        :color="choiceColor(i)"
        :variant="answered && (c.correct || i === selected) ? 'tonal' : 'outlined'"
        class="text-none justify-start text-left"
        style="height: auto; white-space: normal; padding: 10px 14px"
        block
        :disabled="answered && !c.correct && i !== selected"
        @click="choose(i)"
      >
        {{ c.text }}
      </v-btn>
    </div>

    <v-alert
      v-if="answered"
      :type="gotItRight ? 'success' : 'error'"
      variant="tonal"
      density="comfortable"
      class="mt-4"
    >
      <div class="font-weight-medium mb-1">{{ gotItRight ? 'Correct' : 'Not quite' }}</div>
      {{ exercise.explanation }}
    </v-alert>
  </v-card>
</template>
