<script setup lang="ts">
import type { BugType } from '~/types'

const { data: content } = await useContent()

const all = computed(() => content.value?.debugExercises ?? [])

const patternFilter = ref<string | null>(null)
const bugTypeFilter = ref<BugType | null>(null)

const patternOptions = computed(() =>
  [...new Set(all.value.map((e) => e.patternId))].sort()
)
const bugTypeOptions = computed(() =>
  [...new Set(all.value.map((e) => e.bugType))].sort()
)

const visible = computed(() =>
  all.value.filter((e) =>
    (!patternFilter.value || e.patternId === patternFilter.value) &&
    (!bugTypeFilter.value || e.bugType === bugTypeFilter.value)
  )
)

// Session-only score, keyed by exercise id so re-filtering doesn't double-count.
const results = ref<Record<string, boolean>>({})
const answeredCount = computed(() => Object.keys(results.value).length)
const correctCount = computed(() => Object.values(results.value).filter(Boolean).length)

function onAnswered(id: string, correct: boolean) {
  if (!(id in results.value)) results.value[id] = correct
}
</script>

<template>
  <div>
    <div class="d-flex align-baseline ga-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Debug</h1>
      <span class="text-body-2 text-medium-emphasis">{{ all.length }} exercises</span>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Read the buggy code and the failing case, then pick the root cause. Diagnosis only —
      no fixing required. Score is for this session and resets on reload.
    </p>

    <div class="d-flex flex-wrap ga-3 align-center mb-6">
      <v-select
        v-model="patternFilter"
        :items="patternOptions"
        label="Pattern"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        style="max-width: 220px"
      />
      <v-select
        v-model="bugTypeFilter"
        :items="bugTypeOptions"
        label="Bug type"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        style="max-width: 220px"
      />
      <v-spacer />
      <v-chip v-if="answeredCount" color="primary" label variant="tonal">
        {{ correctCount }}/{{ answeredCount }} correct
      </v-chip>
    </div>

    <DebugExerciseCard
      v-for="e in visible"
      :key="e.id"
      :exercise="e"
      @answered="(correct) => onAnswered(e.id, correct)"
    />

    <div v-if="!visible.length" class="text-medium-emphasis text-body-2 py-8 text-center">
      No exercises match these filters.
    </div>
  </div>
</template>
