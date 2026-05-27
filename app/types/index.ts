export type PatternStatus = 'to-learn' | 'learning' | 'learned'
export type AttemptResult = 'solved' | 'stuck' | 'failed'

export interface Pattern {
  id: string
  name: string
  triggers: string[]
  whatItGives: string
  invariant: string
  jsSkeleton: string
  failureModes: string[]
  contrastCases: string[]
  relatedProblems: string[] // problem ids
}

export interface Problem {
  id: string            // leetcode slug, e.g. "two-sum"
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  pattern: string       // pattern id
  leetcodeUrl: string
  track: ('sprint' | 'mastery')[]
}

export interface PathItem {
  id: string
  label: string
  patternId?: string
  problemId?: string
}

export interface PathGroup {
  id: string
  title: string
  subtitle?: string
  items: PathItem[]
}

export interface CurriculumTrack {
  id: 'sprint' | 'mastery'
  title: string
  groups: PathGroup[]
}

export interface Attempt {
  id: string
  problemId: string
  date: string          // ISO yyyy-mm-dd
  minutes: number
  result: AttemptResult
  rootCause?: string
  processFix?: string
}

export interface Mistake {
  id: string
  date: string
  problemId: string
  mistake: string
  correctTrigger: string
  processFix: string
  resolveDate: string
  status: 'open' | 'resolved'
}

export interface Progress {
  patternStatus: Record<string, PatternStatus>
  pathProgress: Record<string, boolean>
  attempts: Attempt[]
  mistakes: Mistake[]
}

export interface Content {
  patterns: Pattern[]
  problems: Problem[]
  curriculum: CurriculumTrack[]
}
