<script setup lang="ts">
/*
  Themer (nur im Dev-Modus eingebunden, siehe app.vue).
  Er wählt das Stil-Preset (data-style auf <html>) und setzt vier CSS-Variablen: --theme-brand, --theme-signal,
  --theme-card, --radius. Alles andere leitet app/styles/<id>/style.css daraus ab. Das Panel rechnet nichts selbst aus,
  sondern MISST die Farben, die der Browser tatsächlich auflöst (app/styles/measure.js).
  Anpassungen liegen je Preset getrennt im localStorage; dauerhaft werden sie erst über "CSS kopieren".
*/
import type { ThemeStore } from '~/styles/storage'
import { DEFAULT_STYLE, findStyle, stylePresets } from '~/styles'
import { measureStyle } from '~/styles/measure'
import { parseThemeStore, pickStyle, STORAGE_KEY } from '~/styles/storage'

const HEX = /^#[0-9a-f]{6}$/i
const ids = stylePresets.map(item => item.id)

const route = useRoute()
const activeStyle = useState('themer-style', () => DEFAULT_STYLE)
const preset = computed(() => findStyle(activeStyle.value) ?? stylePresets[0]!)

const open = ref(false)
const brand = ref(preset.value.defaults.brand)
const signal = ref(preset.value.defaults.signal)
const card = ref(preset.value.defaults.card ?? '') // leer = Standard des Presets
const radius = ref(preset.value.defaults.radius)
const copied = ref(false)

interface Check { label: string, ratio: number, min: number }
const checks = ref<Check[]>([])
const notes = ref<string[]>([])
const resolvedCard = ref('#ffffff')
let store: ThemeStore = { style: DEFAULT_STYLE, overrides: {} }

const failed = computed(() => checks.value.filter(check => check.ratio < check.min))
const isDefault = computed(() => {
  const defaults = preset.value.defaults
  return brand.value.toLowerCase() === defaults.brand && signal.value.toLowerCase() === defaults.signal
    && card.value.toLowerCase() === (defaults.card ?? '') && radius.value === defaults.radius
})
const cssSnippet = computed(() => [
  `/* app/styles/${preset.value.id}/style.css – oben im Block :root[data-style="${preset.value.id}"] */`,
  `--theme-brand: ${brand.value};`,
  `--theme-signal: ${signal.value};`,
  ...(card.value ? [`--theme-card: ${card.value};`] : []),
  `--radius: ${radius.value}rem;`,
  '',
  '/* nuxt.config.ts → app.head.htmlAttrs (macht dieses Preset zum Standard) */',
  `'data-style': '${preset.value.id}',${preset.value.dark ? ` 'class': 'dark',` : ''}`,
].join('\n'))

function runChecks() {
  const result = measureStyle()
  checks.value = result.checks
  resolvedCard.value = result.resolved.card

  const list: string[] = []
  if (result.resolved.primary !== brand.value.toLowerCase())
    list.push(`Buttons und Links verwenden ${result.resolved.primary} – der Stil leitet die Aktionsfarbe aus deinen Eingaben ab.`)
  if (result.resolved.signal !== signal.value.toLowerCase())
    list.push(`Auf den Grundflächen wird das Signal als ${result.resolved.signal} verwendet.`)
  if (result.resolved.signalOnDark !== signal.value.toLowerCase())
    list.push(`Auf dunklen Flächen wird das Signal als ${result.resolved.signalOnDark} verwendet.`)
  notes.value = list
}

