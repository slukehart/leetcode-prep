<script setup lang="ts">
const props = defineProps<{ difficulty: 'easy' | 'medium' | 'hard' }>()

const map = {
  easy: { label: 'Easy', color: 'success' },
  medium: { label: 'Medium', color: 'warning' },
  hard: { label: 'Hard', color: 'error' },
} as const

const d = computed(() => map[props.difficulty])
</script>

<template>
  <v-chip :color="d.color" size="small" label variant="tonal">{{ d.label }}</v-chip>
</template>
