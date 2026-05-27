import type { Progress, Attempt, Mistake, PatternStatus } from '~/types'

export function useProgress() {
  const progress = useState<Progress>('progress', () => ({
    patternStatus: {}, pathProgress: {}, attempts: [], mistakes: [],
  }))
  const loaded = useState<boolean>('progress-loaded', () => false)

  async function load() {
    progress.value = await $fetch<Progress>('/api/progress')
    loaded.value = true
  }
  async function save() {
    progress.value = await $fetch<Progress>('/api/progress', {
      method: 'PUT', body: progress.value,
    })
  }

  function uid() { return Math.random().toString(36).slice(2, 10) }

  function recomputePatternStatus(problems: { id: string; pattern: string }[]) {
    const cleanByPattern = new Map<string, number>()
    for (const a of progress.value.attempts) {
      if (a.result !== 'solved') continue
      const p = problems.find(x => x.id === a.problemId)?.pattern
      if (!p) continue
      cleanByPattern.set(p, (cleanByPattern.get(p) ?? 0) + 1)
    }
    for (const [p, n] of cleanByPattern) {
      const cur = progress.value.patternStatus[p]
      if (n >= 2) progress.value.patternStatus[p] = 'learned'
      else if (cur !== 'learned') progress.value.patternStatus[p] = 'learning'
    }
  }

  async function logAttempt(a: Omit<Attempt, 'id'>, problems: { id: string; pattern: string }[]) {
    progress.value.attempts.push({ ...a, id: uid() })
    recomputePatternStatus(problems)
    await save()
  }
  async function setPatternStatus(id: string, status: PatternStatus) {
    progress.value.patternStatus[id] = status
    await save()
  }
  async function togglePathItem(id: string) {
    progress.value.pathProgress[id] = !progress.value.pathProgress[id]
    await save()
  }
  async function addMistake(m: Omit<Mistake, 'id'>) {
    progress.value.mistakes.push({ ...m, id: uid() })
    await save()
  }

  return { progress, loaded, load, save, logAttempt, setPatternStatus, togglePathItem, addMistake }
}
