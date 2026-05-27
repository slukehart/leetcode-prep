<script setup lang="ts">
const { data: content } = await useContent()
const { progress, load, loaded } = useProgress()
if (import.meta.server && !loaded.value) await load()
const problems = computed(() => content.value?.problems ?? [])
function title(id: string) { return problems.value.find(p => p.id === id)?.title ?? id }
const due = computed(() => dueResolves(progress.value.attempts))
const tab = ref('problems')
function difficultyOf(id: string) { return problems.value.find(p => p.id === id)?.difficulty }
</script>
<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Tracker</h1>
    <p class="text-body-2 text-medium-emphasis mb-4">Log attempts, track due re-solves, and record mistakes.</p>
    <v-tabs v-model="tab" color="primary" class="mb-1">
      <v-tab value="problems">Problems</v-tab>
      <v-tab value="mistakes">Mistakes</v-tab>
    </v-tabs>
    <v-window v-model="tab" class="mt-4">
      <v-window-item value="problems">
        <div class="d-flex flex-column ga-4">
          <QuickLog :problems="problems" />
          <v-card v-if="due.length" variant="elevated" elevation="2" class="due-card">
            <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center ga-2">
              <span class="due-card__bar" />Due re-solves
            </v-card-title>
            <v-card-text>
              <div v-for="d in due" :key="d.problemId" class="d-flex align-center ga-2 py-1">
                <v-chip size="x-small" label variant="tonal" color="warning">{{ d.stage }}</v-chip>
                <span class="text-body-2">{{ title(d.problemId) }}</span>
                <v-spacer />
                <span class="text-caption text-medium-emphasis">due {{ d.due }}</span>
              </div>
            </v-card-text>
          </v-card>
          <v-card variant="elevated" elevation="2">
            <v-card-title class="text-subtitle-1 font-weight-bold">Logged attempts</v-card-title>
            <v-list v-if="progress.attempts.length" density="comfortable" class="py-0 bg-transparent">
              <v-list-item v-for="a in [...progress.attempts].reverse()" :key="a.id" class="px-4">
                <template #prepend>
                  <ResultChip :result="a.result" class="mr-3" />
                </template>
                <v-list-item-title class="text-body-2">
                  {{ title(a.problemId) }} <span class="text-medium-emphasis">· {{ a.minutes }}m</span>
                </v-list-item-title>
                <v-list-item-subtitle v-if="a.rootCause" class="text-caption">{{ a.rootCause }}</v-list-item-subtitle>
                <template #append>
                  <span class="text-caption text-medium-emphasis">{{ a.date }}</span>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-medium-emphasis text-body-2">No attempts logged yet.</v-card-text>
          </v-card>
        </div>
      </v-window-item>
      <v-window-item value="mistakes">
        <div class="d-flex flex-column ga-4">
          <MistakeForm :problems="problems" />
          <v-card variant="elevated" elevation="2">
            <v-card-title class="text-subtitle-1 font-weight-bold">Mistake log</v-card-title>
            <v-list v-if="progress.mistakes.length" density="comfortable" class="py-0 bg-transparent">
              <v-list-item v-for="m in [...progress.mistakes].reverse()" :key="m.id" class="px-4">
                <template #prepend>
                  <DifficultyChip v-if="difficultyOf(m.problemId)" :difficulty="difficultyOf(m.problemId)!" class="mr-3" />
                </template>
                <v-list-item-title class="text-body-2">
                  {{ title(m.problemId) }} <span class="text-medium-emphasis">· {{ m.mistake }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">&rarr; {{ m.processFix }}</v-list-item-subtitle>
                <template #append>
                  <div class="d-flex flex-column align-end ga-1">
                    <v-chip size="x-small" label variant="tonal" :color="m.status === 'resolved' ? 'success' : 'warning'">{{ m.status }}</v-chip>
                    <span class="text-caption text-medium-emphasis">{{ m.date }}</span>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-medium-emphasis text-body-2">No mistakes logged — nice.</v-card-text>
          </v-card>
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.due-card {
  border-left: 4px solid rgb(var(--v-theme-warning));
}
.due-card__bar {
  display: inline-block;
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: rgb(var(--v-theme-warning));
}
</style>
