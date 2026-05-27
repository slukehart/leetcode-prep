<script setup lang="ts">
const { data: content } = await useContent()
const { progress } = useProgress()

const filter = ref<'all' | 'to-learn' | 'learning' | 'learned'>('all')
const patterns = computed(() => content.value?.patterns ?? [])
const shown = computed(() => patterns.value.filter((p) => {
  if (filter.value === 'all') return true
  return (progress.value.patternStatus[p.id] ?? 'to-learn') === filter.value
}))
</script>

<template>
  <div>
    <div class="d-flex align-baseline ga-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Patterns</h1>
      <span class="text-body-2 text-medium-emphasis">{{ patterns.length }} patterns</span>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">Browse the core problem-solving patterns and track what you've learned.</p>
    <v-btn-toggle
      v-model="filter"
      mandatory
      density="comfortable"
      variant="outlined"
      color="primary"
      divided
      rounded="lg"
      class="mb-6 filter-toggle"
    >
      <v-btn v-for="f in ['all', 'to-learn', 'learning', 'learned']" :key="f" :value="f" size="small" class="text-capitalize">{{ f.replace('-', ' ') }}</v-btn>
    </v-btn-toggle>
    <v-row dense>
      <v-col v-for="p in shown" :key="p.id" cols="12" sm="6">
        <PatternCard :pattern="p" :status="progress.patternStatus[p.id]" />
      </v-col>
    </v-row>
    <div v-if="!shown.length" class="text-medium-emphasis text-body-2 py-8 text-center">
      No patterns match this filter.
    </div>
  </div>
</template>

<style scoped>
.filter-toggle {
  background: rgb(var(--v-theme-surface));
}
</style>
