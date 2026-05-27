<script setup lang="ts">
// Fixed binary tree: [3, 9, 20, null, null, 15, 7] — max depth demo
// Nodes: id, val, leftId, rightId, depth
interface TNode { id: number; val: number | null; left: number | null; right: number | null; depth: number }

const tree: TNode[] = [
  { id: 0, val: 3,    left: 1, right: 2, depth: 0 },
  { id: 1, val: 9,    left: null, right: null, depth: 1 },
  { id: 2, val: 20,   left: 3, right: 4, depth: 1 },
  { id: 3, val: 15,   left: null, right: null, depth: 2 },
  { id: 4, val: 7,    left: null, right: null, depth: 2 },
]

interface TraceStep {
  description: string
  visiting: number | null
  returning: number | null
  returnVal: number | null
  resolved: Record<number, number>
}

function buildSteps(): TraceStep[] {
  const steps: TraceStep[] = []
  const resolved: Record<number, number> = {}

  steps.push({ description: 'Start at root (val=3). Recurse left and right to find max depth.', visiting: 0, returning: null, returnVal: null, resolved: {} })

  function dfs(id: number): number {
    const node = tree[id]
    steps.push({ description: `Visit node ${node.val}. Recurse into left child (${node.left !== null ? tree[node.left].val : 'null'}).`, visiting: id, returning: null, returnVal: null, resolved: { ...resolved } })

    const leftDepth = node.left !== null ? dfs(node.left) : 0
    if (node.left === null) {
      steps.push({ description: `Left of ${node.val} is null → return 0.`, visiting: id, returning: null, returnVal: 0, resolved: { ...resolved } })
    }

    steps.push({ description: `Back at ${node.val}. Left depth=${leftDepth}. Now recurse right (${node.right !== null ? tree[node.right].val : 'null'}).`, visiting: id, returning: null, returnVal: null, resolved: { ...resolved } })

    const rightDepth = node.right !== null ? dfs(node.right) : 0
    if (node.right === null) {
      steps.push({ description: `Right of ${node.val} is null → return 0.`, visiting: id, returning: null, returnVal: 0, resolved: { ...resolved } })
    }

    const result = 1 + Math.max(leftDepth, rightDepth)
    resolved[id] = result
    steps.push({ description: `Node ${node.val}: 1 + max(${leftDepth}, ${rightDepth}) = ${result}. Return ${result}.`, visiting: null, returning: id, returnVal: result, resolved: { ...resolved } })
    return result
  }

  const answer = dfs(0)
  steps.push({ description: `Done! Max depth = ${answer}.`, visiting: null, returning: null, returnVal: answer, resolved: { ...resolved } })
  return steps
}

const steps = buildSteps()
const stepIndex = ref(0)
const currentStep = computed(() => steps[stepIndex.value] ?? null)

function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }

function nodeColor(id: number): string {
  if (!currentStep.value) return 'primary'
  if (currentStep.value.visiting === id) return 'primary'
  if (currentStep.value.returning === id) return 'success'
  if (currentStep.value.resolved[id] !== undefined) return 'secondary'
  return ''
}
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Max Depth</div>
      <template v-if="currentStep">
        <!-- Tree visualization: 3 rows -->
        <div class="tree-diagram mb-4">
          <!-- Row 0: root -->
          <div class="tree-row">
            <div class="tree-node" :class="`tree-node--${nodeColor(0)}`">
              <span class="tree-node__val">{{ tree[0].val }}</span>
              <span v-if="currentStep.resolved[0] !== undefined" class="tree-node__depth">d={{ currentStep.resolved[0] }}</span>
            </div>
          </div>
          <!-- Row 1 -->
          <div class="tree-row">
            <div class="tree-node" :class="`tree-node--${nodeColor(1)}`">
              <span class="tree-node__val">{{ tree[1].val }}</span>
              <span v-if="currentStep.resolved[1] !== undefined" class="tree-node__depth">d={{ currentStep.resolved[1] }}</span>
            </div>
            <div class="tree-node" :class="`tree-node--${nodeColor(2)}`">
              <span class="tree-node__val">{{ tree[2].val }}</span>
              <span v-if="currentStep.resolved[2] !== undefined" class="tree-node__depth">d={{ currentStep.resolved[2] }}</span>
            </div>
          </div>
          <!-- Row 2 -->
          <div class="tree-row">
            <div class="tree-node tree-node--null"><span class="tree-node__val">∅</span></div>
            <div class="tree-node tree-node--null"><span class="tree-node__val">∅</span></div>
            <div class="tree-node" :class="`tree-node--${nodeColor(3)}`">
              <span class="tree-node__val">{{ tree[3].val }}</span>
              <span v-if="currentStep.resolved[3] !== undefined" class="tree-node__depth">d={{ currentStep.resolved[3] }}</span>
            </div>
            <div class="tree-node" :class="`tree-node--${nodeColor(4)}`">
              <span class="tree-node__val">{{ tree[4].val }}</span>
              <span v-if="currentStep.resolved[4] !== undefined" class="tree-node__depth">d={{ currentStep.resolved[4] }}</span>
            </div>
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
.tree-diagram { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.tree-row { display: flex; gap: 12px; justify-content: center; }
.tree-node { display: flex; flex-direction: column; align-items: center; width: 48px; height: 48px; border-radius: 50%; border: 2px solid rgba(var(--v-theme-on-surface), 0.2); background: rgba(var(--v-theme-on-surface), 0.04); justify-content: center; transition: background 0.25s, border-color 0.25s; }
.tree-node--primary { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.2); }
.tree-node--success { border-color: rgb(var(--v-theme-success)); background: rgba(var(--v-theme-success), 0.2); }
.tree-node--secondary { border-color: rgb(var(--v-theme-secondary)); background: rgba(var(--v-theme-secondary), 0.12); }
.tree-node--null { opacity: 0.2; border-style: dashed; }
.tree-node__val { font-size: 0.9rem; font-weight: 700; line-height: 1; }
.tree-node__depth { font-size: 0.55rem; opacity: 0.7; }
</style>
