<script setup lang="ts">
import type { Pattern, PatternStatus } from '~/types'

const props = defineProps<{ pattern: Pattern; status?: PatternStatus }>()

const palette = ['#0277BD', '#00838F', '#00ACC1', '#26C6DA', '#5C6BC0', '#26A69A']
const accent = computed(() => {
  let h = 0
  for (let i = 0; i < props.pattern.id.length; i++) h = (h * 31 + props.pattern.id.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
})
</script>

<template>
  <v-card
    :to="`/patterns/${pattern.id}`"
    variant="elevated"
    elevation="2"
    hover
    class="pattern-card h-100"
    :style="{ '--accent': accent }"
  >
    <v-card-item>
      <div class="d-flex justify-space-between align-start ga-2">
        <v-card-title class="text-subtitle-1 font-weight-bold pattern-card__name">{{ pattern.name }}</v-card-title>
        <StatusBadge :status="status" />
      </div>
      <v-card-subtitle class="text-medium-emphasis pattern-card__desc">{{ pattern.whatItGives }}</v-card-subtitle>
    </v-card-item>
  </v-card>
</template>

<style scoped>
.pattern-card {
  position: relative;
  overflow: hidden;
  border-left: 4px solid var(--accent);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.pattern-card:hover {
  transform: translateY(-3px);
}
.pattern-card__name {
  white-space: normal;
  line-height: 1.3;
}
.pattern-card__desc {
  white-space: normal;
  opacity: 1;
}
</style>
