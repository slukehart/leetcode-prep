import type { Content } from '~/types'

export function useContent() {
  return useAsyncData<Content>('content', () => $fetch('/api/content'))
}
