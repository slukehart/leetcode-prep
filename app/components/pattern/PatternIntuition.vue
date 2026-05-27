<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <v-card v-if="text" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-3">The Why — Intuition</div>
      <p
        v-for="(para, i) in text.split('\n\n').filter(Boolean)"
        :key="i"
        class="mb-2 text-body-2"
        style="line-height: 1.7"
      >{{ para }}</p>
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
