<script setup lang="ts">
import type { PatternComplexity } from '~/types'
defineProps<{ complexity: PatternComplexity | null | undefined }>()
</script>

<template>
  <v-card v-if="complexity" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-3">Complexity</div>
      <div class="d-flex ga-2 mb-3">
        <v-chip color="primary" variant="tonal" size="small">
          Time: {{ complexity.time }}
        </v-chip>
        <v-chip color="secondary" variant="tonal" size="small">
          Space: {{ complexity.space }}
        </v-chip>
      </div>
      <p class="mb-0 text-body-2" style="line-height: 1.7">{{ complexity.explanation }}</p>
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
</style>
