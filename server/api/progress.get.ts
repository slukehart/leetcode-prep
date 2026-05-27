import { readFile, writeFile } from 'node:fs/promises'
import { progressFile, defaultProgress } from '../utils/defaultProgress'

export default defineEventHandler(async () => {
  try {
    return JSON.parse(await readFile(progressFile, 'utf8'))
  } catch {
    const seed = defaultProgress()
    await writeFile(progressFile, JSON.stringify(seed, null, 2))
    return seed
  }
})
