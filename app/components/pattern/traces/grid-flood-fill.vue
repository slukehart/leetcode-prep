<script setup lang="ts">
const defaultGrid = [
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1'],
]

interface TraceStep {
  description: string
  grid: string[][]
  currentCell: [number,number] | null
  islandCount: number
}

function buildSteps(initial: string[][]): TraceStep[] {
  const steps: TraceStep[] = []
  const grid = initial.map(r => [...r])
  let count = 0

  steps.push({ description: 'Start. Scan grid for unvisited land cells ("1").', grid: grid.map(r=>[...r]), currentCell: null, islandCount: 0 })

  function dfs(r: number, c: number) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return
    grid[r][c] = '0'
    steps.push({ description: `  Mark [${r},${c}] as visited ('0'). Explore neighbors.`, grid: grid.map(row=>[...row]), currentCell: [r,c], islandCount: count })
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++
        steps.push({ description: `Found land at [${r},${c}]. Island #${count} — starting DFS flood fill.`, grid: grid.map(row=>[...row]), currentCell: [r,c], islandCount: count })
        dfs(r, c)
        steps.push({ description: `Island #${count} fully marked. Continue scan.`, grid: grid.map(row=>[...row]), currentCell: null, islandCount: count })
      }
    }
  }

  steps.push({ description: `Done! Total islands = ${count}.`, grid: grid.map(r=>[...r]), currentCell: null, islandCount: count })
  return steps
}

const steps = buildSteps(defaultGrid)
const stepIndex = ref(0)
const currentStep = computed(() => steps[stepIndex.value] ?? null)
function prev() { if (stepIndex.value > 0) stepIndex.value-- }
function next() { if (stepIndex.value < steps.length - 1) stepIndex.value++ }
function reset() { stepIndex.value = 0 }
</script>

<template>
  <v-card variant="elevated" elevation="2" class="mb-4">
    <v-card-text>
      <div class="section-label mb-4">Interactive Trace — Number of Islands</div>
      <template v-if="currentStep">
        <div class="grid mb-4">
          <div v-for="(row, r) in currentStep.grid" :key="r" class="grid-row">
            <div
              v-for="(cell, c) in row"
              :key="c"
              class="grid-cell"
              :class="{
                'grid-cell--land': defaultGrid[r][c] === '1' && cell === '1',
                'grid-cell--visited': defaultGrid[r][c] === '1' && cell === '0',
                'grid-cell--water': defaultGrid[r][c] === '0',
                'grid-cell--current': currentStep.currentCell?.[0] === r && currentStep.currentCell?.[1] === c,
              }"
            >{{ cell }}</div>
          </div>
        </div>
        <div class="mb-3"><v-chip color="primary" variant="tonal" size="small">Islands found: {{ currentStep.islandCount }}</v-chip></div>
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
.grid { display: flex; flex-direction: column; gap: 3px; }
.grid-row { display: flex; gap: 3px; }
.grid-cell { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: 700; font-size: 0.9rem; transition: background 0.2s; border: 1px solid transparent; }
.grid-cell--land { background: rgba(var(--v-theme-success), 0.25); border-color: rgba(var(--v-theme-success), 0.4); }
.grid-cell--visited { background: rgba(var(--v-theme-secondary), 0.2); border-color: rgba(var(--v-theme-secondary), 0.3); opacity: 0.6; }
.grid-cell--water { background: rgba(var(--v-theme-primary), 0.06); opacity: 0.4; }
.grid-cell--current { background: rgba(var(--v-theme-warning), 0.4) !important; border-color: rgb(var(--v-theme-warning)) !important; opacity: 1 !important; transform: scale(1.1); }
</style>
