<script setup lang="ts">
import { DEFAULT_STYLE, stylePresets } from '~/styles'
import { parseThemeStore, pickStyle, STORAGE_KEY } from '~/styles/storage'

// Der Themer läuft überall: im Dev-Server wie im Build. Das Stil-Preset ist damit auch in der
// ausgelieferten Seite umschaltbar; nuxt.config.ts (htmlAttrs['data-style']) liefert nur den Startwert,
// bevor Query-Parameter oder localStorage etwas anderes sagen.
const ids = stylePresets.map(preset => preset.id)
const dark = Object.fromEntries(stylePresets.map(preset => [preset.id, !!preset.dark]))

// Aktives Preset als Nuxt-Zustand: unhead hält data-style und .dark damit auch über Seitenwechsel hinweg fest.
// Das ThemePanel schreibt in denselben Zustand.
const activeStyle = useState('themer-style', () => DEFAULT_STYLE)
if (import.meta.client) {
  try {
    const query = new URLSearchParams(location.search).get('style')
    activeStyle.value = pickStyle(query, parseThemeStore(localStorage.getItem(STORAGE_KEY), ids, DEFAULT_STYLE), ids)
  }
  catch {
    // Speicher blockiert: beim Standard bleiben
  }
}

useHead({
  htmlAttrs: {
    'data-style': activeStyle,
    'class': computed(() => dark[activeStyle.value] ? 'dark' : ''),
  },
  // Gespeichertes Test-Theme schon im <head> setzen, damit die Seite beim Neuladen nicht kurz im Standard aufblitzt.
  // Gleiche Logik wie parseThemeStore/pickStyle, nur als ES5-Einzeiler ohne Importe. Wichtig: Wertebereich
  // (Radius 0–1.5) und Eigenschafts-Prüfung (hasOwnProperty statt `in`, das auch geerbte Object.prototype-Namen
  // träfe) müssen exakt zu parseThemeStore/pickStyle passen, sonst blitzt genau der Zustand auf, den dieses
  // Skript verhindern soll.
  script: [{
    key: 'themer-restore',
    innerHTML: `try{var K=${JSON.stringify(dark)},H=Object.prototype.hasOwnProperty,t=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');if(!t.overrides&&(t.brand||t.signal||t.radius!=null))t={style:'${DEFAULT_STYLE}',overrides:{'${DEFAULT_STYLE}':t}};var q=new URLSearchParams(location.search).get('style'),id=H.call(K,q)?q:(H.call(K,t.style)?t.style:'${DEFAULT_STYLE}'),e=document.documentElement,s=e.style,o=(t.overrides||{})[id]||{},h=/^#[0-9a-f]{6}$/i;e.setAttribute('data-style',id);e.classList.toggle('dark',K[id]);h.test(o.brand)&&s.setProperty('--theme-brand',o.brand);h.test(o.signal)&&s.setProperty('--theme-signal',o.signal);h.test(o.card)&&s.setProperty('--theme-card',o.card);typeof o.radius=='number'&&o.radius>=0&&o.radius<=1.5&&s.setProperty('--radius',o.radius+'rem')}catch(e){}`,
  }],
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <NuxtRouteAnnouncer />
    <a href="#inhalt" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-md">
      Zum Inhalt springen
    </a>
    <SiteHeader />
    <div id="inhalt" class="flex-1">
      <NuxtPage />
    </div>
    <SiteFooter />
    <ClientOnly>
      <!--
        Das Panel misst Farben über ein Canvas und liest den localStorage – beides gibt es nur im Browser,
        deshalb ClientOnly. Lazy: Der Chunk lädt nach dem Seiteninhalt, nicht mit ihm.
      -->
      <LazyThemePanel />
    </ClientOnly>
  </div>
</template>

<style>
  /* Seitenwechsel: nur opacity, kurz, ease-out – und gar nicht bei "Bewegung reduzieren" */
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.2s ease-out;
  }
  .page-enter-from,
  .page-leave-to {
    opacity: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .page-enter-active,
    .page-leave-active {
      transition: none;
    }
  }
</style>
