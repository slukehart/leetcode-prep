<script setup lang="ts">
// Same fixed tree as tree-dfs: [3,9,20,null,null,15,7]
interface TNode { id: number; val: number; level: number }
const tree: TNode[] = [
  { id: 0, val: 3,  level: 0 },
  { id: 1, val: 9,  level: 1 },
  { id: 2, val: 20, level: 1 },
  { id: 3, val: 15, level: 2 },
  { id: 4, val: 7,  level: 2 },
]
const children: Record<number, number[]> = { 0: [1, 2], 1: [], 2: [3, 4], 3: [], 4: [] }

interface TraceStep {
  description: string
  queue: number[]
  visited: number[]
  levels: number[][]
  currentId: number | null
}

function buildSteps(): TraceStep[] {
  const steps: TraceStep[] = []
  const queue = [0]
  const visited = [0]
  const levels: number[][] = []

  steps.push({ description: 'Start. Enqueue root (val=3). Mark visited.', queue: [...queue], visited: [...visited], levels: [], currentId: null })

  while (queue.length > 0) {
    const levelSize = queue.length
    const level: number[] = []

    for (let i = 0; i < levelSize; i++) {
      const id = queue.shift()!
      level.push(id)
      steps.push({ description: `Dequeue node ${tree[id].val}. Process it.`, queue: [...queue], visited: [...visited], levels: [...levels.map(l => [...l]), [...level]], currentId: id })

      for (const childId of children[id]) {
        if (!visited.includes(childId)) {
          visited.push(childId)
          queue.push(childId)
          steps.push({ description: `  → Enqueue child ${tree[childId].val}. Mark visited. queue=[${queue.map(i => tree[i].val).join(',')}].`, queue: [...queue], visited: [...visited], levels: [...levels.map(l => [...l]), [...level]], currentId: id })
        }
      }
    }

    levels.push(level)
    steps.push({ description: `Level ${levels.length - 1} complete: [${level.map(i => tree[i].val).join(', ')}].`, queue: [...queue], visited: [...visited], levels: levels.map(l => [...l]), currentId: null })
  }

  steps.push({ description: `BFS complete. Result: ${levels.map(l => '[' + l.map(i => tree[i].val).join(',') + ']').join(', ')}.`, queue: [], visited: [...visited], levels: levels.map(l => [...l]), currentId: null })
  return steps
}

const steps = buildSteps()
const stepIndex = ref(0)
const currentStep = computed(() => steps[stepIndex.value] ?? null)
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }

const levelColors = ['primary', 'secondary', 'accent']
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Level Order Traversal</div>
      <template v-if="currentStep">
        <!-- Tree nodes colored by level -->
        <div class="tree-diagram mb-4">
          <div class="tree-row">
            <div class="tree-node" :class="{ 'tree-node--active': currentStep.currentId === 0, 'tree-node--visited': currentStep.visited.includes(0) }">3</div>
          </div>
          <div class="tree-row">
            <div class="tree-node" :class="{ 'tree-node--active': currentStep.currentId === 1, 'tree-node--visited': currentStep.visited.includes(1) }">9</div>
            <div class="tree-node" :class="{ 'tree-node--active': currentStep.currentId === 2, 'tree-node--visited': currentStep.visited.includes(2) }">20</div>
          </div>
          <div class="tree-row">
            <div class="tree-node tree-node--null">∅</div>
            <div class="tree-node tree-node--null">∅</div>
            <div class="tree-node" :class="{ 'tree-node--active': currentStep.currentId === 3, 'tree-node--visited': currentStep.visited.includes(3) }">15</div>
            <div class="tree-node" :class="{ 'tree-node--active': currentStep.currentId === 4, 'tree-node--visited': currentStep.visited.includes(4) }">7</div>
          </div>
        </div>

        <!-- Queue -->
        <div class="map-label mb-1">queue</div>
        <div class="d-flex ga-1 mb-3 flex-wrap">
          <div v-if="currentStep.queue.length === 0" class="text-caption text-medium-emphasis">[ empty ]</div>
          <div v-for="id in currentStep.queue" :key="id" class="queue-item">{{ tree[id].val }}</div>
        </div>

        <!-- Levels collected so far -->
        <div v-if="currentStep.levels.length > 0" class="mb-3">
          <div class="map-label mb-1">result</div>
          <div class="d-flex ga-1 flex-wrap">
            <v-chip v-for="(level, i) in currentStep.levels" :key="i" :color="levelColors[i % levelColors.length]" variant="tonal" size="small">
              L{{ i }}: [{{ level.map(id => tree[id].val).join(',') }}]
            </v-chip>
          </div>
        </div>

        <v-card variant="tonal" :color="stepIndex === steps.length - 1 ? 'success' : 'primary'" class="mb-4">
          <v-card-text class="text-body-2 py-2"><strong>Step {{ stepIndex + 1 }} / {{ steps.length }}</strong> — {{ currentStep.description }}</v-card-text>
        </v-card>
        <div class="d-flex ga-2 align-center">
          <v-btn size="small" variant="outlined" :disabled="stepIndex === 0" @click="prev">← Prev</v-btn>
          <v-btn size="small" variant="outlined" :disabled="stepIndex === steps.length - 1" @click="next">Next →</v-btn>
          <v-btn size="small" variant="text" @click="reset">Reset</v-btn>
          <span class="text-caption text-medium-emphasis ml-2">{{ stepIndex + 1 }} / {{ steps.length }}</span>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.section-label { display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgb(var(--v-theme-primary)); border-bottom: 2px solid rgb(var(--v-theme-accent)); padding-bottom: 2px; }
.map-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.tree-diagram { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.tree-row { display: flex; gap: 12px; }
.tree-node { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid rgba(var(--v-theme-on-surface), 0.2); background: rgba(var(--v-theme-on-surface), 0.04); font-weight: 700; font-size: 0.9rem; transition: background 0.2s; }
.tree-node--visited { border-color: rgb(var(--v-theme-secondary)); background: rgba(var(--v-theme-secondary), 0.12); }
.tree-node--active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.2); }
.tree-node--null { opacity: 0.2; border-style: dashed; }
.queue-item { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: 700; font-size: 0.9rem; background: rgba(var(--v-theme-accent), 0.15); border: 1px solid rgba(var(--v-theme-accent), 0.4); }
</style>
