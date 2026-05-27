<script setup lang="ts">
import type { Problem, AttemptResult } from '~/types'
const props = defineProps<{ problems: Problem[] }>()
const { logAttempt } = useProgress()
const problemId = ref<string>('')
const minutes = ref<number>(20)
const result = ref<AttemptResult>('solved')
const rootCause = ref('')
const processFix = ref('')
const showNotes = computed(() => result.value !== 'solved')
const options = computed(() => props.problems.map(p => ({ title: `${p.title} (${p.difficulty})`, value: p.id })))

async function submit() {
  if (!problemId.value) return
  await logAttempt({
    problemId: problemId.value,
    date: today(),
    minutes: Number(minutes.value),
    result: result.value,
    rootCause: showNotes.value ? rootCause.value : undefined,
    processFix: showNotes.value ? processFix.value : undefined,
  }, props.problems)
  rootCause.value = ''; processFix.value = ''
}
</script>
<template>
  <v-card variant="elevated" elevation="2">
    <v-card-title class="text-subtitle-1 font-weight-bold">Quick Log</v-card-title>
    <v-card-text>
      <div class="d-flex flex-wrap ga-3 align-center">
        <v-autocomplete v-model="problemId" :items="options" item-title="title" item-value="value"
          label="Problem" density="compact" hide-details style="min-width:280px" />
        <v-text-field v-model.number="minutes" type="number" label="min" density="compact"
          hide-details style="max-width:96px" />
        <v-btn-toggle v-model="result" mandatory density="compact" variant="outlined" color="primary" divided rounded="lg">
          <v-btn v-for="r in ['solved','stuck','failed']" :key="r" :value="r" size="small" class="text-capitalize">{{ r }}</v-btn>
        </v-btn-toggle>
        <v-btn color="primary" @click="submit">Log</v-btn>
      </div>
      <div v-if="showNotes" class="mt-3 d-flex flex-column ga-2">
        <v-text-field v-model="rootCause" density="compact" hide-details
          label="Root cause (decision-chain, not 'be careful')" />
        <v-text-field v-model="processFix" density="compact" hide-details label="Process fix" />
      </div>
    </v-card-text>
  </v-card>
</template>
