<script setup lang="ts">
import type { PatternWorkedExample } from '~/types'
defineProps<{ example: PatternWorkedExample | null | undefined }>()
</script>

<template>
  <v-card v-if="example && example.steps.length" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-3">Worked Example</div>
      <p class="text-body-2 text-medium-emphasis mb-3">
        <strong>Input:</strong> {{ example.input }}
      </p>
      <div
        v-for="(step, i) in example.steps"
        :key="i"
        class="step-row"
      >
        <span class="step-number">{{ i + 1 }}</span>
        <span class="text-body-2" style="line-height: 1.6">{{ step }}</span>
      </div>
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
.step-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.step-row:last-child { border-bottom: none; }
.step-number {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
</style>
