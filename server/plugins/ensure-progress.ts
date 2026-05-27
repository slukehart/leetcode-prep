import { ensureProgressFile } from '../utils/defaultProgress'

// Runs on server boot (dev + prod). Seeds the user's local progress.json if absent.
export default defineNitroPlugin(async () => {
  await ensureProgressFile()
})
