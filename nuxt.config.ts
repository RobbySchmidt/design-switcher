import tailwindcss from '@tailwindcss/vite'

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
    // lang="de" ist Voraussetzung für hyphens: auto in den Headlines; data-style setzt das Start-Preset
    // (app/styles/presets.json). Den endgültigen Wert setzt der Themer in app.vue – auch im Build.
    head: { htmlAttrs: { 'lang': 'de', 'data-style': 'kursbuch' } },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})