// ---------- Anwenden, speichern, zurücksetzen ----------
function apply() {
  const root = document.documentElement
  // data-style und .dark hält app.vue über useHead fest; hier zusätzlich sofort setzen, damit die Messung gleich stimmt
  root.setAttribute('data-style', preset.value.id)
  root.classList.toggle('dark', !!preset.value.dark)

  const style = root.style
  if (HEX.test(brand.value))
    style.setProperty('--theme-brand', brand.value)
  if (HEX.test(signal.value))
    style.setProperty('--theme-signal', signal.value)
  if (HEX.test(card.value))
    style.setProperty('--theme-card', card.value)
  else
    style.removeProperty('--theme-card')
  style.setProperty('--radius', `${radius.value}rem`)

  store.style = preset.value.id
  if (isDefault.value)
    delete store.overrides[preset.value.id]
  else
    store.overrides[preset.value.id] = { brand: brand.value, signal: signal.value, card: card.value, radius: radius.value }
  try {
    if (store.style === DEFAULT_STYLE && !Object.keys(store.overrides).length)
      localStorage.removeItem(STORAGE_KEY)
    else
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }
  catch {
    // Speicher blockiert (privates Fenster): das Theme gilt dann nur bis zum Neuladen
  }
  requestAnimationFrame(runChecks)
}

// Werte des aktiven Presets laden: gespeicherte Anpassung oder seine Standardwerte
function loadValues() {
  const saved = store.overrides[preset.value.id] ?? {}
  const defaults = preset.value.defaults
  brand.value = saved.brand ?? defaults.brand
  signal.value = saved.signal ?? defaults.signal
  card.value = saved.card ?? defaults.card ?? ''
  radius.value = saved.radius ?? defaults.radius
}

function reset() {
  delete store.overrides[preset.value.id]
  loadValues()
}

