<script setup lang="ts">
defineProps<{ items: string[] | undefined }>()
</script>

<template>
  <v-card v-if="items && items.length" variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-2">When Not To Use</div>
      <div v-for="item in items" :key="item" class="list-row">
        <span class="list-row__dot" />
        <span class="text-body-2" style="line-height: 1.6">{{ item }}</span>
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
  background: rgb(var(--v-theme-error));
}
</style>
