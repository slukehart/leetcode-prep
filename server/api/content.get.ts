import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
const dir = join(process.cwd(), 'server', 'data')
export default defineEventHandler(async () => {
  const [patterns, problems, curriculum, scaffolds, debugExercises] = await Promise.all([
    readFile(join(dir, 'patterns.json'), 'utf8'),
    readFile(join(dir, 'problems.json'), 'utf8'),
    readFile(join(dir, 'curriculum.json'), 'utf8'),
    readFile(join(dir, 'scaffolds.json'), 'utf8'),
    readFile(join(dir, 'debug-exercises.json'), 'utf8'),
  ])
  return {
    patterns: JSON.parse(patterns),
    problems: JSON.parse(problems),
    curriculum: JSON.parse(curriculum),
    scaffolds: JSON.parse(scaffolds),
    debugExercises: JSON.parse(debugExercises),
  }
})