async function copyCss() {
  try {
    await navigator.clipboard.writeText(cssSnippet.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
  catch {
    // kein Clipboard-Zugriff: Der Text steht sichtbar im Panel und lässt sich markieren
  }
}

onMounted(() => {
  try {
    store = parseThemeStore(localStorage.getItem(STORAGE_KEY), ids, DEFAULT_STYLE)
  }
  catch {
    // Speicher blockiert: mit den Standardwerten weitermachen
  }
  activeStyle.value = pickStyle(route.query.style, store, ids)
  loadValues()
  apply()
})
// Reihenfolge ist wichtig: erst die Werte des neuen Presets laden, dann anwenden
watch(activeStyle, loadValues)
watch([activeStyle, brand, signal, card, radius], apply)
</script>

<template>
  <div class="themer">
    <button
      type="button"
      class="themer-toggle"
      :aria-expanded="open"
      aria-controls="themer-panel"
      @click="open = !open"
    >
      <Icon :name="open ? 'X' : 'Palette'" :size="22" />
      <span class="sr-only">{{ open ? 'Themer schließen' : 'Themer öffnen' }}</span>
      <span v-if="!open && failed.length" class="themer-toggle-badge" aria-hidden="true">{{ failed.length }}</span>
    </button>

    <section v-show="open" id="themer-panel" class="themer-panel" aria-label="Themer">
      <header class="themer-head">
        <strong>Themer</strong>
        <span>nur im Dev-Modus sichtbar</span>
      </header>

      <div class="themer-field">
        <label for="themer-style">Stil</label>
        <select id="themer-style" v-model="activeStyle" class="themer-select">
          <option v-for="item in stylePresets" :key="item.id" :value="item.id">
            {{ item.label }}
          </option>
        </select>
        <p class="themer-hint">
          {{ preset.description }} Farben und Radius unten starten mit den Werten dieses Stils; deine Anpassungen merkt sich der Themer je Stil.
        </p>
      </div>

      <div class="themer-field">
        <label for="themer-brand">Brand</label>
        <div class="themer-color">
          <input v-model="brand" type="color" aria-label="Brand wählen">
          <input id="themer-brand" v-model.trim="brand" type="text" inputmode="text" spellcheck="false" maxlength="7" :aria-invalid="!HEX.test(brand)">
        </div>
        <p v-if="!HEX.test(brand)" class="themer-error">
          Bitte als #rrggbb eingeben.
        </p>
        <p v-else class="themer-hint">
          Markenfläche und Farbton der Flächen – was genau der Stil daraus macht, zeigt die Liste unten.
        </p>
      </div>

      <div class="themer-field">
        <label for="themer-signal">Signal</label>
        <div class="themer-color">
          <input v-model="signal" type="color" aria-label="Signal wählen">
          <input id="themer-signal" v-model.trim="signal" type="text" spellcheck="false" maxlength="7" :aria-invalid="!HEX.test(signal)">
        </div>
        <p v-if="!HEX.test(signal)" class="themer-error">
          Bitte als #rrggbb eingeben.
        </p>
        <p v-else class="themer-hint">
          Punkte, Linien und das farbige Wort in der Überschrift.
        </p>
      </div>

      <div class="themer-field">
        <label for="themer-card">Card <span>(optional)</span></label>
        <div class="themer-color">
          <input :value="card || resolvedCard" type="color" aria-label="Card wählen" @input="card = ($event.target as HTMLInputElement).value">
          <input id="themer-card" v-model.trim="card" type="text" spellcheck="false" maxlength="7" placeholder="Standard" :aria-invalid="!!card && !HEX.test(card)">
          <button v-if="card" type="button" class="themer-link" @click="card = ''">
            Standard
          </button>
        </div>
        <p v-if="card && !HEX.test(card)" class="themer-error">
          Bitte als #rrggbb eingeben oder leer lassen.
        </p>
        <p v-else class="themer-hint">
          Helle Fläche für Sektionen. Leer = fast Weiß im Farbton des Brands ({{ resolvedCard }}). Bitte hell bleiben, der Text darauf ist dunkel.
        </p>
      </div>

      <div class="themer-field">
        <label for="themer-radius">Radius <span>{{ Math.round(radius * 16) }} px</span></label>
        <input id="themer-radius" v-model.number="radius" type="range" min="0" max="1.5" step="0.125">
        <p class="themer-hint">
          Ein Wert für alle Rundungen: Buttons {{ Math.max(0, Math.round(radius * 16) - 2) }} px, Kacheln {{ Math.round(radius * 24) }} px. Pillen bleiben rund.
        </p>
      </div>

      <div class="themer-checks">
        <p class="themer-status" :data-ok="!failed.length || undefined">
          <Icon :name="failed.length ? 'TriangleAlert' : 'Check'" :size="18" />
          {{ failed.length ? `${failed.length} von ${checks.length} Kontrasten ${failed.length === 1 ? 'reicht' : 'reichen'} nicht` : `Alle ${checks.length} Kontraste bestehen` }}
        </p>
        <p v-for="note in notes" :key="note" class="themer-hint">
          {{ note }}
        </p>
        <details :open="failed.length > 0">
          <summary>Alle Kontraste</summary>
          <ul>
            <li v-for="check in checks" :key="check.label" :data-fail="check.ratio < check.min || undefined">
              <span>{{ check.label }}</span>
              <span>{{ check.ratio.toFixed(1) }} <small>/ {{ check.min }}</small></span>
            </li>
          </ul>
        </details>
      </div>

      <pre class="themer-css">{{ cssSnippet }}</pre>

      <div class="themer-actions">
        <button type="button" class="themer-button" @click="copyCss">
          <Icon :name="copied ? 'Check' : 'Copy'" :size="16" />
          {{ copied ? 'Kopiert' : 'CSS kopieren' }}
        </button>
        <button type="button" class="themer-button themer-button-quiet" :disabled="isDefault" @click="reset">
          <Icon name="RotateCcw" :size="16" />
          Zurücksetzen
        </button>
      </div>
      <p class="themer-hint">
        Dauerhaft wird es erst, wenn du die kopierten Zeilen in die genannte Datei einträgst.
      </p>
    </section>
  </div>
</template>

<style scoped>
/*
  Das Panel benutzt bewusst KEINE Theme-Tokens, sondern eine feste neutrale Palette:
  Es muss lesbar bleiben, egal welche Farben du gerade ausprobierst.
*/
.themer {
  --t-surface: #ffffff;
  --t-text: #16181d;
  --t-soft: #5b6270;
  --t-line: #d5d9e0;
  --t-field: #8a919e;
  --t-fill: #f1f3f6;
  --t-ok: #14663a;
  --t-fail: #a3220f;
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 60;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; /* das Panel bleibt stilneutral */
  font-size: 0.9375rem;
  line-height: 1.45;
  color: var(--t-text);
}
/* Auf der Stellenseite liegt unten die mobile Bewerben-Leiste */
@media (max-width: 63.99rem) {
  .themer { bottom: 5.5rem; }
}
.themer-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 1px solid var(--t-line);
  background: var(--t-surface);
  color: var(--t-text);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.1), 0 8px 24px -6px rgb(0 0 0 / 0.2);
  cursor: pointer;
}
.themer-toggle-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: 0.25rem;
  border-radius: 9999px;
  background: var(--t-fail);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}
