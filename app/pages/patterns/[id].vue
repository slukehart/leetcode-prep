<script setup lang="ts">
import type { PatternStatus } from '~/types'

const route = useRoute()
const { data: content } = await useContent()
const { progress, setPatternStatus } = useProgress()

const pattern = computed(() => content.value?.patterns.find(p => p.id === route.params.id))
const statuses: PatternStatus[] = ['to-learn', 'learning', 'learned']
const current = computed<PatternStatus>(() =>
  pattern.value ? (progress.value.patternStatus[pattern.value.id] ?? 'to-learn') : 'to-learn',
)

function onStatusChange(value: unknown) {
  if (pattern.value && value) setPatternStatus(pattern.value.id, value as PatternStatus)
}
</script>

<template>
  <div v-if="pattern">
    <v-btn variant="text" size="small" to="/patterns" class="mb-2 px-1 text-medium-emphasis">&larr; All patterns</v-btn>
    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-6">
      <h1 class="text-h5 font-weight-bold">{{ pattern.name }}</h1>
      <v-btn-toggle
        :model-value="current"
        mandatory
        density="comfortable"
        variant="outlined"
        color="primary"
        divided
        rounded="lg"
        @update:model-value="onStatusChange"
      >
        <v-btn v-for="s in statuses" :key="s" :value="s" size="small" class="text-capitalize">{{ s.replace('-', ' ') }}</v-btn>
      </v-btn-toggle>
    </div>

    <v-card variant="elevated" elevation="2" class="mb-4">
      <v-card-text>
        <div class="section-label mb-2">Triggers</div>
        <div v-for="t in pattern.triggers" :key="t" class="list-row">
          <span class="list-row__dot" />
          <span>{{ t }}</span>
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="elevated" elevation="2" class="mb-4">
      <v-card-text>
        <div class="section-label mb-2">Invariant</div>
        <p class="mb-0">{{ pattern.invariant }}</p>
      </v-card-text>
    </v-card>

    <div class="section-label mb-2">JS skeleton</div>
    <CodeBlock :code="pattern.jsSkeleton" class="mb-4" />

    <v-card variant="elevated" elevation="2" class="mb-4">
      <v-card-text>
        <div class="section-label mb-2">Failure modes</div>
        <div v-for="f in pattern.failureModes" :key="f" class="list-row">
          <span class="list-row__dot list-row__dot--warn" />
          <span>{{ f }}</span>
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="elevated" elevation="2">
      <v-card-text>
        <div class="section-label mb-2">Contrast cases</div>
        <div v-for="c in pattern.contrastCases" :key="c" class="list-row">
          <span class="list-row__dot list-row__dot--accent" />
          <span>{{ c }}</span>
        </div>
      </v-card-text>
    </v-card>
  </div>
  <div v-else class="text-medium-emphasis py-8">Pattern not found.</div>
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
.list-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px 0;
  line-height: 1.5;
}
.list-row__dot {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
}
.list-row__dot--warn { background: rgb(var(--v-theme-warning)); }
.list-row__dot--accent { background: rgb(var(--v-theme-accent)); }
</style>
