// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['vuetify-nuxt-module'],
  devtools: { enabled: true },
  typescript: { strict: true },
  vuetify: {
    vuetifyOptions: {
      defaults: {
        VCard: { rounded: 'lg' },
        VBtn: { rounded: 'lg' },
        VChip: { rounded: 'lg' },
        VTextField: { variant: 'outlined', density: 'comfortable' },
        VAutocomplete: { variant: 'outlined', density: 'comfortable' },
      },
      theme: {
        defaultTheme: 'oceanLight',
        themes: {
          oceanLight: {
            dark: false,
            colors: {
              primary: '#0277BD',
              secondary: '#00838F',
              accent: '#00ACC1',
              success: '#2E7D32',
              warning: '#F9A825',
              error: '#C62828',
              background: '#F5FAFD',
              surface: '#FFFFFF',
            },
          },
          oceanDark: {
            dark: true,
            colors: {
              primary: '#4FC3F7',
              secondary: '#4DD0E1',
              accent: '#26C6DA',
              success: '#66BB6A',
              warning: '#FFCA28',
              error: '#EF5350',
              background: '#0B1722',
              surface: '#13222E',
            },
          },
        },
      },
    },
  },
})