.themer-panel {
  position: absolute;
  left: 0;
  bottom: 3.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 22rem;
  max-width: calc(100vw - 2rem);
  max-height: min(42rem, calc(100vh - 10rem));
  overflow-y: auto;
  padding: 1.25rem;
  border: 1px solid var(--t-line);
  border-radius: 0.75rem;
  background: var(--t-surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.1), 0 16px 40px -8px rgb(0 0 0 / 0.25);
}
.themer-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
.themer-head strong { font-size: 1.125rem; }
.themer-head span, .themer-hint { color: var(--t-soft); font-size: 0.8125rem; margin: 0; }
.themer-field { display: flex; flex-direction: column; gap: 0.375rem; }
.themer-field label { display: flex; justify-content: space-between; font-weight: 600; }
.themer-field label span { font-weight: 400; color: var(--t-soft); }
.themer-color { display: flex; align-items: center; gap: 0.5rem; }
.themer-color input[type='color'] {
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  padding: 0.125rem;
  border: 1px solid var(--t-field);
  border-radius: 0.375rem;
  background: var(--t-surface);
  cursor: pointer;
}
.themer-color input[type='text'] {
  min-width: 0;
  flex: 1;
  height: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid var(--t-field);
  border-radius: 0.375rem;
  background: var(--t-surface);
  color: var(--t-text);
  font: inherit;
  font-size: 1rem; /* >= 16 px, sonst zoomt iOS beim Fokus */
  font-variant-numeric: tabular-nums;
}
.themer-color input[aria-invalid='true'] { border-color: var(--t-fail); }
.themer-select {
  height: 2.75rem;
  padding-inline: 0.75rem;
  border: 1px solid var(--t-field);
  border-radius: 0.375rem;
  background: var(--t-surface);
  color: var(--t-text);
  font: inherit;
  font-size: 1rem; /* >= 16 px, sonst zoomt iOS beim Fokus */
}
.themer-field input[type='range'] { width: 100%; height: 1.75rem; accent-color: var(--t-text); }
.themer-error { margin: 0; color: var(--t-fail); font-size: 0.8125rem; }
.themer-link { border: 0; background: none; padding: 0.5rem 0.25rem; color: var(--t-text); font: inherit; text-decoration: underline; cursor: pointer; }
.themer-checks { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--t-line); }
.themer-status { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-weight: 600; color: var(--t-fail); }
.themer-status[data-ok] { color: var(--t-ok); }
.themer-checks summary { cursor: pointer; color: var(--t-soft); font-size: 0.8125rem; padding-block: 0.25rem; }
.themer-checks ul { list-style: none; margin: 0.375rem 0 0; padding: 0; display: flex; flex-direction: column; font-size: 0.8125rem; }
.themer-checks li { display: flex; justify-content: space-between; gap: 0.75rem; padding-block: 0.3125rem; border-top: 1px solid var(--t-line); font-variant-numeric: tabular-nums; }
.themer-checks li[data-fail] { color: var(--t-fail); font-weight: 600; }
.themer-checks small { color: var(--t-soft); font-weight: 400; }
.themer-css { margin: 0; padding: 0.75rem; border-radius: 0.375rem; background: var(--t-fill); font-size: 0.8125rem; white-space: pre-wrap; user-select: all; }
.themer-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.themer-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding-inline: 1rem;
  border: 1px solid var(--t-text);
  border-radius: 0.375rem;
  background: var(--t-text);
  color: var(--t-surface);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.themer-button-quiet { background: var(--t-surface); color: var(--t-text); border-color: var(--t-field); }
.themer-button:disabled { opacity: 0.45; cursor: not-allowed; }
.themer code { font-size: 0.8125rem; }
.themer :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
</style>
