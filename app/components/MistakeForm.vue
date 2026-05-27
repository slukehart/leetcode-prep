<script setup lang="ts">
import type { Problem } from '~/types'
const props = defineProps<{ problems: Problem[] }>()
const { addMistake } = useProgress()
const problemId = ref(''); const mistake = ref(''); const correctTrigger = ref(''); const processFix = ref('')
const options = computed(() => props.problems.map(p => ({ title: p.title, value: p.id })))
async function submit() {
  if (!problemId.value || !mistake.value) return
  await addMistake({
    problemId: problemId.value, date: today(), mistake: mistake.value,
    correctTrigger: correctTrigger.value, processFix: processFix.value,
    resolveDate: addDays(today(), 1), status: 'open',
  })
  mistake.value = ''; correctTrigger.value = ''; processFix.value = ''
}
</script>
<template>
  <v-card variant="elevated" elevation="2">
    <v-card-title class="text-subtitle-1 font-weight-bold">Log a mistake</v-card-title>
    <v-card-text class="d-flex flex-column ga-2">
      <v-autocomplete v-model="problemId" :items="options" item-title="title" item-value="value"
        label="Problem" density="compact" hide-details />
      <v-text-field v-model="mistake" label="Mistake" density="compact" hide-details />
      <v-text-field v-model="correctTrigger" label="Correct trigger / invariant" density="compact" hide-details />
      <v-text-field v-model="processFix" label="Process fix" density="compact" hide-details />
      <v-btn color="primary" class="align-self-start" @click="submit">Add</v-btn>
    </v-card-text>
  </v-card>
</template>
