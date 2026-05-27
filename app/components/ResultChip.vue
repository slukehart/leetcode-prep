<script setup lang="ts">
import type { AttemptResult } from '~/types'

const props = defineProps<{ result: AttemptResult }>()

const map = {
  solved: { label: 'Solved', color: 'success' },
  stuck: { label: 'Stuck', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
} as const

const r = computed(() => map[props.result])
</script>

<template>
  <v-chip :color="r.color" size="small" label variant="tonal">{{ r.label }}</v-chip>
</template>
