import tailwindcss from '@tailwindcss/vite'

// Diese Datei läuft in Node, aber das Projekt hat kein @types/node (und soll keins bekommen).
// Deshalb hier die eine benutzte Eigenschaft von `process` deklarieren – erzeugt kein Laufzeit-Artefakt.
declare const process: { env: Record<string, string | undefined> }

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['shadcn-nuxt', '@nuxt/image'],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
  app: {
    // lang="de" ist Voraussetzung für hyphens: auto in den Headlines; data-style wählt das Stil-Preset (app/styles/presets.json)
    head: { htmlAttrs: { 'lang': 'de', 'data-style': 'kursbuch' } },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  hooks: {
    // Der Themer ist ein Dev-Werkzeug: im Build wird die Komponente gar nicht erst registriert,
    // sonst erzeugt Nuxt trotz v-if einen Chunk und lädt ihn per <link rel="prefetch"> vor.
    'components:extend'(components) {
      if (process.env.NODE_ENV === 'production') {
        const index = components.findIndex(component => component.pascalName === 'ThemePanel')
        if (index >= 0)
          components.splice(index, 1)
      }
    },
  },
})