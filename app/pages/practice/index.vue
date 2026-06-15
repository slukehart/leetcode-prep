<script setup lang="ts">
const { data: content } = await useContent()

const problems = computed(() =>
  (content.value?.problems ?? []).filter((p) => p.track.includes('design'))
)
const scaffolds = computed(() => content.value?.scaffolds ?? {})
</script>

<template>
  <div>
    <div class="d-flex align-baseline ga-3 mb-1">
      <h1 class="text-h5 font-weight-bold">Practice</h1>
      <span class="text-body-2 text-medium-emphasis">{{ problems.length }} design problems</span>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Copy a scaffold into a <code>.js</code> file, implement the stub, then run
      <code>node file.js</code> to check it against the built-in tests. Re-solve from scratch —
      reference solutions live in <code>docs/examples/</code> for <em>after</em> your attempt.
    </p>

    <div v-for="p in problems" :key="p.id" class="mb-8">
      <div class="d-flex align-center ga-3 mb-2">
        <h2 class="text-subtitle-1 font-weight-bold">{{ p.title }}</h2>
        <DifficultyChip :difficulty="p.difficulty" />
        <v-btn
          v-if="p.leetcodeUrl"
          :href="p.leetcodeUrl"
          target="_blank"
          rel="noopener"
          size="x-small"
          variant="tonal"
          color="primary"
          rounded="lg"
        >
          LeetCode
        </v-btn>
      </div>
      <CodeBlock v-if="scaffolds[p.id]" :code="scaffolds[p.id]" />
      <p v-else class="text-body-2 text-medium-emphasis fst-italic">Scaffold coming soon.</p>
    </div>

    <div v-if="!problems.length" class="text-medium-emphasis text-body-2 py-8 text-center">
      No design problems found.
    </div>
  </div>
</template>
