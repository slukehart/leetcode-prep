import { writeFile } from 'node:fs/promises'
import { progressFile } from '../utils/defaultProgress'
function isProgress(b: unknown): boolean {
  if (!b || typeof b !== 'object') return false
  const obj = b as Record<string, unknown>
  return (
    typeof obj.patternStatus === 'object' && obj.patternStatus !== null &&
    typeof obj.pathProgress === 'object' && obj.pathProgress !== null &&
    Array.isArray(obj.attempts) &&
    Array.isArray(obj.mistakes)
  )
}
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!isProgress(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid progress shape' })
  }
  await writeFile(progressFile, JSON.stringify(body, null, 2))
  return body
})
