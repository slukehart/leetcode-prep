import type { Attempt } from '~/types'

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface DueResolve {
  problemId: string
  due: string
  stage: 'D+1' | 'D+7' | 'D+21'
}

// For each problem's latest attempt, the earliest scheduled re-solve stage
// (D+1, D+7, D+21) whose due date is on or before `now`.
export function dueResolves(attempts: Attempt[], now = today()): DueResolve[] {
  const latestByProblem = new Map<string, Attempt>()
  for (const a of attempts) {
    const prev = latestByProblem.get(a.problemId)
    if (!prev || a.date > prev.date) latestByProblem.set(a.problemId, a)
  }
  const out: DueResolve[] = []
  for (const a of latestByProblem.values()) {
    const stages: [number, DueResolve['stage']][] = [[1, 'D+1'], [7, 'D+7'], [21, 'D+21']]
    for (const [n, stage] of stages) {
      const due = addDays(a.date, n)
      if (due <= now) { out.push({ problemId: a.problemId, due, stage }); break }
    }
  }
  return out.sort((x, y) => x.due.localeCompare(y.due))
}
