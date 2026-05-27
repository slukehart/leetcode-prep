<script setup lang="ts">
// Fixed graph: 4 nodes, edges: 0→1, 1→2, 2→3 (no cycle demo)
// Students can toggle to add 3→1 to create a cycle
const hasCycleEdge = ref(false)

const nodes = [0, 1, 2, 3]
const baseEdges = [[0,1],[1,2],[2,3]]

const edges = computed(() => hasCycleEdge.value ? [...baseEdges, [3,1]] : baseEdges)

interface TraceStep {
  description: string
  state: number[]    // 0=unseen, 1=visiting, 2=done
  currentNode: number | null
  cycleFound: boolean
}

function buildSteps(edgeList: number[][]): TraceStep[] {
  const steps: TraceStep[] = []
  const state = new Array(4).fill(0)

  steps.push({ description: `Start. All nodes unseen (state=0). Will DFS from each unvisited node.`, state: [...state], currentNode: null, cycleFound: false })

  let cycleFound = false

  const adjMap: number[][] = [[],[],[],[]]
  for (const [a, b] of edgeList) {
    adjMap[a].push(b)
  }

  function dfs(node: number): boolean {
    state[node] = 1
    steps.push({ description: `Visit node ${node} → state[${node}]=1 (visiting).`, state: [...state], currentNode: node, cycleFound: false })
    for (const next of adjMap[node]) {
      if (state[next] === 1) {
        cycleFound = true
        steps.push({ description: `Edge ${node}→${next}: state[${next}]=1 → CYCLE!`, state: [...state], currentNode: node, cycleFound: true })
        return true
      }
      if (state[next] === 0) {
        steps.push({ description: `Edge ${node}→${next}: unvisited → recurse.`, state: [...state], currentNode: node, cycleFound: false })
        if (dfs(next)) return true
      } else {
        steps.push({ description: `Edge ${node}→${next}: done (state=2) → skip.`, state: [...state], currentNode: node, cycleFound: false })
      }
    }
    state[node] = 2
    steps.push({ description: `Node ${node} done → state[${node}]=2 (safe).`, state: [...state], currentNode: null, cycleFound: false })
    return false
  }

  for (let i = 0; i < 4; i++) {
    if (state[i] === 0) {
      if (dfs(i)) break
    }
  }

  steps.push({ description: cycleFound ? 'Cycle detected — cannot finish all courses.' : 'No cycle found — all courses can be finished.', state: [...state], currentNode: null, cycleFound })
  return steps
}

const steps = computed(() => buildSteps(edges.value))
const stepIndex = ref(0)
const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
watch(hasCycleEdge, () => { stepIndex.value = 0 })
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }

const stateColors = ['', 'primary', 'success']
const stateLabels = ['unseen', 'visiting', 'done']
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Course Schedule</div>
      <div class="mb-4">
        <v-switch v-model="hasCycleEdge" label="Add cycle edge 3→1" density="compact" color="error" hide-details />
        <div class="text-caption text-medium-emphasis mt-1">Edges: 0→1, 1→2, 2→3{{ hasCycleEdge ? ', 3→1 (cycle!)' : '' }}</div>
      </div>
      <template v-if="currentStep">
        <!-- Node states -->
        <div class="d-flex ga-3 mb-4 flex-wrap">
          <div v-for="n in nodes" :key="n" class="state-node" :class="`state-node--${stateColors[currentStep.state[n]]}`">
            <span class="state-node__id">{{ n }}</span>
            <span class="state-node__label">{{ stateLabels[currentStep.state[n]] }}</span>
          </div>
        </div>
        <!-- Legend -->
        <div class="d-flex ga-2 mb-3 flex-wrap">
          <v-chip size="x-small" variant="tonal">0 = unseen</v-chip>
          <v-chip size="x-small" variant="tonal" color="primary">1 = visiting</v-chip>
          <v-chip size="x-small" variant="tonal" color="success">2 = done/safe</v-chip>
        </div>
        <v-card variant="tonal" :color="currentStep.cycleFound ? 'error' : stepIndex === steps.length - 1 ? 'success' : 'primary'" class="mb-4">
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
.state-node { display: flex; flex-direction: column; align-items: center; width: 64px; padding: 8px 4px; border-radius: 8px; border: 2px solid rgba(var(--v-theme-on-surface), 0.15); background: rgba(var(--v-theme-on-surface), 0.04); transition: background 0.2s; }
.state-node-- { border-color: rgba(var(--v-theme-on-surface), 0.15); }
.state-node--primary { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.15); }
.state-node--success { border-color: rgb(var(--v-theme-success)); background: rgba(var(--v-theme-success), 0.12); }
.state-node__id { font-size: 1.1rem; font-weight: 700; }
.state-node__label { font-size: 0.58rem; opacity: 0.7; text-align: center; }
</style>
