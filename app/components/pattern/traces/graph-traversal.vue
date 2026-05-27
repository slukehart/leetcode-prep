<script setup lang="ts">
// Fixed graph: nodes 1-4, edges: 1-2, 1-4, 2-3, 3-4 (undirected clone graph demo)
const nodes = [1, 2, 3, 4]
const adj: Record<number, number[]> = { 1: [2,4], 2: [1,3], 3: [2,4], 4: [1,3] }

interface TraceStep {
  description: string
  cloned: number[]
  currentNode: number | null
}

function buildSteps(): TraceStep[] {
  const steps: TraceStep[] = []
  const cloned: number[] = []

  steps.push({ description: 'Start DFS from node 1. cloned map is empty.', cloned: [], currentNode: null })

  function dfs(n: number): void {
    if (cloned.includes(n)) {
      steps.push({ description: `Node ${n} already in cloned map → return existing clone.`, cloned: [...cloned], currentNode: n })
      return
    }
    cloned.push(n)
    steps.push({ description: `Clone node ${n}. Set cloned[${n}] BEFORE recursing (prevents infinite loop on cycles).`, cloned: [...cloned], currentNode: n })
    for (const nei of adj[n]) {
      steps.push({ description: `  Node ${n}: recurse into neighbor ${nei}.`, cloned: [...cloned], currentNode: n })
      dfs(nei)
      steps.push({ description: `  Node ${n}: neighbor ${nei} clone ready. Add to ${n}'s neighbors list.`, cloned: [...cloned], currentNode: n })
    }
    steps.push({ description: `Node ${n} fully cloned with all neighbors.`, cloned: [...cloned], currentNode: null })
  }

  dfs(1)
  steps.push({ description: `Clone complete! All ${cloned.length} nodes cloned: [${cloned.join(', ')}].`, cloned: [...cloned], currentNode: null })
  return steps
}

const steps = buildSteps()
const stepIndex = ref(0)
const currentStep = computed(() => steps[stepIndex.value] ?? null)
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Clone Graph</div>
      <div class="text-caption text-medium-emphasis mb-4">Graph: 1—2, 1—4, 2—3, 3—4</div>
      <template v-if="currentStep">
        <!-- Node grid -->
        <div class="d-flex ga-3 mb-4 flex-wrap">
          <div v-for="n in nodes" :key="n" class="graph-node"
            :class="{
              'graph-node--current': currentStep.currentNode === n,
              'graph-node--cloned': currentStep.cloned.includes(n),
            }">
            <span class="graph-node__val">{{ n }}</span>
            <span class="graph-node__status">{{ currentStep.cloned.includes(n) ? 'cloned' : 'pending' }}</span>
          </div>
        </div>
        <!-- Edges -->
        <div class="text-caption text-medium-emphasis mb-3">Neighbors: {{ Object.entries(adj).map(([k,v]) => `${k}→[${v}]`).join(', ') }}</div>
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
.graph-node { display: flex; flex-direction: column; align-items: center; width: 64px; padding: 8px 4px; border-radius: 50%; border: 2px solid rgba(var(--v-theme-on-surface), 0.2); background: rgba(var(--v-theme-on-surface), 0.04); transition: background 0.2s; }
.graph-node--current { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.2); }
.graph-node--cloned { border-color: rgb(var(--v-theme-success)); background: rgba(var(--v-theme-success), 0.12); }
.graph-node__val { font-size: 1.1rem; font-weight: 700; }
.graph-node__status { font-size: 0.55rem; opacity: 0.65; }
</style>
