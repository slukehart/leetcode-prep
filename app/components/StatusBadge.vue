<script setup lang="ts">
import type { PatternStatus } from '~/types'

const props = defineProps<{ status?: PatternStatus }>()

const map = {
  'to-learn': { label: 'To learn', color: 'grey' },
  'learning': { label: 'Learning', color: 'warning' },
  'learned': { label: 'Learned', color: 'success' },
} as const

const s = computed(() => map[props.status ?? 'to-learn'])
</script>

<template>
  <v-chip :color="s.color" size="small" label variant="tonal" class="font-weight-medium">{{ s.label }}</v-chip>
</template>
