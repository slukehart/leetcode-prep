export type PatternStatus = 'to-learn' | 'learning' | 'learned'
export type AttemptResult = 'solved' | 'stuck' | 'failed'

export interface PatternComplexity {
  time: string
  space: string
  explanation: string
}

export interface PatternWorkedExample {
  input: string
  steps: string[]
}

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
  // New optional fields — patterns without content still type-check
  intuition?: string
  complexity?: PatternComplexity
  workedExample?: PatternWorkedExample
  whenNotToUse?: string[]
}

export interface Problem {
  id: string            // leetcode slug, e.g. "two-sum"
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  pattern: string       // pattern id
  leetcodeUrl?: string  // optional — design problems may have no LeetCode page
  track: ('sprint' | 'mastery' | 'design' | 'senior')[]
}

export type BugType =
  | 'off-by-one'
  | 'mutation-during-iteration'
  | 'wrong-base-case'
  | 'integer-overflow'
  | 'wrong-comparison'
  | 'uninitialized-accumulator'
  | 'wrong-pointer-update'
  | 'missing-visited-check'

export interface DebugChoice {
  text: string
  correct: boolean
}

export interface DebugExercise {
  id: string
  title: string
  patternId: string                          // existing pattern id
  bugType: BugType
  difficulty: 'easy' | 'medium' | 'hard'
  buggyCode: string
  failingInput: string                        // e.g. "nums = [3,3], target = 6"
  expected: string                            // correct output, e.g. "[0,1]"
  actual: string                              // buggy output, e.g. "[] (or throws)"
  choices: DebugChoice[]                      // 3-4; exactly one correct: true
  explanation: string                         // revealed after answering
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
  id: 'sprint' | 'mastery' | 'design' | 'senior'
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
  scaffolds: Record<string, string>  // problemId -> copy-paste JS scaffold (stub + test harness)
  debugExercises: DebugExercise[]
}
