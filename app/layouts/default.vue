<script setup lang="ts">
import { useTheme } from 'vuetify'

const { load, loaded } = useProgress()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const THEME_KEY = 'lc-prep-theme'
type ThemeName = 'oceanLight' | 'oceanDark'

function toggleTheme() {
  const next: ThemeName = isDark.value ? 'oceanLight' : 'oceanDark'
  theme.global.name.value = next
  localStorage.setItem(THEME_KEY, next)
}

onMounted(() => {
  if (!loaded.value) load()
  const stored = localStorage.getItem(THEME_KEY)
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  // Cached choice wins; otherwise follow the OS on first visit.
  theme.global.name.value = stored === 'oceanLight' || stored === 'oceanDark'
    ? stored
    : (mq.matches ? 'oceanDark' : 'oceanLight')
  // Keep tracking the OS only until the user makes an explicit choice.
  mq.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      theme.global.name.value = e.matches ? 'oceanDark' : 'oceanLight'
    }
  })
})

const route = useRoute()
function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

const links = [
  { label: 'Study Path', to: '/path' },
  { label: 'Patterns', to: '/patterns' },
  { label: 'Practice', to: '/practice' },
  { label: 'Debug', to: '/debug' },
  { label: 'Tracker', to: '/tracker' },
]
</script>

<template>
  <v-app-bar flat :class="['app-bar', isDark ? 'app-bar--dark' : 'app-bar--light']">
    <v-app-bar-title class="app-bar__title">LC&nbsp;Prep</v-app-bar-title>
    <v-btn
      v-for="l in links"
      :key="l.to"
      :to="l.to"
      variant="text"
      class="app-bar__link"
      :class="{ 'app-bar__link--active': isActive(l.to) }"
    >
      {{ l.label }}
    </v-btn>
    <v-spacer />
    <v-btn variant="tonal" size="small" class="app-bar__toggle" @click="toggleTheme">
      {{ isDark ? 'Light' : 'Dark' }}
    </v-btn>
  </v-app-bar>
  <v-main class="page-bg">
    <v-container class="py-8" style="max-width: 960px">
      <slot />
    </v-container>
  </v-main>
</template>

<style scoped>
.app-bar {
  color: #fff;
}
.app-bar--light {
  background: linear-gradient(90deg, #0277BD, #00838F) !important;
}
.app-bar--dark {
  background: linear-gradient(90deg, #062335, #0a3a44) !important;
}
.app-bar :deep(.v-toolbar__content) {
  gap: 4px;
}
.app-bar__title {
  font-weight: 700;
  letter-spacing: 0.08em;
}
.app-bar__link {
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.01em;
}
.app-bar__link--active {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}
.app-bar__toggle {
  color: #fff;
}
.page-bg {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}
</style>
