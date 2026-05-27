<script setup lang="ts">
import type { PathItem, Problem } from '~/types'

const props = defineProps<{ item: PathItem; problem?: Problem; done: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="path-item d-flex align-center ga-2" :class="{ 'path-item--done': props.done }">
    <v-checkbox-btn :model-value="props.done" color="success" @update:model-value="emit('toggle')" />
    <span class="path-item__label" :class="{ 'text-decoration-line-through text-disabled': props.done }">{{ props.item.label }}</span>
    <v-spacer />
    <v-btn
      v-if="props.problem"
      :href="props.problem.leetcodeUrl"
      target="_blank"
      rel="noopener"
      size="x-small"
      variant="tonal"
      color="primary"
      rounded="lg"
    >
      LeetCode
    </v-btn>
    <v-btn
      v-if="props.item.patternId"
      :to="`/patterns/${props.item.patternId}`"
      size="x-small"
      variant="text"
      color="secondary"
    >
      pattern
    </v-btn>
  </div>
</template>

<style scoped>
.path-item {
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}
.path-item:hover {
  background: rgba(2, 119, 189, 0.06);
}
.path-item--done {
  opacity: 0.72;
}
.path-item__label {
  font-size: 0.92rem;
}
</style>
