import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
const dir = join(process.cwd(), 'server', 'data')
export default defineEventHandler(async () => {
  const [patterns, problems, curriculum] = await Promise.all([
    readFile(join(dir, 'patterns.json'), 'utf8'),
    readFile(join(dir, 'problems.json'), 'utf8'),
    readFile(join(dir, 'curriculum.json'), 'utf8'),
  ])
  return {
    patterns: JSON.parse(patterns),
    problems: JSON.parse(problems),
    curriculum: JSON.parse(curriculum),
  }
})
