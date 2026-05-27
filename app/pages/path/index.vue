<script setup lang="ts">
const { data: content } = await useContent()
const { progress, togglePathItem } = useProgress()

const tracks = computed(() => content.value?.curriculum ?? [])

function problemFor(id?: string) {
  if (!id) return undefined
  return content.value?.problems.find(p => p.id === id)
}

function doneCount(items: { id: string }[]) {
  return items.filter(it => progress.value.pathProgress[it.id]).length
}
function ratio(items: { id: string }[]) {
  if (!items.length) return 0
  return Math.round((doneCount(items) / items.length) * 100)
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Study Path</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">Work through the sprint and mastery tracks. Check items off as you complete them.</p>
    <section v-for="track in tracks" :key="track.id" class="mb-10">
      <h2 class="text-h6 font-weight-bold mb-3">{{ track.title }}</h2>
      <v-card v-for="g in track.groups" :key="g.id" variant="elevated" elevation="2" class="mb-4">
        <v-card-item class="pb-2">
          <div class="d-flex flex-wrap justify-space-between align-center ga-2">
            <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
              {{ g.title }}
              <span v-if="g.subtitle" class="text-medium-emphasis text-body-2 font-weight-regular">— {{ g.subtitle }}</span>
            </v-card-title>
            <v-chip size="small" label variant="tonal" :color="doneCount(g.items) === g.items.length && g.items.length ? 'success' : 'primary'">
              {{ doneCount(g.items) }} / {{ g.items.length }}
            </v-chip>
          </div>
          <v-progress-linear
            :model-value="ratio(g.items)"
            :color="doneCount(g.items) === g.items.length && g.items.length ? 'success' : 'primary'"
            height="4"
            rounded
            class="mt-3"
          />
        </v-card-item>
        <v-card-text class="pt-1">
          <PathItem
            v-for="it in g.items"
            :key="it.id"
            :item="it"
            :problem="problemFor(it.problemId)"
            :done="!!progress.pathProgress[it.id]"
            @toggle="togglePathItem(it.id)"
          />
        </v-card-text>
      </v-card>
    </section>
  </div>
</template>
