import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Per-user local progress file. Gitignored — never committed, so app/curriculum
// updates never touch anyone's personal data, and `git pull` never overwrites it.
export const progressFile = join(process.cwd(), 'server', 'data', 'progress.json')

export function defaultProgress() {
  return { patternStatus: {}, pathProgress: {}, attempts: [], mistakes: [] }
}

// Create the local progress file with defaults if it doesn't exist yet.
export async function ensureProgressFile(): Promise<void> {
  try {
    await readFile(progressFile, 'utf8')
  } catch {
    await writeFile(progressFile, JSON.stringify(defaultProgress(), null, 2))
  }
}
