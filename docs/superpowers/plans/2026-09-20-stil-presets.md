# Stil-Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fünf per Themer umschaltbare, eigenständige Stil-Presets (Kursbuch, Plakat, Weich, Leitstand, Editorial) bei unveränderten Daten, Texten und unverändertem Markup-Aufbau.

**Architecture:** `data-style="<id>"` auf `<html>` wählt einen Block `:root[data-style="<id>"]`, der den gesamten Token-Vertrag definiert (Farben, Schriften, Typo-Rollen, Form, Kachel, Bewegung). Templates benutzen nur noch Rollen (`type-*`, `tile`, `surface-header` …) aus `app/styles/contract.css`; jedes Preset ordnet die Flächenrollen per `@apply` einer Flächenart zu (`surface-ink`, `surface-brand`, `surface-plain`). Der Themer (nur Dev) wählt das Preset und setzt weiter die vier Eingaben inline.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4 (`@utility`, `@theme inline`, relative Farbsyntax), shadcn-vue, fontsource, Node 24 (`node --test`, CDP über eingebautes `WebSocket`), Yarn 1.

**Spec:** `docs/superpowers/specs/2026-09-20-stil-presets-design.md` – vor jeder Aufgabe lesen. Verbindlich sind außerdem `docs/design-research.md` und `docs/design-konzept.md`.

## Global Constraints

- **Kein Git-Repository:** Es gibt keine Commits. Jede Aufgabe endet stattdessen mit einem „Checkpoint“ (Prüfbefehle + erwartetes Ergebnis).
- **Umlaute:** Dateien nie mit PowerShell `Get-Content`/`Set-Content` anfassen (zerstört UTF-8). Nur Write/Edit-Werkzeuge oder Node.
- **Shell:** Befehle sind für Git Bash geschrieben. Paketmanager ist **Yarn 1** (`yarn add …`), nicht npm.
- **TypeScript bleibt auf 6.x.** Keine Upgrades von Abhängigkeiten, nur die genannten Font-Pakete kommen dazu.
- **Fonts nur selbst gehostet** (fontsource). Nie ein `@import` von `fonts.googleapis.com`.
- **Keine Hex-/Arbitrary-Farben in Templates**, nur Token-Klassen. In Preset-CSS Farben als OKLCH bzw. abgeleitet per relativer Farbsyntax aus `--theme-brand` / `--theme-signal`.
- **Custom Properties lösen dort auf, wo sie deklariert sind.** Alles, was aus `--theme-*` abgeleitet wird, steht im Block `:root[data-style="…"]` (also auf `<html>`). Eine Variable, die innerhalb einer Fläche anders auflösen soll (z. B. `--primary` auf der Markenfläche), darf **nicht** über eine Root-Variable durchgereicht werden.
- **Tailwind v4:** kein `@apply` auf Komponenten-Klassen in `@layer components`. `@apply` von `@utility`-Utilities in normalen Regeln ist erlaubt und wird hier benutzt. Nach jeder CSS-Änderung bauen und das Ergebnis prüfen – ein kaputtes `@apply` killt den Build teils ohne Fehlermeldung.
- **Seiten unter `app/pages/`:** genau ein Wurzelknoten, Kommentare **in** das `<main>`.
- **Server für Prüfungen:** immer der gebaute Server auf Port 3100 (`npx nuxt build`, dann `PORT=3100 node .output/server/index.mjs` im Hintergrund). Nicht den Dev-Server des Nutzers benutzen oder neu starten. Nach jedem Build den alten Prozess auf 3100 beenden und neu starten.
- **Dev-Server des Nutzers:** `nuxt build` und `yarn add` schreiben in `.nuxt` bzw. `node_modules` und bringen einen laufenden Dev-Server aus dem Tritt (Seite rendert, nichts ist klickbar). Nie einen zweiten `nuxt dev` parallel zu einem laufenden starten – beide teilen sich `.nuxt`. Am Ende (Task 10) den Nutzer bitten, seinen Dev-Server neu zu starten.
- **Prüf-URLs:** `http://localhost:3100/`, `http://localhost:3100/jobs`, `http://localhost:3100/jobs/ausbildung-fachinformatiker-anwendungsentwicklung` (längster Titel).
- **Ausgabeordner für Screenshots:** unter `.shots/` im Projekt (am Ende wieder löschen), z. B. `.shots/vorher`.
- **Je Preset gilt die Methode der Research:** erst rechnen (`scripts/contrast.mjs --style <id>`) und `konzept.md` schreiben, dann `style.css`, dann prüfen. Durchgefallene Paare werden nicht ignoriert: Token-Helligkeit in Rezept **und** CSS anpassen, bis das Paar besteht, oder die Kombination im Konzept als verboten dokumentieren (nur wenn sie im Layout nicht vorkommt).
- **Sprache:** Code-Kommentare, Doku und UI-Texte deutsch, im Ton der vorhandenen Dateien.

## Abweichungen von der Spec (bewusst, beim Planen entschieden)

- **Kein `--tile-radius` / `--image-radius`:** Kacheln, Bilder und Tafel behalten `rounded-xl` (= `--radius` × 1.5). Damit folgt alles dem einen Radius, und der Radius-Regler im Themer wirkt weiter auf alles.
- **Kein `--transition-state`:** Nur Plakat will harte Zustandswechsel; das löst eine Regel in `plakat/style.css`.
- **Gemeinsame Aliase** (`--card-foreground`, `--popover`, `--sidebar-*`, `--chart-*`, `--brand`, `--card`) stehen einmal in `contract.css` statt in jedem Preset. Sie tragen keinen Stilwert; „jedes Preset definiert den gesamten Vertrag“ gilt für alle Stilwerte.
- **Zusätzliche Rollen**, die die Bestandsaufnahme ergeben hat: `type-box-title`, `type-figure-sm`, `type-board`, `type-wordmark`, Flächenart `surface-plain`, Hook-Klassen `board-head`/`board-cols`/`board-foot`.
- **`--signal-on-brand`** setzt jedes Preset passend zu seinem Standard-Brand (hell oder dunkel). Automatisch aus der Helligkeit des Brands ableiten lässt es sich in CSS nicht (relative Farbsyntax kennt nur **eine** Ursprungsfarbe). Wählt man im Themer einen Brand mit der anderen Helligkeit, meldet die Ampel das Paar.

## Dateistruktur

| Datei | Aufgabe |
|---|---|
| `app/styles/presets.json` | Registry-Daten (auch von den Node-Skripten gelesen) |
| `app/styles/index.ts` | typisierter Zugriff auf die Registry |
| `app/styles/storage.ts` | Speicherformat des Themers lesen/bereinigen (reine Funktionen) |
| `app/styles/measure.js` | Kontraste im Browser messen (vom Themer **und** von `check-styles.mjs` benutzt) |
| `app/styles/contract.css` | Flächenarten, Rollen-Utilities, `.tile`, Tafel-Bewegung, gemeinsame Aliase |
| `app/styles/<id>/style.css` | ein Preset: Werte für den Vertrag + Zuordnung der Flächenrollen |
| `app/styles/<id>/konzept.md` | Konzept des Presets (nicht für Kursbuch – dessen Konzept bleibt `docs/design-konzept.md`) |
| `app/assets/css/tailwind.css` | Importe, `@theme inline`, Basis-Typo (verliert den `:root`-Block) |
| `scripts/lib/cdp.mjs` | gemeinsamer CDP-Unterbau |
| `scripts/screenshot.mjs` | Screenshots, neu mit `--style <id>` |
| `scripts/compare-shots.mjs` | Pixelvergleich zweier Screenshot-Ordner |
| `scripts/style-recipes.mjs` | Token-Rezepte je Preset für die Kontrastrechnung |
| `scripts/contrast.mjs` | Kontrast- und Gamut-Nachweis, neu mit `--style <id>` |
| `scripts/check-styles.mjs` | Vollständigkeit der Presets + Messung im Browser |
| `scripts/tests/theme-storage.test.mjs` | Tests für `storage.ts` (`node --test`) |

---

### Task 1: Prüfwerkzeuge und Vorher-Screenshots

**Files:**
- Create: `scripts/lib/cdp.mjs`
- Create: `scripts/compare-shots.mjs`
- Modify: `scripts/screenshot.mjs` (ganzer Inhalt)

**Interfaces:**
- Produces: `launchBrowser(): Promise<{ port: number, close(): void }>`, `openPage(port, { url, width, height? }): Promise<{ cdp, evaluate(expression: string): Promise<any> }>`, `sleep(ms)` aus `scripts/lib/cdp.mjs`. `node scripts/compare-shots.mjs <ordnerA> <ordnerB>` (Exit-Code 1 bei Abweichung). Ordner `.shots/vorher` mit 24 PNGs.

- [ ] **Step 1: CDP-Unterbau auslagern**

`scripts/lib/cdp.mjs`:

```js
// Gemeinsamer Unterbau für screenshot.mjs und check-styles.mjs: Browser starten, per CDP verbinden, Seite öffnen.
// Braucht nur Node >= 22 (WebSocket, fetch) und einen installierten Edge oder Chrome.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function launchBrowser() {
  const browser = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ].find(existsSync)
  if (!browser)
    throw new Error('Kein Edge/Chrome gefunden')

  const port = 9300 + Math.floor(Math.random() * 500)
  const proc = spawn(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-shot-'))}`,
    'about:blank',
  ], { stdio: 'ignore' })

  for (let i = 0; i < 50; i++) {
    try {
      await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
      return { port, close: () => proc.kill() }
    }
    catch {
      await sleep(200)
    }
  }
  proc.kill()
  throw new Error('Browser antwortet nicht')
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    const pending = new Map()
    let id = 0
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id)
        pending.delete(message.id)
        message.error ? reject(new Error(message.error.message)) : resolve(message.result)
      }
    }
    ws.onerror = reject
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((resolve, reject) => {
        pending.set(++id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params }))
      }),
      close: () => ws.close(),
    })
  })
}

// Öffnet einen neuen Tab mit echter Viewport-Emulation (auch < 500 px) und wartet, bis die Seite steht
export async function openPage(port, { url, width, height = 900 }) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  const cdp = await connect(target.webSocketDebuggerUrl)
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 })
  await cdp.send('Page.enable')
  await cdp.send('Page.navigate', { url })
  await sleep(3500)
  const evaluate = async expression =>
    (await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value
  return { cdp, evaluate }
}
```

- [ ] **Step 2: `scripts/screenshot.mjs` auf den Unterbau umstellen**

Ganzen Inhalt ersetzen (Verhalten unverändert, die Option `--style` kommt erst in Task 5):

```js
// Screenshots per Chrome DevTools Protocol mit echter Viewport-Emulation (auch < 500 px) + Überlauf-Prüfung.
// Aufruf: node scripts/screenshot.mjs <ausgabeordner> <url> [breite ...]      (Standardbreiten: 360 768 1280 1536)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, openPage, sleep } from './lib/cdp.mjs'

const [outDir, url, ...widthArgs] = process.argv.slice(2)
if (!outDir || !url) {
  console.error('Aufruf: node scripts/screenshot.mjs <ausgabeordner> <url> [breite ...]')
  process.exit(1)
}
const widths = widthArgs.length ? widthArgs.map(Number) : [360, 768, 1280, 1536]

const browser = await launchBrowser()
try {
  mkdirSync(outDir, { recursive: true })
  const name = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'start'

  for (const width of widths) {
    const { cdp, evaluate } = await openPage(browser.port, { url, width })
    // Lazy-Bilder laden: einmal durchscrollen
    await evaluate(`(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } scrollTo(0, 0) })()`)
    await sleep(800)

    const metrics = await evaluate(`JSON.stringify({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, height: document.documentElement.scrollHeight, style: document.documentElement.dataset.style ?? '-', fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).filter((v, i, a) => a.indexOf(v) === i) })`)
    const { scrollWidth, clientWidth, height, style, fonts } = JSON.parse(metrics)

    // Erster Screen so, wie man ihn wirklich sieht (sticky Header inklusive – im Ganzseiten-Bild verrutscht er)
    const fold = await cdp.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(outDir, `${name}-${width}-fold.png`), Buffer.from(fold.data, 'base64'))

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: Math.min(height, 12000), scale: 1 },
    })
    const file = join(outDir, `${name}-${width}.png`)
    writeFileSync(file, Buffer.from(shot.data, 'base64'))
    console.log(`${width}px  Stil: ${style}  Überlauf: ${scrollWidth > clientWidth ? `JA (${scrollWidth} > ${clientWidth})` : 'nein'}  Höhe: ${height}px  Fonts: ${fonts.join(', ')}  -> ${file}`)
    cdp.close()
  }
}
finally {
  browser.close()
}
```

- [ ] **Step 3: Pixelvergleich schreiben**

`scripts/compare-shots.mjs`:

```js
// Vergleicht zwei Screenshot-Ordner Pixel für Pixel (gleiche Dateinamen). Ohne Abhängigkeiten: PNG-Decoder über zlib.
// Aufruf: node scripts/compare-shots.mjs <ordnerA> <ordnerB> [--tolerance <pixel>]   -> Exit-Code 1 bei Abweichung
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inflateSync } from 'node:zlib'

const args = process.argv.slice(2)
const toleranceIndex = args.indexOf('--tolerance')
const tolerance = toleranceIndex >= 0 ? Number(args.splice(toleranceIndex, 2)[1]) : 0
const [dirA, dirB] = args
if (!dirA || !dirB) {
  console.error('Aufruf: node scripts/compare-shots.mjs <ordnerA> <ordnerB> [--tolerance <pixel>]')
  process.exit(1)
}

function decodePng(file) {
  const buf = readFileSync(file)
  let pos = 8, width = 0, height = 0, colorType = 0, bitDepth = 0
  const idat = []
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos)
    const type = buf.toString('latin1', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      if (data[12])
        throw new Error(`${file}: Interlacing wird nicht unterstützt`)
    }
    if (type === 'IDAT')
      idat.push(data)
    pos += 12 + length
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6))
    throw new Error(`${file}: nur 8-Bit RGB/RGBA`)

  const bpp = colorType === 6 ? 4 : 3
  const stride = width * bpp
  const raw = inflateSync(Buffer.concat(idat))
  const px = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const out = px.subarray(y * stride, (y + 1) * stride)
    const prev = y ? px.subarray((y - 1) * stride, y * stride) : null
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0
      const b = prev ? prev[x] : 0
      const c = prev && x >= bpp ? prev[x - bpp] : 0
      let value = line[x]
      if (filter === 1) value += a
      else if (filter === 2) value += b
      else if (filter === 3) value += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      out[x] = value & 255
    }
  }
  return { width, height, bpp, px }
}

let failed = 0
for (const name of readdirSync(dirA).filter(file => file.endsWith('.png')).sort()) {
  let a, b
  try {
    a = decodePng(join(dirA, name))
    b = decodePng(join(dirB, name))
  }
  catch (error) {
    console.log(`FEHLT/DEFEKT  ${name}  (${error.message})`)
    failed++
    continue
  }
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`GRÖSSE        ${name}  ${a.width}×${a.height} gegen ${b.width}×${b.height}`)
    failed++
    continue
  }
  let different = 0, firstRow = -1, lastRow = -1
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * a.bpp, j = (y * b.width + x) * b.bpp
      if (Math.abs(a.px[i] - b.px[j]) > 2 || Math.abs(a.px[i + 1] - b.px[j + 1]) > 2 || Math.abs(a.px[i + 2] - b.px[j + 2]) > 2) {
        different++
        if (firstRow < 0) firstRow = y
        lastRow = y
      }
    }
  }
  const ok = different <= tolerance
  if (!ok) failed++
  console.log(`${ok ? 'gleich       ' : 'ABWEICHUNG   '} ${name}  ${different} Pixel${different ? ` (Zeilen ${firstRow}–${lastRow})` : ''}`)
}
console.log(failed ? `\n${failed} Datei(en) weichen ab.` : '\nAlle Dateien deckungsgleich.')
process.exit(failed ? 1 : 0)
```

- [ ] **Step 4: Bauen, Server starten, Vorher-Screenshots aufnehmen – zweimal**

```bash
npx nuxt build
PORT=3100 node .output/server/index.mjs   # im Hintergrund starten
for run in vorher vorher2; do
  node scripts/screenshot.mjs .shots/$run http://localhost:3100/
  node scripts/screenshot.mjs .shots/$run http://localhost:3100/jobs
  node scripts/screenshot.mjs .shots/$run http://localhost:3100/jobs/ausbildung-fachinformatiker-anwendungsentwicklung
done
```

Expected: je Lauf 12 Zeilen, überall `Überlauf: nein`, Fonts enthalten `Barlow Semi Condensed` und `Source Sans 3 Variable`. Je Ordner 24 PNGs.

- [ ] **Step 5: Grundrauschen messen (der eigentliche Test des Vergleichsskripts)**

```bash
node scripts/compare-shots.mjs .shots/vorher .shots/vorher2
```

Expected: `Alle Dateien deckungsgleich.` Falls einzelne Dateien wenige Pixel abweichen (Antialiasing), die größte Zahl als `N` notieren – sie ist die `--tolerance` für Task 2 und 3. Weichen ganze Zeilenbereiche ab, ist eine Animation noch nicht fertig: in `openPage` die Wartezeit von 3500 auf 5000 ms erhöhen und Step 4 wiederholen.

Gegenprobe, dass das Skript Abweichungen überhaupt erkennt:

```bash
mkdir -p .shots/kaputt && cp .shots/vorher/jobs-360.png .shots/kaputt/start-360.png
node scripts/compare-shots.mjs .shots/kaputt .shots/vorher
```

Expected: `GRÖSSE` oder `ABWEICHUNG` für `start-360.png`, Exit-Code 1. Danach `.shots/kaputt` und `.shots/vorher2` löschen.

- [ ] **Step 6: Checkpoint**

`.shots/vorher` enthält 24 PNGs, `compare-shots.mjs` meldet für identische Ordner Erfolg und für verschiedene Bilder einen Fehler.

---

### Task 2: Vertrag, Registry und Kursbuch als Preset (nur CSS-Unterbau)

Die Templates bleiben in dieser Aufgabe unverändert. Ziel: Alle heutigen Werte kommen aus `app/styles/kursbuch/style.css`, die Seite sieht exakt gleich aus.

**Files:**
- Create: `app/styles/presets.json`, `app/styles/index.ts`, `app/styles/contract.css`, `app/styles/kursbuch/style.css`
- Modify: `app/assets/css/tailwind.css` (Importe, `@theme inline`, `:root`-Block und `surface-*`-Utilities entfernen, Basis-Typo)
- Modify: `nuxt.config.ts` (`htmlAttrs`)

**Interfaces:**
- Produces (CSS, für alle späteren Aufgaben):
  - Flächenarten: `surface-ink`, `surface-brand`, `surface-plain` (setzen zusätzlich `--surface-bg`)
  - Hook-Klassen für Flächenrollen: `surface-header`, `surface-footer`, `surface-board`, `surface-highlight`, `tile-featured` (Zuordnung in jedem Preset per `@apply`)
  - Rollen-Utilities: `type-h1`, `type-h1-page`, `type-h2`, `type-h3-lg`, `type-h3`, `type-box-title`, `type-lead`, `type-figure`, `type-figure-sm`, `type-board`, `type-wordmark`; `rounded-pill`, `rounded-dot`
  - Komponenten-Klassen: `.tile`, `.board-row`
  - Vertragsvariablen: exakt die Liste in `kursbuch/style.css` (Step 3) – sie ist die Referenz für `check-styles.mjs`
- Produces (TS): `StylePreset`, `stylePresets: StylePreset[]`, `DEFAULT_STYLE = 'kursbuch'`, `findStyle(id: unknown): StylePreset | undefined` aus `~/styles`

- [ ] **Step 1: Registry anlegen**

`app/styles/presets.json`:

```json
[
  {
    "id": "kursbuch",
    "label": "Kursbuch",
    "description": "Fahrgastinformation: schmale Grotesk, flache Farbflächen, Navy und Signalrot.",
    "defaults": { "brand": "#052f66", "signal": "#f42b4f", "radius": 0.5 }
  }
]
```

`app/styles/index.ts`:

```ts
// Registry der Stil-Presets. Die Daten liegen als JSON vor, weil auch die Node-Skripte (scripts/*.mjs) sie lesen.
import presets from './presets.json'

export interface StylePreset {
  id: string
  label: string
  /** eine Zeile für den Themer */
  description: string
  /** setzt zusätzlich .dark auf <html>, damit die dark:-Klassen der shadcn-Komponenten greifen */
  dark?: boolean
  defaults: { brand: string, signal: string, card?: string, radius: number }
}

export const stylePresets = presets as StylePreset[]
export const DEFAULT_STYLE = 'kursbuch'
export const findStyle = (id: unknown) => stylePresets.find(preset => preset.id === id)
```

- [ ] **Step 2: `app/styles/contract.css` schreiben**

```css
/*
  VERTRAG zwischen Templates und Stil-Presets (docs/superpowers/specs/2026-09-20-stil-presets-design.md).
  Hier stehen KEINE Stilwerte – nur Rollen, die Variablen lesen. Die Werte liefert app/styles/<id>/style.css.
  Custom Properties lösen dort auf, wo sie deklariert sind: Alles hier steht auf :root, also auf demselben Element
  wie der Preset-Block :root[data-style="…"].
*/

/* Gemeinsame Aliase: bei jedem Preset gleich, deshalb nicht Teil der Preset-Dateien */
:root {
  --brand: var(--theme-brand);                 /* die Markenfläche: exakt die Eingabe */
  --card: var(--theme-card);
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --secondary-foreground: var(--foreground);
  --accent-foreground: var(--foreground);
  --chart-1: var(--primary);
  --chart-2: var(--signal);
  --chart-3: oklch(0.78 0.15 85);              /* Tram-Gelb aus der Bildwelt */
  --chart-4: var(--input);
  --chart-5: var(--ink-muted);
  --sidebar: var(--card);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
}

/*
  FLÄCHENARTEN. Jede überschreibt die Tokens in ihrem Scope (Prinzip wie .dark), damit darin text-muted-foreground,
  Linien, Fokusring, Primär-Button und Signal automatisch stimmen. Keine hellen Karten in dunkle Flächen setzen.
  --surface-bg: die Farbe der Fläche selbst, für Elemente, die ein "Loch" in der Flächenfarbe brauchen (Halte im Linienband).
*/
@utility surface-ink {
  --foreground: var(--ink-foreground);
  --muted-foreground: var(--ink-muted);
  --border: var(--ink-border);
  --ring: var(--ink-foreground);
  --primary: var(--ink-action);
  --primary-foreground: var(--ink-action-foreground);
  --signal: var(--signal-on-dark);
  --surface-bg: var(--ink);
  background-color: var(--ink);
  color: var(--ink-foreground);
}

@utility surface-brand {
  --foreground: var(--brand-foreground);
  --muted-foreground: var(--brand-muted);
  --border: var(--brand-border);
  --ring: var(--brand-foreground);
  --primary: var(--brand-action);
  --primary-foreground: var(--brand-action-foreground);
  --signal: var(--signal-on-brand);
  --surface-bg: var(--brand);
  background-color: var(--brand);
  color: var(--brand-foreground);
}

/* Helle bzw. neutrale Fläche: keine Token-Überschreibung, nur die Fläche */
@utility surface-plain {
  --surface-bg: var(--card);
  background-color: var(--card);
  color: var(--foreground);
}

/*
  FLÄCHENROLLEN sind reine Hook-Klassen in den Templates: surface-header, surface-footer, surface-board,
  surface-highlight, tile-featured. Jedes Preset ordnet sie in seiner style.css einer Flächenart zu:
    :root[data-style="x"] .surface-header { @apply surface-brand; }
*/

/* TYPO-ROLLEN (1:1 die Rollentabelle im Konzept). Maximalbreiten bleiben im Template. */
@utility type-h1 {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: var(--type-h1-size);
  line-height: var(--type-h1-leading);
  letter-spacing: var(--type-h1-tracking);
}
@utility type-h1-page {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: var(--type-h1-page-size);
  line-height: var(--type-h1-page-leading);
  letter-spacing: var(--type-h1-page-tracking);
}
@utility type-h2 {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: var(--type-h2-size);
  line-height: var(--type-h2-leading);
  letter-spacing: var(--type-h2-tracking);
}
@utility type-h3-lg {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: var(--type-h3-lg-size);
  line-height: var(--type-h3-lg-leading);
  letter-spacing: var(--type-h3-lg-tracking);
}
@utility type-h3 {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: var(--type-h3-size);
  line-height: var(--type-h3-leading);
  letter-spacing: var(--type-h3-tracking);
}
/* Titel in Kästen (Tafel, "Auf einen Blick"): Größe wie H3, eigene Zeilenhöhe */
@utility type-box-title {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: var(--type-h3-size);
  line-height: var(--type-box-title-leading);
  letter-spacing: var(--type-h3-tracking);
}
@utility type-lead {
  font-size: var(--type-lead-size);
  line-height: var(--type-lead-leading);
}
/* Kennzahlen */
@utility type-figure {
  font-family: var(--style-font-figure);
  font-weight: var(--figure-weight);
  font-stretch: var(--heading-stretch);
  font-size: var(--type-figure-size);
  line-height: 1;
}
@utility type-figure-sm {
  font-family: var(--style-font-figure);
  font-weight: var(--figure-weight);
  font-stretch: var(--heading-stretch);
  font-size: var(--type-h3-lg-size);
  line-height: 1.2;
}
/* Zellen der Tafel: bewusst ohne line-height (erbt vom body) */
@utility type-board {
  font-family: var(--style-font-figure);
  font-weight: var(--board-weight);
  font-stretch: var(--heading-stretch);
  font-size: var(--text-f-xl);
}
@utility type-wordmark {
  font-family: var(--style-font-heading);
  font-weight: var(--heading-weight);
  font-stretch: var(--heading-stretch);
  text-transform: var(--heading-transform);
  font-size: 1.25rem;
  line-height: 1.4;
  letter-spacing: -0.025em;
}

@layer components {
  /* KACHEL: Fläche, Kante ODER Schatten – das Preset entscheidet. Hover-Kante immer in der (gescopten) Aktionsfarbe. */
  .tile {
    padding: var(--tile-padding);
    background-color: var(--tile-bg);
    color: var(--tile-fg);
    border-style: solid;
    border-width: var(--tile-border-width);
    border-color: var(--tile-border-color);
    box-shadow: var(--tile-shadow);
    transition: border-color 200ms ease-out, box-shadow 200ms ease-out, background-color 200ms ease-out;
  }
  .tile:hover {
    border-color: var(--primary);
    box-shadow: var(--tile-hover-shadow);
  }

  /* TAFEL: die eine orchestrierte Bewegung. --row setzt DepartureBoard.vue je Zeile (0, 1, 2 …). */
  .board-row {
    animation: var(--board-row-animation);
    animation-delay: calc(150ms + var(--row, 0) * var(--board-row-stagger));
    transform-origin: top center;
  }

  @media (prefers-reduced-motion: reduce) {
    .tile { transition: none; }
    .board-row { animation: none; }
  }
}

/* Fallblattanzeige */
@keyframes board-flip {
  from { opacity: 0; transform: perspective(40rem) rotateX(-75deg); }
  to { opacity: 1; transform: perspective(40rem) rotateX(0); }
}
/* ruhiges Einblenden */
@keyframes board-fade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: `app/styles/kursbuch/style.css` schreiben**

Die Farbwerte sind 1:1 der heutige `:root`-Block aus `tailwind.css` (dort gegenlesen, Kommentare mitnehmen). Neu sind die Blöcke „Stil“ und die Zuordnung der Flächenrollen.

```css
/*
  PRESET "Kursbuch" – Konzept: docs/design-konzept.md
  Eingaben: drei Farben + Radius. Alles andere wird daraus abgeleitet (relative Farbsyntax).
  Nachrechnen: node scripts/contrast.mjs --style kursbuch ["#brand" "#signal"]
*/
:root[data-style="kursbuch"] {
  /* --- Eingaben --- */
  --theme-brand: #052f66;                                          /* Hauptfarbe: Markenfläche, Buttons, Links – und der Farbton ALLER Neutralen */
  --theme-signal: #f42b4f;                                         /* Signalfarbe: Punkte, Linien, großes Wort in der H1 */
  --theme-card: oklch(from var(--theme-brand) 0.995 0.002 h);      /* helle Fläche (Sektionen, Popover) */
  --radius: 0.5rem;                                                /* sm 4 · md 6 (Buttons, Inputs) · lg 8 · xl 12 (Karten, Bilder, Tafel) */

  /*
    Luminanz-Klemmen. "y" im Farbraum xyz-d65 ist genau die Luminanz, mit der WCAG Kontraste rechnet. Alle drei Kanäle
    mit demselben Faktor zu skalieren dunkelt ab bzw. hellt auf, ohne den Farbton zu verschieben.
  */
  --primary: color(from var(--theme-brand) xyz-d65 calc(x * min(1, 0.13 / y)) calc(y * min(1, 0.13 / y)) calc(z * min(1, 0.13 / y)));
  --signal: color(from var(--theme-signal) xyz-d65 calc(x * min(1, 0.22 / y)) calc(y * min(1, 0.22 / y)) calc(z * min(1, 0.22 / y)));
  --signal-on-dark: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --signal-on-brand: var(--signal-on-dark);                        /* der Brand dieses Presets ist dunkel */

  /* --- Neutrale: feste Helligkeit und Sättigung, Farbton vom Brand --- */
  --background: oklch(from var(--theme-brand) 0.972 0.011 h);
  --foreground: oklch(from var(--theme-brand) 0.22 0.035 h);
  --primary-foreground: oklch(from var(--theme-brand) 0.985 0.004 h);
  --secondary: oklch(from var(--theme-brand) 0.925 0.028 h);
  --muted: oklch(from var(--theme-brand) 0.945 0.022 h);
  --muted-foreground: oklch(from var(--theme-brand) 0.46 0.03 h);
  --accent: oklch(from var(--theme-brand) 0.93 0.03 h);
  --destructive: oklch(0.48 0.13 38);                              /* Rostrot, bewusst fest: Fehler sollen nie wie das Signal aussehen */
  --border: oklch(from var(--theme-brand) 0.885 0.022 h);
  --input: oklch(from var(--theme-brand) 0.6 0.03 h);
  --ring: oklch(from var(--theme-brand) 0.22 0.05 h);

  /* --- Flächenart "ink" (dunkel) --- */
  --ink: oklch(from var(--theme-brand) 0.2 0.05 h);
  --ink-foreground: oklch(from var(--theme-brand) 0.975 0.006 h);
  --ink-muted: oklch(from var(--theme-brand) 0.8 0.035 h);
  --ink-border: oklch(from var(--theme-brand) 0.34 0.05 h);
  --ink-action: oklch(from var(--theme-brand) 0.995 0.002 h);      /* heller Button: ein blauer hätte auf ink nur 1.4:1 als Form */
  --ink-action-foreground: oklch(from var(--theme-brand) 0.22 0.035 h);

  /* --- Flächenart "brand": hell oder dunkel, je nach Helligkeit des Brands. Schalter: 1 bei l < 0.6, sonst 0 --- */
  --brand-foreground: oklch(from var(--theme-brand) calc(0.22 + 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.004 h);
  --brand-muted: oklch(from var(--theme-brand) calc(0.32 + 0.54 * clamp(0, (0.6 - l) * 1000, 1)) 0.04 h);
  --brand-border: oklch(from var(--theme-brand) calc(l - 0.115 + 0.23 * clamp(0, (0.6 - l) * 1000, 1)) calc(c * 0.85) h);
  --brand-action: oklch(from var(--theme-brand) calc(0.22 + 0.775 * clamp(0, (0.6 - l) * 1000, 1)) 0.002 h);
  --brand-action-foreground: oklch(from var(--theme-brand) calc(0.985 - 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.01 h);

  /* --- Stil: Schrift --- */
  --style-font-sans: 'Source Sans 3 Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --style-font-heading: 'Barlow Semi Condensed', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif;
  --style-font-figure: 'Barlow Semi Condensed', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif;
  --heading-weight: 600;
  --heading-stretch: normal;
  --heading-transform: none;
  --figure-weight: 600;
  --board-weight: 500;

  /* --- Stil: Typo-Rollen --- */
  --type-h1-size: var(--text-f-7xl);
  --type-h1-leading: 1.04;
  --type-h1-tracking: -0.015em;
  --type-h1-page-size: var(--text-f-6xl);
  --type-h1-page-leading: 1.05;
  --type-h1-page-tracking: -0.015em;
  --type-h2-size: var(--text-f-5xl);
  --type-h2-leading: 1.1;
  --type-h2-tracking: -0.01em;
  --type-h3-lg-size: var(--text-f-3xl);
  --type-h3-lg-leading: 1.2;
  --type-h3-lg-tracking: 0em;
  --type-h3-size: var(--text-f-2xl);
  --type-h3-leading: 1.2;
  --type-h3-tracking: 0em;
  --type-box-title-leading: 1.25;
  --type-lead-size: var(--text-f-xl);
  --type-lead-leading: 1.5;
  --type-figure-size: var(--text-f-6xl);

  /* --- Stil: Form --- */
  --style-radius-pill: 9999px;                                     /* Filterchips, Badges */
  --style-radius-dot: 9999px;                                      /* Punkte, Halte, Signet */
  --line-weight: 1px;                                              /* gliedernde Linien */
  --line-weight-strong: 3px;                                       /* Linienband, Halte-Linie, Marker, Signet */
  --style-shadow-xs: 0 1px 1px 0 oklch(from var(--theme-brand) 0.2 0.05 h / 0.06);
  --style-shadow-sm: 0 1px 2px 0 oklch(from var(--theme-brand) 0.2 0.05 h / 0.08), 0 2px 6px -1px oklch(from var(--theme-brand) 0.2 0.05 h / 0.06);
  --style-shadow-md: 0 1px 2px 0 oklch(from var(--theme-brand) 0.2 0.05 h / 0.08), 0 8px 24px -6px oklch(from var(--theme-brand) 0.2 0.05 h / 0.14);

  /* --- Stil: Kachel (Farbfläche, keine Kante, kein Schatten) --- */
  --tile-bg: var(--secondary);
  --tile-fg: var(--foreground);
  --tile-padding: 1.5rem;
  --tile-border-width: 1px;
  --tile-border-color: transparent;
  --tile-shadow: none;
  --tile-hover-shadow: none;

  /* --- Stil: Bewegung (Fallblattanzeige) --- */
  --board-row-animation: board-flip 420ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
  --board-row-stagger: 90ms;
}

/* Flächenrollen → Flächenarten */
:root[data-style="kursbuch"] :is(.surface-header, .surface-footer, .surface-highlight, .tile-featured) {
  @apply surface-brand;
}
:root[data-style="kursbuch"] .surface-board {
  @apply surface-ink;
}
```

- [ ] **Step 4: `app/assets/css/tailwind.css` umbauen**

1. Nach `@import "tw-animate-css";` einfügen:

```css
/* Stil-Presets: erst der Vertrag, dann je Preset eine Datei (Registry: app/styles/presets.json) */
@import "../../styles/contract.css";
@import "../../styles/kursbuch/style.css";
```

2. In `@theme inline` die zwei Font-Zeilen, die drei Schatten-Zeilen ersetzen und zwei Radien ergänzen:

```css
  /* Schriften, Schatten und Sonderradien kommen aus dem aktiven Preset (app/styles/<id>/style.css) */
  --font-sans: var(--style-font-sans);
  --font-heading: var(--style-font-heading);
  --shadow-xs: var(--style-shadow-xs);
  --shadow-sm: var(--style-shadow-sm);
  --shadow-md: var(--style-shadow-md);
```

und direkt nach `--radius-xl: calc(var(--radius) * 1.5);`:

```css
  --radius-pill: var(--style-radius-pill);
  --radius-dot: var(--style-radius-dot);
```

3. Den kompletten Block `:root { … }` samt dem Kommentar „THEME. Es gibt genau drei Eingaben …“ **löschen** (er lebt jetzt in `kursbuch/style.css` und `contract.css`). Den `.dark`-Block stehen lassen.
4. Die beiden Blöcke `@utility surface-ink { … }` und `@utility surface-brand { … }` samt ihren Kommentaren **löschen** (jetzt in `contract.css`). `@utility container-page` bleibt.
5. In `@layer base` die Headline-Regel ändern:

```css
  /* Display-Schrift nur in h1–h3. Versalien/Breite setzen die type-*-Rollen, nicht diese Regel (Accordion-Fragen sind auch h3). */
  h1, h2, h3 {
    font-family: var(--style-font-heading);
    font-weight: var(--heading-weight);
    text-wrap: balance;
    hyphens: auto;
  }
```

- [ ] **Step 5: Standard-Preset in `nuxt.config.ts` setzen**

```ts
    // lang="de" ist Voraussetzung für hyphens: auto in den Headlines; data-style wählt das Stil-Preset (app/styles/presets.json)
    head: { htmlAttrs: { 'lang': 'de', 'data-style': 'kursbuch' } },
```

- [ ] **Step 6: Bauen und das gebaute CSS prüfen**

```bash
npx nuxt build
grep -l "data-style=\"\?kursbuch" .output/public/_nuxt/*.css
grep -o "surface-header[^}]*}" .output/public/_nuxt/*.css | head -3
```

Expected: Build erfolgreich (die vier bekannten Warnungen `[vite:css][postcss] Lexical error` sind harmlos). Der erste `grep` nennt eine CSS-Datei; der zweite zeigt eine Regel für `.surface-header`, die `--foreground:var(--brand-foreground)` und `background-color:var(--brand)` enthält. **Fehlt die Regel oder ist sie leer**, hat `@apply` in der Preset-Datei nicht gegriffen: dann in `kursbuch/style.css` statt `@apply surface-brand;` bzw. `@apply surface-ink;` die zehn Deklarationen der jeweiligen Flächenart aus `contract.css` ausschreiben – und das in allen späteren Presets genauso halten.

- [ ] **Step 7: Regression – Seite muss deckungsgleich sein**

Server auf 3100 neu starten, dann:

```bash
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/task2 http://localhost:3100$url; done
node scripts/compare-shots.mjs .shots/vorher .shots/task2 --tolerance <N aus Task 1>
```

Expected: `Stil: kursbuch` in jeder Zeile, `Alle Dateien deckungsgleich.` Bei Abweichung zeigt der Zeilenbereich die betroffene Sektion: den zugehörigen Wert in `kursbuch/style.css` gegen den alten `:root`-Block prüfen.

- [ ] **Step 8: Checkpoint**

`npx nuxt typecheck` ohne Fehler, Regression bestanden, in `tailwind.css` steht kein `:root {`-Block und kein Hex-Wert mehr.

---

### Task 3: Templates auf Rollen umstellen

Nur Klassen und Scoped-Styles ändern sich – kein Text, keine Struktur. Danach muss Kursbuch weiter deckungsgleich sein.

**Files:**
- Modify: `app/components/PageSection.vue`, `app/components/JobCard.vue`, `app/components/DepartureBoard.vue`, `app/components/SiteHeader.vue`, `app/components/SiteFooter.vue`
- Modify: `app/pages/index.vue`, `app/pages/jobs/index.vue`, `app/pages/jobs/[slug].vue`
- Modify: `app/components/ui/badge/index.ts`

**Interfaces:**
- Consumes: alle Rollen aus Task 2.
- Produces: Hook-Klassen in der Tafel für Preset-Regeln: `board-head`, `board-cols`, `board-row`, `board-foot`. `PageSection` kennt die Flächen `'background' | 'card' | 'muted' | 'highlight'`.

**Ersetzungsregeln (gelten in allen Dateien dieser Aufgabe):**

| Alt | Neu |
|---|---|
| `text-f-7xl leading-[1.04] tracking-[-0.015em]` | `type-h1` |
| `text-f-6xl leading-[1.05] tracking-[-0.015em]` | `type-h1-page` |
| `text-f-5xl leading-[1.1] tracking-[-0.01em]` | `type-h2` |
| `text-f-3xl leading-[1.2]` (an `h2`/`h3`) | `type-h3-lg` |
| `text-f-2xl leading-[1.2]` (an `h3`, am Kacheltitel) | `type-h3` |
| `font-heading text-f-2xl leading-[1.2] font-semibold` | `type-h3` |
| `text-f-2xl leading-tight` (Titel in Tafel und „Auf einen Blick“) | `type-box-title` |
| `text-f-xl leading-normal` | `type-lead` |
| `font-heading text-f-6xl leading-none font-semibold` | `type-figure` |
| `font-heading text-f-3xl leading-[1.2] font-semibold` | `type-figure-sm` |
| `font-heading text-f-xl font-medium` | `type-board` |
| `font-heading text-xl font-semibold tracking-tight` | `type-wordmark` |
| `border-t` / `border-b` (gliedernde Linie) | `border-t-(length:--line-weight)` / `border-b-(length:--line-weight)` |
| `rounded-full` an Punkten, Halten, Signet | `rounded-dot` |
| `rounded-full` an Chips und Badges | `rounded-pill` |

Alle anderen Klassen am selben Element (Maximalbreiten, Abstände, `text-primary`, `tabular-nums`, `animate-in …`) bleiben stehen. `rounded-full` am Avatar bleibt.

- [ ] **Step 1: `PageSection.vue`**

Prop-Typ und Mapping ersetzen:

```ts
withDefaults(defineProps<{
  surface?: 'background' | 'card' | 'muted' | 'highlight'
  padBottom?: boolean
  labelledby?: string
}>(), {
  surface: 'background',
  padBottom: false,
})

// highlight ist eine Flächenrolle: Welche Flächenart dahinter steht, entscheidet das Stil-Preset (app/styles/<id>/style.css)
const surfaces = {
  background: 'bg-background',
  card: 'bg-card',
  muted: 'bg-muted',
  highlight: 'surface-highlight',
}
```

- [ ] **Step 2: `JobCard.vue`**

Klassen des `NuxtLink` ersetzen durch:

```vue
    class="tile group flex h-full flex-col gap-5 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    :class="job.featured && 'tile-featured'"
```

Den Kommentar darunter anpassen: „Karte = `tile`: Fläche, Kante oder Schatten kommen aus dem Stil-Preset. Top-Jobs tragen zusätzlich die Flächenrolle `tile-featured`; deren Flächenart überschreibt die Tokens in ihrem Scope, deshalb braucht die Kachel keine zweite Klassenliste.“ Dann nach den Ersetzungsregeln: Titel → `line-clamp-2 type-h3`; Punkt im Badge → `rounded-dot`; Fußzeile → `mt-auto flex items-center justify-between gap-4 border-t-(length:--line-weight) border-foreground/15 pt-4`.

- [ ] **Step 3: `DepartureBoard.vue`**

Template (nur die geänderten Stellen):

```vue
  <div class="surface-board overflow-hidden rounded-xl">
    <div class="board-head flex items-baseline justify-between gap-4 px-5 pt-5 pb-4 sm:px-6">
      <h2 id="abfahrten" class="type-box-title">
```

```vue
    <div class="board-cols board-grid border-t-(length:--line-weight) px-5 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:px-6" aria-hidden="true">
```

```vue
      <li
        v-for="(job, index) in departures"
        :key="job.id"
        class="board-row border-t-(length:--line-weight)"
        :style="{ '--row': index }"
      >
        <NuxtLink
          :to="`/jobs/${job.slug}`"
          class="board-grid items-center px-5 py-3.5 transition-colors duration-150 hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset sm:px-6"
        >
          <span class="flex items-center gap-2 type-board tabular-nums">
            <span
              class="size-2 shrink-0 rounded-dot"
```

```vue
            <span class="truncate type-board">{{ shortTitle(job.title) }}</span>
```

```vue
    <NuxtLink
      to="/jobs"
      class="board-foot flex items-center justify-between gap-4 border-t-(length:--line-weight) px-5 py-4 text-base font-semibold transition-colors duration-150 hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset sm:px-6"
    >
```

Im `<style scoped>` die Regeln `.board-row`, `@keyframes board-flip` und den `prefers-reduced-motion`-Block **löschen** (jetzt global in `contract.css`; Vue würde den Keyframe-Namen sonst umbenennen und die Variable träfe ihn nicht). `.board-grid` bleibt. Den Kopfkommentar im Script ergänzen: „Fläche (`surface-board`) und Einstiegsbewegung (`--board-row-animation`) kommen aus dem Stil-Preset.“

- [ ] **Step 4: `SiteHeader.vue`**

- `<header class="surface-brand sticky top-0 z-40">` → `surface-header`
- Signet: `class="flex size-7 items-center justify-center rounded-dot border-(length:--line-weight-strong) border-foreground"`, innerer Punkt `size-2 rounded-dot bg-signal`
- Wortmarke: `class="type-wordmark"`
- Menü-Button: `hover:bg-brand-border` → `hover:bg-foreground/10`
- `<SheetContent side="right" class="surface-header border-l-0 p-6">` (`bg-brand` entfällt)
- `<SheetTitle class="type-h3 text-foreground">`
- Kommentar am Button: „Auf einer farbigen oder dunklen Kopfzeile passt die Flächenart den Primär-Button an.“

Scoped-Style: Farben über die gescopten Tokens, Strichstärke und Punktform aus dem Preset.

```css
/* Halt: Ring in der Sekundärfarbe der Fläche; "passed" wird zum Signal, "inside" zusätzlich gefüllt. */
.line-strip-dot {
  position: relative;
  z-index: 1;
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  border-radius: var(--style-radius-dot);
  border: var(--line-weight-strong) solid var(--muted-foreground);
  background: var(--surface-bg);
  transition: border-color 200ms ease-out, background-color 200ms ease-out;
}
```

In `.line-strip-stop:not(:last-child)::after`: `top: calc(0.25rem + 0.4375rem - var(--line-weight-strong) / 2);`, `height: var(--line-weight-strong);`, `background: var(--border);`. In `.line-strip-stop-vertical:not(:last-child)::after`: `left: calc(0.4375rem - var(--line-weight-strong) / 2);`, `width: var(--line-weight-strong);`, `background: var(--border);`. Die `[data-passed]`-, `[data-inside]`- und `[data-segment]`-Regeln bleiben (`var(--signal)`).

- [ ] **Step 5: `SiteFooter.vue`**

`<footer class="surface-footer">`, Wortmarke `class="type-wordmark"`, untere Zeile `border-t-(length:--line-weight)`.

- [ ] **Step 6: `app/pages/index.vue`**

Nach den Ersetzungsregeln alle `h1`/`h2`/`h3`, Leads, Kennzahlen (`dd` im Zahlenband → `type-figure text-primary tabular-nums`, `dt` der Leistungen → `type-figure-sm text-primary tabular-nums`), Regel-Titel (`dt` → `type-h3`) und Linien. Schluss-`h2` → `max-w-[18ch] type-h1-page`. Dazu:

- Zahlenband: `<dl class="grid gap-8 border-t-(length:--line-weight) pt-8 sm:grid-cols-3 sm:gap-0">` und an den Kindern statt `divide-x`: `class="flex flex-col-reverse gap-1 sm:border-r-(length:--line-weight) sm:px-8 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"`
- Regel-Sektion: `surface="highlight"`; Marker: `class="-mt-6 mb-4 h-(--line-weight-strong) w-10 bg-signal"`; Kommentar: „Signal als Grafik auf der Hervorhebungsfläche (≥ 3:1, siehe Konzept des Presets)“
- Leistungen: `border-t-(length:--line-weight) … last:border-b-(length:--line-weight)`
- Accordion: `<Accordion type="multiple" class="border-t-(length:--line-weight) lg:col-span-8">` und `<AccordionItem … class="border-b-(length:--line-weight) last:border-b-(length:--line-weight)">`

Scoped-Style der Halte-Linie:

```css
.line-map::before {
  content: '';
  position: absolute;
  background: var(--signal);
  left: calc(0.78125rem - var(--line-weight-strong) / 2); /* Mitte des Halts (25 px) minus halbe Linie */
  top: 0.5rem;
  bottom: 0.5rem;
  width: var(--line-weight-strong);
}
.line-dot {
  position: absolute;
  left: 0;
  top: 0.125rem;
  width: 1.5625rem;
  height: 1.5625rem;
  border-radius: var(--style-radius-dot);
  border: var(--line-weight-strong) solid var(--signal);
  background: var(--background);
}
```

und im Media-Query `top: calc(0.78125rem - var(--line-weight-strong) / 2);` sowie `height: var(--line-weight-strong);` statt der festen Werte. `.line-dot-end` bleibt.

- [ ] **Step 7: `app/pages/jobs/index.vue` und `app/pages/jobs/[slug].vue`**

`jobs/index.vue`: `h1` → `type-h1-page`, Lead → `type-lead`, Filterchips: `rounded-full border` → `rounded-pill border-(length:--line-weight)`.

`[slug].vue`: `h1` → `max-w-[22ch] type-h1-page`; Punkt im Badge → `rounded-dot`; Kasten: `class="surface-highlight flex flex-col gap-5 rounded-xl p-6"` mit Kommentar „Hervorhebungsfläche: Die Flächenart passt den Bewerben-Button darin an“; Titel „Auf einen Blick“ → `type-box-title`; Zeilen im `dl` → `border-t-(length:--line-weight) … first:border-t-0`; Einleitung → `max-w-[60ch] type-lead`; `h2` der Listen und „Das bieten wir“ → `type-h3-lg`; „Ähnliche Stellen“ → `mb-f-12 type-h2`; mobile Leiste → `border-t-(length:--line-weight)`.

- [ ] **Step 8: `app/components/ui/badge/index.ts`**

In der Basisklasse von `badgeVariants` `rounded-full` durch `rounded-pill` ersetzen. (Geänderte shadcn-Datei – wird in Task 10 im Konzept vermerkt.)

- [ ] **Step 9: Reste suchen**

```bash
grep -rnE "surface-(ink|brand)|font-heading|tracking-\[-|bg-brand|brand-border|ink-border|divide-x" app/pages app/components --include=*.vue --exclude-dir=ui
```

Expected: keine Treffer. (`ThemePanel.vue` nennt `surface-brand`/`surface-ink` noch bis Task 4 – diese Treffer sind in Ordnung.)

- [ ] **Step 10: Regression**

```bash
npx nuxt typecheck && npx nuxt build
# Server auf 3100 neu starten
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/task3 http://localhost:3100$url; done
node scripts/compare-shots.mjs .shots/vorher .shots/task3 --tolerance <N aus Task 1>
```

Expected: `Alle Dateien deckungsgleich.` Typische Ursachen für Abweichungen: eine Rolle mit falscher Zeilenhöhe (Tabelle oben gegenlesen), `tailwind-merge` hat am Accordion die Linienklasse verworfen (dann am `AccordionItem` zusätzlich `border-border` prüfen), `--row` fehlt an der Tafelzeile.

- [ ] **Step 11: Checkpoint**

Regression bestanden, Typecheck und Build ohne Fehler, Step 9 ohne Treffer.

---

### Task 4: Themer – Stilwahl, Speicherformat, Messung

**Files:**
- Create: `app/styles/storage.ts`, `scripts/tests/theme-storage.test.mjs`, `app/styles/measure.js`
- Modify: `app/app.vue` (Script-Block), `app/components/ThemePanel.vue` (Script-Block, Feld „Stil“ im Template, zwei CSS-Zeilen)

**Interfaces:**
- Consumes: `stylePresets`, `DEFAULT_STYLE`, `findStyle` aus `~/styles`.
- Produces:
  - `STORAGE_KEY = 'kursbuch-theme'`, `interface ThemeValues { brand: string, signal: string, card: string, radius: number }`, `interface ThemeStore { style: string, overrides: Record<string, Partial<ThemeValues>> }`, `parseThemeStore(raw: string | null, knownIds: string[], fallback: string): ThemeStore`, `pickStyle(queryStyle: unknown, store: ThemeStore, knownIds: string[]): string`
  - `measureStyle(): { checks: { label: string, ratio: number, min: number }[], resolved: { primary: string, signal: string, signalOnDark: string, card: string } }` aus `app/styles/measure.js` – reines Browser-JS ohne Importe, damit `check-styles.mjs` den Quelltext in die Seite injizieren kann
  - Nuxt-Zustand `useState<string>('themer-style')` = aktives Preset (nur Dev)

- [ ] **Step 1: Failing test für das Speicherformat**

`scripts/tests/theme-storage.test.mjs` (Node 24 importiert `.ts` direkt, Typen werden entfernt):

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseThemeStore, pickStyle } from '../../app/styles/storage.ts'

const ids = ['kursbuch', 'plakat']

test('leerer oder kaputter Eintrag ergibt den Standard', () => {
  assert.deepEqual(parseThemeStore(null, ids, 'kursbuch'), { style: 'kursbuch', overrides: {} })
  assert.deepEqual(parseThemeStore('{kaputt', ids, 'kursbuch'), { style: 'kursbuch', overrides: {} })
})

test('altes flaches Format wird als Anpassung von Kursbuch übernommen', () => {
  const store = parseThemeStore(JSON.stringify({ brand: '#0b5d3b', signal: '#ff7a00', card: '', radius: 0.75 }), ids, 'kursbuch')
  assert.deepEqual(store, { style: 'kursbuch', overrides: { kursbuch: { brand: '#0b5d3b', signal: '#ff7a00', radius: 0.75 } } })
})

test('unbekannter Stil fällt zurück, unbekannte Presets und ungültige Werte fliegen raus', () => {
  const raw = JSON.stringify({
    style: 'gibtsnicht',
    overrides: { plakat: { brand: '#ABCDEF', signal: 'rot', radius: 9 }, fremd: { brand: '#000000' } },
  })
  assert.deepEqual(parseThemeStore(raw, ids, 'kursbuch'), { style: 'kursbuch', overrides: { plakat: { brand: '#ABCDEF' } } })
})

test('?style= hat Vorrang vor dem gespeicherten Stil, aber nur wenn bekannt', () => {
  const store = { style: 'plakat', overrides: {} }
  assert.equal(pickStyle('kursbuch', store, ids), 'kursbuch')
  assert.equal(pickStyle('quatsch', store, ids), 'plakat')
  assert.equal(pickStyle(undefined, store, ids), 'plakat')
})
```

Run: `node --test scripts/tests/` → Expected: FAIL (`Cannot find module … storage.ts`).

- [ ] **Step 2: `app/styles/storage.ts` schreiben**

```ts
// Speicherformat des Themers (localStorage). Reine Funktionen ohne Nuxt-Abhängigkeit, getestet in scripts/tests/.
// Format: { style: 'plakat', overrides: { plakat: { brand, signal, card, radius } } } – Anpassungen je Preset getrennt.
export const STORAGE_KEY = 'kursbuch-theme'

export interface ThemeValues { brand: string, signal: string, card: string, radius: number }
export interface ThemeStore { style: string, overrides: Record<string, Partial<ThemeValues>> }

const HEX = /^#[0-9a-f]{6}$/i

function cleanValues(input: unknown): Partial<ThemeValues> {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const result: Partial<ThemeValues> = {}
  for (const key of ['brand', 'signal', 'card'] as const) {
    const value = source[key]
    if (typeof value === 'string' && HEX.test(value))
      result[key] = value
  }
  if (typeof source.radius === 'number' && source.radius >= 0 && source.radius <= 1.5)
    result.radius = source.radius
  return result
}

export function parseThemeStore(raw: string | null, knownIds: string[], fallback: string): ThemeStore {
  let data: Record<string, unknown> = {}
  try {
    const parsed = JSON.parse(raw ?? '{}')
    if (parsed && typeof parsed === 'object')
      data = parsed
  }
  catch {
    // kaputter Eintrag: mit dem Standard weitermachen
  }

  // Format vor den Stil-Presets: die vier Werte lagen flach im Objekt und galten für Kursbuch
  if (!('overrides' in data) && ('brand' in data || 'signal' in data || 'radius' in data))
    data = { style: fallback, overrides: { [fallback]: data } }

  const overrides: ThemeStore['overrides'] = {}
  const source = (data.overrides && typeof data.overrides === 'object' ? data.overrides : {}) as Record<string, unknown>
  for (const id of knownIds) {
    const values = cleanValues(source[id])
    if (Object.keys(values).length)
      overrides[id] = values
  }
  const style = typeof data.style === 'string' && knownIds.includes(data.style) ? data.style : fallback
  return { style, overrides }
}

/** ?style=<id> (nur im Dev-Modus ausgewertet) schlägt den gespeicherten Stil */
export function pickStyle(queryStyle: unknown, store: ThemeStore, knownIds: string[]): string {
  return typeof queryStyle === 'string' && knownIds.includes(queryStyle) ? queryStyle : store.style
}
```

Run: `node --test scripts/tests/` → Expected: 4 Tests bestanden.

- [ ] **Step 3: `app/styles/measure.js` schreiben**

```js
// Misst die Kontraste des AKTIVEN Stils im Browser: Die Farben löst der Browser auf (1×1-Canvas), hier wird nichts nachgerechnet.
// Benutzt vom Themer (ThemePanel.vue) und von scripts/check-styles.mjs, das diesen Quelltext in die Seite injiziert –
// deshalb: keine Importe, kein TypeScript, genau eine exportierte Funktion.

/**
 * @returns {{ checks: { label: string, ratio: number, min: number }[], resolved: { primary: string, signal: string, signalOnDark: string, card: string } }}
 */
export function measureStyle() {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

  // Element mit den Klassen einer Flächenrolle anlegen und Farben darin auslesen
  function probe(scope, read) {
    const host = document.createElement('div')
    host.className = scope
    const span = document.createElement('span')
    host.append(span)
    document.body.append(host)
    const value = read(host, span)
    host.remove()
    return value
  }
  const token = (scope, name) => probe(scope, (host, span) => {
    span.style.color = `var(${name})`
    return getComputedStyle(span).color
  })
  const surface = scope => probe(scope, host => getComputedStyle(host).backgroundColor)

  // Farben übereinander malen (transparente Kacheln liegen so richtig auf der Grundfläche) und das Pixel lesen
  function paint(...layers) {
    if (!context)
      return [0, 0, 0]
    context.clearRect(0, 0, 1, 1)
    for (const layer of layers) {
      context.fillStyle = layer
      context.fillRect(0, 0, 1, 1)
    }
    const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  }
  const toHex = rgb => `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`
  function luminance(rgb) {
    const [r, g, b] = rgb.map((value) => {
      const channel = value / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  function contrast(a, b) {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (light + 0.05) / (dark + 0.05)
  }

  const page = token('', '--background')
  const background = paint(page)
  const card = paint(token('', '--card'))
  const tile = paint(page, surface('tile'))
  const root = name => paint(token('', name))

  const checks = [
    { label: 'Text auf der Grundfläche', ratio: contrast(root('--foreground'), background), min: 4.5 },
    { label: 'Text auf der Card-Fläche', ratio: contrast(root('--foreground'), card), min: 4.5 },
    { label: 'Sekundärtext auf der Grundfläche', ratio: contrast(root('--muted-foreground'), background), min: 4.5 },
    { label: 'Sekundärtext auf der Card-Fläche', ratio: contrast(root('--muted-foreground'), card), min: 4.5 },
    { label: 'Text auf der Kachel', ratio: contrast(paint(token('tile', '--tile-fg')), tile), min: 4.5 },
    { label: 'Sekundärtext auf der Kachel', ratio: contrast(root('--muted-foreground'), tile), min: 4.5 },
    { label: 'Links und Icons auf der Kachel', ratio: contrast(root('--primary'), tile), min: 4.5 },
    { label: 'Links auf der Card-Fläche', ratio: contrast(root('--primary'), card), min: 4.5 },
    { label: 'Schrift auf dem Button', ratio: contrast(root('--primary-foreground'), root('--primary')), min: 4.5 },
    { label: 'Signal als großes Wort auf der Grundfläche', ratio: contrast(root('--signal'), background), min: 3 },
    { label: 'Signal (Linie) auf der Kachel', ratio: contrast(root('--signal'), tile), min: 3 },
  ]

  // Flächenrollen: Welche Flächenart dahinter steht, entscheidet das Preset – gemessen wird, was wirklich herauskommt
  const roles = [
    ['surface-header', 'Kopfzeile'],
    ['surface-board', 'Tafel'],
    ['surface-highlight', 'Hervorhebung'],
    ['tile tile-featured', 'Top-Job-Kachel'],
    ['surface-footer', 'Fußzeile'],
  ]
  for (const [scope, name] of roles) {
    const area = paint(page, surface(scope))
    const inside = tokenName => paint(token(scope, tokenName))
    checks.push(
      { label: `${name}: Text`, ratio: contrast(inside('--foreground'), area), min: 4.5 },
      { label: `${name}: Sekundärtext`, ratio: contrast(inside('--muted-foreground'), area), min: 4.5 },
      { label: `${name}: Button als Form`, ratio: contrast(inside('--primary'), area), min: 3 },
      { label: `${name}: Schrift auf dem Button`, ratio: contrast(inside('--primary-foreground'), inside('--primary')), min: 4.5 },
      { label: `${name}: Signal (Punkt, Linie)`, ratio: contrast(inside('--signal'), area), min: 3 },
    )
  }

  return {
    checks,
    resolved: {
      primary: toHex(root('--primary')),
      signal: toHex(root('--signal')),
      signalOnDark: toHex(root('--signal-on-dark')),
      card: toHex(card),
    },
  }
}
```

- [ ] **Step 4: `app/app.vue` – Script-Block ersetzen**

```vue
<script setup lang="ts">
import { DEFAULT_STYLE, stylePresets } from '~/styles'
import { parseThemeStore, pickStyle, STORAGE_KEY } from '~/styles/storage'

// Der Themer ist ein Entwicklungswerkzeug: Er wird nur im Dev-Modus eingebunden (yarn dev), nicht im Build.
// Im Build steht das Stil-Preset fest in nuxt.config.ts (htmlAttrs['data-style']).
const showThemer = import.meta.dev

if (showThemer) {
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
    // Gleiche Logik wie parseThemeStore/pickStyle, nur als ES5-Einzeiler ohne Importe.
    script: [{
      key: 'themer-restore',
      innerHTML: `try{var K=${JSON.stringify(dark)},t=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');if(!t.overrides&&(t.brand||t.signal||t.radius!=null))t={style:'${DEFAULT_STYLE}',overrides:{'${DEFAULT_STYLE}':t}};var q=new URLSearchParams(location.search).get('style'),id=q in K?q:(t.style in K?t.style:'${DEFAULT_STYLE}'),e=document.documentElement,s=e.style,o=(t.overrides||{})[id]||{},h=/^#[0-9a-f]{6}$/i;e.setAttribute('data-style',id);e.classList.toggle('dark',K[id]);h.test(o.brand)&&s.setProperty('--theme-brand',o.brand);h.test(o.signal)&&s.setProperty('--theme-signal',o.signal);h.test(o.card)&&s.setProperty('--theme-card',o.card);typeof o.radius=='number'&&s.setProperty('--radius',o.radius+'rem')}catch(e){}`,
    }],
  })
}
</script>
```

Template und `<style>` bleiben unverändert.

- [ ] **Step 5: `ThemePanel.vue` – Script-Block ersetzen**

```vue
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
```

- [ ] **Step 6: `ThemePanel.vue` – Template und Style**

Direkt nach `<header class="themer-head">…</header>` einfügen:

```vue
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
```

Hinweistexte anpassen: unter Brand „Markenfläche und Farbton der Flächen – was genau der Stil daraus macht, zeigt die Liste unten.“, Platzhalter-Fehlertext bei Brand/Signal ohne festes Beispiel („Bitte als #rrggbb eingeben.“), letzter Absatz: „Dauerhaft wird es erst, wenn du die kopierten Zeilen in die genannte Datei einträgst.“ Im `<style scoped>`: `.themer { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }` (das Panel bleibt stilneutral) und neu:

```css
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
```

- [ ] **Step 7: Prüfen**

```bash
node --test scripts/tests/
npx nuxt typecheck
```

Der Themer existiert nur im Dev-Modus. Läuft beim Nutzer bereits ein Dev-Server, **dessen** URL verwenden (nachfragen, vorher neu starten lassen); sonst selbst starten und danach wieder beenden:

```bash
npx nuxt dev --port 3200   # im Hintergrund, nur wenn kein anderer Dev-Server läuft
node scripts/screenshot.mjs .shots/task4 "http://localhost:3200/?style=kursbuch" 1280
```

Expected: Tests und Typecheck ohne Fehler; Screenshot-Zeile meldet `Stil: kursbuch`; im Bild `.shots/task4/start-1280-fold.png` (mit dem Read-Werkzeug ansehen) ist unten links der Themer-Knopf ohne rotes Zähler-Badge. Meldet `typecheck` einen Fehler beim Import von `~/styles/measure`, in `app/styles/` eine Datei `measure.d.ts` mit der Signatur aus dem Interfaces-Block anlegen.

- [ ] **Step 8: Checkpoint**

Tests grün, Typecheck grün, `grep -n "surface-brand\|surface-ink" app/components/ThemePanel.vue` ohne Treffer.

---

### Task 5: Rechnen und Messen je Preset

**Files:**
- Create: `scripts/style-recipes.mjs`, `scripts/check-styles.mjs`
- Modify: `scripts/contrast.mjs` (ganzer Inhalt ab der Zeile `// ---------- Die zwei Eingaben ----------`; die Farbmathematik darüber bleibt), `scripts/screenshot.mjs` (Option `--style`)

**Interfaces:**
- Consumes: `app/styles/presets.json`, `app/styles/measure.js` (`measureStyle`), `scripts/lib/cdp.mjs`.
- Produces:
  - `recipes[id](ctx)` in `scripts/style-recipes.mjs`. `ctx = { brand, signal, H, F, clampLum }` (OKLCH-Tripel `[L, C, h]`, `H` = Farbton des Brands, `F` = 1 bei dunklem Brand). Rückgabe: `{ t, surfaces, kinds, dark?, extra? }` – `t`: Token-Name → OKLCH-Tripel; `surfaces`: Namen der Flächen, auf denen normaler Text steht; `kinds`: benutzte Flächenarten aus `'ink' | 'brand'`; `extra`: zusätzliche Paare `[label, farbeA, farbeB, min]`
  - `node scripts/contrast.mjs [--style <id>] ["#brand" "#signal"]`
  - `node scripts/check-styles.mjs [--url http://localhost:3100]` (ohne `--url` nur die statische Prüfung)
  - `node scripts/screenshot.mjs <ordner> <url> [breiten …] [--style <id>]`

- [ ] **Step 1: Referenzwerte sichern**

```bash
node scripts/contrast.mjs > .shots/contrast-vorher.txt
```

- [ ] **Step 2: `scripts/style-recipes.mjs` mit dem Kursbuch-Rezept**

```js
// Token-Rezepte je Stil-Preset für scripts/contrast.mjs. Jedes Rezept MUSS dieselben L/C-Werte tragen wie
// app/styles/<id>/style.css – scripts/check-styles.mjs misst im Browser gegen und deckt Abweichungen auf.
// ctx: brand/signal als OKLCH-Tripel [L, C, h], H = Farbton des Brands, F = 1 bei dunklem Brand (l < 0.6), clampLum wie im CSS.

// Flächenart "brand" mit dem Hell/Dunkel-Schalter – in allen Presets gleich, solange sie die Formeln aus Kursbuch übernehmen
const brandKind = ({ brand, H, F }) => ({
  'brand': brand,
  'brand-foreground': [0.22 + 0.765 * F, 0.004, H],
  'brand-muted': [0.32 + 0.54 * F, 0.04, H],
  'brand-border': [brand[0] - 0.115 + 0.23 * F, brand[1] * 0.85, H],
  'brand-action': [0.22 + 0.775 * F, 0.002, H],
  'brand-action-foreground': [0.985 - 0.765 * F, 0.01, H],
})

export const recipes = {
  kursbuch(ctx) {
    const { brand, signal, H, clampLum } = ctx
    const signalOnDark = clampLum(signal, { min: 0.19 })
    return {
      surfaces: ['background', 'card', 'secondary', 'muted', 'accent'],
      kinds: ['ink', 'brand'],
      t: {
        'background': [0.972, 0.011, H],
        'card': [0.995, 0.002, H],
        'secondary': [0.925, 0.028, H],
        'muted': [0.945, 0.022, H],
        'accent': [0.93, 0.03, H],
        'foreground': [0.22, 0.035, H],
        'muted-foreground': [0.46, 0.03, H],
        'primary': clampLum(brand, { max: 0.13 }),
        'primary-foreground': [0.985, 0.004, H],
        'border': [0.885, 0.022, H],
        'input': [0.6, 0.03, H],
        'ring': [0.22, 0.05, H],
        'destructive': [0.48, 0.13, 38],
        'signal': clampLum(signal, { max: 0.22 }),
        'signal-on-dark': signalOnDark,
        'signal-on-brand': signalOnDark,
        'ink': [0.2, 0.05, H],
        'ink-foreground': [0.975, 0.006, H],
        'ink-muted': [0.8, 0.035, H],
        'ink-border': [0.34, 0.05, H],
        'ink-action': [0.995, 0.002, H],
        'ink-action-foreground': [0.22, 0.035, H],
        ...brandKind(ctx),
        'tile-bg': [0.925, 0.028, H],
        'tile-fg': [0.22, 0.035, H],
      },
    }
  },
}

export { brandKind }
```

- [ ] **Step 3: `scripts/contrast.mjs` verallgemeinern**

Kopfkommentar ersetzen:

```js
// Kontrast- und Gamut-Nachweis für ein Stil-Preset (Methode: docs/design-research.md, Kapitel 2.3)
// Aufruf: node scripts/contrast.mjs                                  -> Kursbuch mit seinen Standardfarben
//         node scripts/contrast.mjs --style plakat                   -> ein anderes Preset
//         node scripts/contrast.mjs --style weich "#0b5d3b" "#ff7a00" -> Preset mit anderen Eingaben (Brand, Signal)
// Die Rezepte stehen in scripts/style-recipes.mjs und spiegeln app/styles/<id>/style.css.
import { readFileSync } from 'node:fs'
import { recipes } from './style-recipes.mjs'
```

Die Funktionen `enc` bis `mix` bleiben unverändert. Alles ab `// ---------- Die zwei Eingaben ----------` ersetzen durch:

```js
// ---------- Eingaben ----------
const args = process.argv.slice(2)
const styleIndex = args.indexOf('--style')
const styleId = styleIndex >= 0 ? args.splice(styleIndex, 2)[1] : 'kursbuch'
const presets = JSON.parse(readFileSync(new URL('../app/styles/presets.json', import.meta.url), 'utf8'))
const preset = presets.find(item => item.id === styleId)
if (!preset || !recipes[styleId]) {
  console.error(`Unbekannter Stil "${styleId}". Bekannt: ${presets.map(item => item.id).filter(id => recipes[id]).join(', ')}`)
  process.exit(1)
}
const isHex = v => /^#[0-9a-f]{6}$/i.test(v ?? '')
const [argBrand, argSignal] = args
if ((argBrand && !isHex(argBrand)) || (argSignal && !isHex(argSignal))) {
  console.error('Farben bitte als #rrggbb angeben, z. B.: node scripts/contrast.mjs --style kursbuch "#052f66" "#f42b4f"')
  process.exit(1)
}
const brandHex = argBrand ?? preset.defaults.brand
const signalHex = argSignal ?? preset.defaults.signal
const brand = hex2oklch(brandHex)
const signal = hex2oklch(signalHex)
const fmt = c => `oklch(${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(1)})`
console.log('Stil  ', styleId)
console.log('Brand ', brandHex, '=', fmt(brand))
console.log('Signal', signalHex, '=', fmt(signal))

const { t, surfaces, kinds, dark = false, extra = [] } = recipes[styleId]({ brand, signal, H: brand[2], F: brand[0] < 0.6 ? 1 : 0, clampLum })
const white = [1, 0, 0]

console.log('\nToken · Hex · im sRGB-Gamut (außerhalb = der Browser mappt um, die Farbe wird etwas blasser)')
for (const [name, c] of Object.entries(t)) console.log(`${name.padEnd(24)} ${hex(c)}  ${inGamut(c) ? 'ok' : 'außerhalb'}`)

const rows = []
const check = (label, a, b, min) => rows.push({ label, ratio: contrast(a, b), min })

for (const s of surfaces) {
  check(`foreground auf ${s}`, t.foreground, t[s], 4.5)
  check(`muted-foreground auf ${s}`, t['muted-foreground'], t[s], 4.5)
  check(`primary als Text/Link auf ${s}`, t.primary, t[s], 4.5)
  check(`destructive als Text auf ${s}`, t.destructive, t[s], 4.5)
  check(`input-Kontur auf ${s}`, t.input, t[s], 3)
  check(`ring/50 (Fokus-Halo) auf ${s}`, mix(t.ring, t[s], 0.5), t[s], 3)
  check(`signal als Grafik / großer Text auf ${s}`, t.signal, t[s], 3)
  check(`primary-foreground auf primary/90 über ${s}`, t['primary-foreground'], mix(t.primary, t[s], 0.9), 4.5)
}
check('primary-foreground auf primary (Button, Top-Job-Badge)', t['primary-foreground'], t.primary, 4.5)
if (!dark) check('Weiß auf destructive (Button)', white, t.destructive, 4.5)

// Kachel (nur wenn sie eine eigene Fläche hat – transparente Kacheln sind über die Flächen oben abgedeckt)
if (t['tile-bg']) {
  check('tile-fg auf der Kachel', t['tile-fg'], t['tile-bg'], 4.5)
  check('muted-foreground auf der Kachel', t['muted-foreground'], t['tile-bg'], 4.5)
  check('primary (Icons, Pfeil) auf der Kachel', t.primary, t['tile-bg'], 4.5)
}

if (kinds.includes('ink')) {
  check('ink-foreground auf ink', t['ink-foreground'], t.ink, 4.5)
  check('ink-muted auf ink', t['ink-muted'], t.ink, 4.5)
  check('signal als Grafik auf ink', t['signal-on-dark'], t.ink, 3)
  check('Fokus-Halo (50 %) auf ink', mix(t['ink-foreground'], t.ink, 0.5), t.ink, 3)
  check('Button als Form auf ink', t['ink-action'], t.ink, 3)
  check('Button-Schrift auf dem Button (ink)', t['ink-action-foreground'], t['ink-action'], 4.5)
  check('dekorativ: ink-border auf ink', t['ink-border'], t.ink, 1.2)
}
if (kinds.includes('brand')) {
  check('brand-foreground auf brand', t['brand-foreground'], t.brand, 4.5)
  check('brand-muted auf brand', t['brand-muted'], t.brand, 4.5)
  check('signal als Grafik auf brand', t['signal-on-brand'], t.brand, 3)
  check('Button als Form auf brand', t['brand-action'], t.brand, 3)
  check('Button-Schrift auf dem Button (brand)', t['brand-action-foreground'], t['brand-action'], 4.5)
  check('Fokus-Halo (50 %) auf brand', mix(t['brand-foreground'], t.brand, 0.5), t.brand, 3)
  check('dekorativ: brand-border auf brand', t['brand-border'], t.brand, 1.2)
}
for (const [label, a, b, min] of extra) check(label, a, b, min)

// bewusst geprüfte Problemfälle -> im Konzept des Presets als verboten dokumentieren, wenn sie durchfallen
check('VERBOTEN? signal als kleiner Text auf card', t.signal, t.card, 4.5)
check('VERBOTEN? Weiß auf signal', white, t.signal, 4.5)
check('dekorativ: border auf background', t.border, t.background, 1.2)
check('dekorativ: border auf card', t.border, t.card, 1.2)

console.log('\nPaar · Verhältnis · Ziel')
for (const r of rows) console.log(`${r.ratio >= r.min ? 'ok  ' : 'FAIL'} ${r.ratio.toFixed(2).padStart(6)} (>= ${r.min})  ${r.label}`)
const failed = rows.filter(r => r.ratio < r.min && !r.label.startsWith('VERBOTEN'))
console.log(failed.length ? `\n${failed.length} Paar(e) durchgefallen – Token-Helligkeit anpassen (Rezept UND style.css) oder andere Eingabefarbe wählen.` : '\nAlle Pflicht-Paare bestanden. (VERBOTEN-Zeilen dürfen durchfallen – dann gehören sie ins Konzept.)')
process.exit(failed.length ? 1 : 0)
```

- [ ] **Step 4: Gegen die Referenz prüfen**

```bash
node scripts/contrast.mjs > .shots/contrast-nachher.txt; diff <(grep -E "^(ok|FAIL)" .shots/contrast-vorher.txt | sort) <(grep -E "^(ok|FAIL)" .shots/contrast-nachher.txt | sort)
```

Expected: Unterschiede nur bei Zeilen, die es vorher nicht gab oder die umbenannt wurden (Kachel, „Button als Form auf ink“, „Button-Schrift … (ink)“); die Zeile „VERBOTEN? primary-Button als Form auf ink“ entfällt. **Kein** Verhältnis einer gleichnamigen Zeile darf sich ändern. Abschlusszeile: „Alle Pflicht-Paare bestanden.“

- [ ] **Step 5: `scripts/check-styles.mjs`**

```js
// Prüft alle Stil-Presets. 1) statisch: Jedes Preset definiert denselben Variablensatz wie Kursbuch und ordnet alle
// Flächenrollen zu. 2) mit --url: misst im Browser dieselben Kontraste wie die Ampel im Themer (app/styles/measure.js).
// Aufruf: node scripts/check-styles.mjs [--url http://localhost:3100]
import { existsSync, readFileSync } from 'node:fs'
import { launchBrowser, openPage } from './lib/cdp.mjs'

const root = new URL('../app/styles/', import.meta.url)
const presets = JSON.parse(readFileSync(new URL('presets.json', root), 'utf8'))
const ROLES = ['surface-header', 'surface-footer', 'surface-board', 'surface-highlight', 'tile-featured']
let problems = 0
const problem = (text) => { problems++; console.log(`FEHLER  ${text}`) }

// ---------- 1) statisch ----------
const variablesOf = css => new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(match => match[1]))
const files = {}
for (const preset of presets) {
  const file = new URL(`${preset.id}/style.css`, root)
  if (!existsSync(file)) { problem(`${preset.id}: app/styles/${preset.id}/style.css fehlt`); continue }
  files[preset.id] = readFileSync(file, 'utf8')
}
const reference = variablesOf(files.kursbuch ?? '')
for (const [id, css] of Object.entries(files)) {
  const own = variablesOf(css)
  const missing = [...reference].filter(name => !own.has(name))
  const extra = [...own].filter(name => !reference.has(name))
  if (missing.length) problem(`${id}: Variablen fehlen: ${missing.join(', ')}`)
  if (extra.length) problem(`${id}: Variablen, die Kursbuch nicht kennt (Vertrag erweitert? Dann in ALLEN Presets ergänzen): ${extra.join(', ')}`)
  if (!css.includes(`:root[data-style="${id}"]`)) problem(`${id}: Block :root[data-style="${id}"] fehlt`)
  for (const role of ROLES) if (!css.includes(`.${role}`)) problem(`${id}: Flächenrolle .${role} ist nicht zugeordnet`)
  if (/#[0-9a-f]{3,8}\b/i.test(css.replace(/--theme-(brand|signal|card):\s*#[0-9a-f]{6}/gi, '')))
    problem(`${id}: Hex-Farbe außerhalb der Eingaben --theme-* gefunden`)
  if (!missing.length && !extra.length) console.log(`ok      ${id}: ${own.size} Variablen, alle Rollen zugeordnet`)
}

// ---------- 2) im Browser ----------
const urlIndex = process.argv.indexOf('--url')
if (urlIndex >= 0) {
  const url = process.argv[urlIndex + 1]
  const source = readFileSync(new URL('measure.js', root), 'utf8').replace('export function', 'function')
  const browser = await launchBrowser()
  try {
    const { cdp, evaluate } = await openPage(browser.port, { url, width: 1280 })
    for (const preset of presets) {
      const result = JSON.parse(await evaluate(`(async () => {
        const e = document.documentElement
        e.setAttribute('data-style', ${JSON.stringify(preset.id)})
        e.classList.toggle('dark', ${!!preset.dark})
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        ${source}
        return JSON.stringify(measureStyle())
      })()`))
      const failed = result.checks.filter(check => check.ratio < check.min)
      console.log(`\n${preset.id}: ${result.checks.length - failed.length}/${result.checks.length} Kontraste bestehen · Aktion ${result.resolved.primary} · Signal ${result.resolved.signal} / ${result.resolved.signalOnDark}`)
      for (const check of failed) problem(`${preset.id}: ${check.label} ${check.ratio.toFixed(2)} (>= ${check.min})`)
    }
    cdp.close()
  }
  finally {
    browser.close()
  }
}

console.log(problems ? `\n${problems} Problem(e).` : '\nAlle Presets in Ordnung.')
process.exit(problems ? 1 : 0)
```

- [ ] **Step 6: `--style` in `scripts/screenshot.mjs`**

Nach der Zeile mit `const [outDir, url, ...widthArgs]` die Argumente vorher filtern – den Anfang ersetzen durch:

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, openPage, sleep } from './lib/cdp.mjs'

const args = process.argv.slice(2)
const styleIndex = args.indexOf('--style')
const styleId = styleIndex >= 0 ? args.splice(styleIndex, 2)[1] : null
const [outDir, url, ...widthArgs] = args
if (!outDir || !url) {
  console.error('Aufruf: node scripts/screenshot.mjs <ausgabeordner> <url> [breite ...] [--style <id>]')
  process.exit(1)
}
const widths = widthArgs.length ? widthArgs.map(Number) : [360, 768, 1280, 1536]
// --style setzt das Preset nach dem Laden direkt auf <html> – funktioniert auch am gebauten Server ohne Themer
const preset = styleId && JSON.parse(readFileSync(new URL('../app/styles/presets.json', import.meta.url), 'utf8')).find(item => item.id === styleId)
if (styleId && !preset) {
  console.error(`Unbekannter Stil "${styleId}"`)
  process.exit(1)
}
```

und in der Schleife direkt nach `const { cdp, evaluate } = await openPage(…)`:

```js
    if (preset) {
      await evaluate(`(async () => { const e = document.documentElement; e.setAttribute('data-style', ${JSON.stringify(preset.id)}); e.classList.toggle('dark', ${!!preset.dark}); await document.fonts.ready; await new Promise(r => setTimeout(r, 800)); await document.fonts.ready })()`)
    }
```

Den Kopfkommentar der Datei um `[--style <id>]` ergänzen.

- [ ] **Step 7: Prüfen**

```bash
node scripts/check-styles.mjs --url http://localhost:3100
node scripts/screenshot.mjs .shots/task5 http://localhost:3100/ 1280 --style kursbuch
node scripts/compare-shots.mjs .shots/task5 .shots/vorher --tolerance <N aus Task 1>
```

Expected: `ok      kursbuch: … Variablen, alle Rollen zugeordnet`, `kursbuch: 36/36 Kontraste bestehen`, `Alle Presets in Ordnung.` Der Vergleich meldet für `start-1280.png` und `start-1280-fold.png` „gleich“ (der Ordner `task5` enthält nur diese zwei Dateien). Gegenprobe der statischen Prüfung: in `kursbuch/style.css` testweise die Zeile `--board-weight: 500;` auskommentieren – das Skript läuft weiter grün (Kursbuch ist die Referenz); stattdessen testweise `.surface-board` in der Zuordnung umbenennen → `FEHLER  kursbuch: Flächenrolle .surface-board ist nicht zugeordnet`. Beide Änderungen zurücknehmen.

- [ ] **Step 8: Checkpoint**

`contrast.mjs` liefert für Kursbuch die alten Verhältnisse, `check-styles.mjs` ist grün, `--style kursbuch` erzeugt deckungsgleiche Bilder.

---

### Gemeinsamer Ablauf für die Preset-Aufgaben 6–9

Jede der vier Aufgaben folgt denselben Schritten (in jeder Aufgabe ausgeschrieben). Zwei Dinge gelten überall:

- **Wenn ein Pflicht-Paar durchfällt:** Helligkeit (erster OKLCH-Wert) des betroffenen Tokens in Schritten von 0.02 ändern – im Rezept **und** in der `style.css` –, bis es besteht. Sekundärtext und Linien werden dunkler bzw. auf dunklen Flächen heller; Flächen bleiben. Die Änderung im `konzept.md` festhalten.
- **Wenn dem Vertrag etwas fehlt** (ein Stilwert lässt sich nicht ausdrücken): neue Variable in `contract.css` einführen, in **allen** vorhandenen Presets mit dem bisherigen Verhalten belegen (`check-styles.mjs` erzwingt das), Kursbuch-Regression aus Task 3 wiederholen.

---

### Task 6: Preset „Plakat“

**Files:**
- Create: `app/styles/plakat/konzept.md`, `app/styles/plakat/style.css`
- Modify: `app/styles/presets.json`, `scripts/style-recipes.mjs`, `app/assets/css/tailwind.css` (zwei Importe), `package.json` (über Yarn)

**Interfaces:**
- Consumes: Vertrag aus Task 2, Hook-Klassen `board-cols`, `tile`, `tile-featured` aus Task 3, `brandKind` aus `scripts/style-recipes.mjs`.
- Produces: Preset-ID `plakat`.

- [ ] **Step 1: Schrift installieren und einbinden**

```bash
yarn add @fontsource-variable/archivo
grep -E "font-family|font-stretch|font-weight" node_modules/@fontsource-variable/archivo/wdth.css | sort -u
```

Expected: `font-family: 'Archivo Variable'`, `font-stretch: 62% 125%`, `font-weight: 100 900`. In `tailwind.css` bei den Font-Importen ergänzen:

```css
@import "@fontsource-variable/archivo/wdth.css";               /* Plakat: eine Familie, Breitenachse für die schmalen Versal-Headlines */
```

und nach dem Kursbuch-Import: `@import "../../styles/plakat/style.css";`

- [ ] **Step 2: Registry und Rezept**

`presets.json` ergänzen:

```json
  {
    "id": "plakat",
    "label": "Plakat",
    "description": "Laut und hart: fette schmale Versalien, starke schwarze Linien, Radius 0, Gelb als Fläche.",
    "defaults": { "brand": "#ffd500", "signal": "#e10600", "radius": 0 }
  }
```

`scripts/style-recipes.mjs` – in `recipes` ergänzen:

```js
  plakat(ctx) {
    const { signal, H, clampLum } = ctx
    const onLight = clampLum(signal, { max: 0.22 })
    const t = {
      'background': [0.985, 0.004, H],
      'card': [1, 0, H],
      'secondary': [0.94, 0.01, H],
      'muted': [0.955, 0.008, H],
      'accent': [0.93, 0.012, H],
      'foreground': [0.16, 0.01, H],
      'muted-foreground': [0.42, 0.01, H],
      'primary': [0.16, 0.01, H],
      'primary-foreground': [0.99, 0.005, H],
      'border': [0.16, 0.01, H],
      'input': [0.16, 0.01, H],
      'ring': [0.16, 0.01, H],
      'destructive': [0.45, 0.16, 355],
      'signal': onLight,
      'signal-on-dark': clampLum(signal, { min: 0.19 }),
      'signal-on-brand': onLight, // der Brand dieses Presets ist hell
      'ink': [0.16, 0.01, H],
      'ink-foreground': [0.985, 0.004, H],
      'ink-muted': [0.8, 0.01, H],
      'ink-border': [0.4, 0.01, H],
      'ink-action': [0.99, 0.005, H],
      'ink-action-foreground': [0.16, 0.01, H],
      ...brandKind(ctx),
      'tile-bg': [1, 0, H],
      'tile-fg': [0.16, 0.01, H],
    }
    t['brand-border'] = t.foreground // schwarze Linien auch auf Gelb
    return {
      t,
      surfaces: ['background', 'card', 'secondary', 'muted', 'accent'],
      kinds: ['ink', 'brand'],
      extra: [
        ['Hover der Kachel: Text auf brand', t.foreground, t.brand, 4.5],
        ['Hover der Kachel: Sekundärtext auf brand', t['muted-foreground'], t.brand, 4.5],
        ['Tafelkopf: background auf foreground', t.background, t.foreground, 4.5],
      ],
    }
  },
```

- [ ] **Step 3: Rechnen**

```bash
node scripts/contrast.mjs --style plakat | tee .shots/contrast-plakat.txt
```

Expected: „Alle Pflicht-Paare bestanden.“ Sonst nach dem gemeinsamen Ablauf anpassen. Die Tabelle wird in Step 4 ins Konzept übernommen.

- [ ] **Step 4: `app/styles/plakat/konzept.md` schreiben**

```markdown
# Stil-Preset „Plakat“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Schweizer Plakat: eine Schrift, eine Farbe, harte Kanten. Hierarchie entsteht über Größe, Gewicht und Versalien, nicht über Tönungen. **Signatur:** die schmalen, fetten Versal-Headlines über 3 px starken schwarzen Linien. Abgrenzung von Reflex-Look (c): keine Serif, keine Haarlinien, keine Zeitungsspalten.

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#ffd500` | helle Markenfläche: Kopfzeile, Regel-Sektion, Top-Job-Kachel. **Nie** Text- oder Linkfarbe (auf Weiß ~1.4:1). |
| Signal | `#e10600` | Grafik und großes Wort; auf Gelb direkt verwendbar |
Aktionsfarbe ist Schwarz (`--primary` = Textfarbe): Buttons schwarz, Links schwarz unterstrichen. Neutrale fast ohne Chroma. `--destructive` liegt im Magenta (Hue 355), damit Fehler nicht wie das Signalrot aussehen.

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style plakat` – Ausgabe vom <Datum>:

<Zeilen „ok/FAIL …“ aus .shots/contrast-plakat.txt hier als Codeblock einfügen>

**Verboten:** Gelb als Text oder Icon auf hellen Flächen; Signalrot als kleiner Text; weiße Schrift auf Rot. <weitere durchgefallene VERBOTEN-Zeilen ergänzen>

## 4 Typografie
Archivo (variabel, selbst gehostet, `wdth.css`). Display: 800, Breite 75 %, Versalien, Laufweite −0.01 em, Zeilenhöhe 0.95–1.0. Text und UI: 400–600, normale Breite. Eine Familie genügt (Research 1.2.6). Kennzahlen und Tafel in der schmalen Breite. Test bei 360 px mit „Ausbildung Fachinformatiker Anwendungsentwicklung“: <Ergebnis aus Step 7>.

## 5 Form, Flächen, Kachel
Radius 0 – auch Chips, Badges, Punkte. Linien 3 px, Signaturlinien 4 px, schwarz. Kein Schatten. Flächenrollen: Kopfzeile, Hervorhebung, Top-Job = Marke (Gelb); Fußzeile = Dunkel (Schwarz); Tafel = hell mit Kante, Spaltenkopf invertiert. Kachel: weiße Fläche mit 3-px-Kante (Kante statt Schatten, 1.5.3); Hover füllt sie gelb.

## 6 Bewegung
Keine Einstiegsbewegung der Tafel, Zustandswechsel hart (0 ms). Die H1 blendet wie in allen Presets ein; mit „Bewegung reduzieren“ entfällt auch das.

## 7 Offene Punkte
<Was am Screenshot aufgefallen ist und nicht behoben wurde>
```

Die drei Platzhalter in spitzen Klammern sind Messwerte dieser Aufgabe und werden in Step 3 bzw. Step 7 gefüllt – am Ende darf keine spitze Klammer mehr in der Datei stehen.

- [ ] **Step 5: `app/styles/plakat/style.css` schreiben**

```css
/*
  PRESET "Plakat" – Konzept: app/styles/plakat/konzept.md
  Nachrechnen: node scripts/contrast.mjs --style plakat   (Rezept: scripts/style-recipes.mjs, gleiche L/C-Werte wie hier)
*/
:root[data-style="plakat"] {
  /* --- Eingaben --- */
  --theme-brand: #ffd500;                                          /* helle Markenfläche – nie Text- oder Linkfarbe */
  --theme-signal: #e10600;
  --theme-card: oklch(from var(--theme-brand) 1 0 h);              /* reines Weiß */
  --radius: 0rem;

  --primary: oklch(from var(--theme-brand) 0.16 0.01 h);           /* Aktion ist Schwarz: Gelb erreicht als Text nie 4.5:1 */
  --signal: color(from var(--theme-signal) xyz-d65 calc(x * min(1, 0.22 / y)) calc(y * min(1, 0.22 / y)) calc(z * min(1, 0.22 / y)));
  --signal-on-dark: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --signal-on-brand: var(--signal);                                /* der Brand dieses Presets ist hell */

  /* --- Neutrale: fast ohne Chroma --- */
  --background: oklch(from var(--theme-brand) 0.985 0.004 h);
  --foreground: oklch(from var(--theme-brand) 0.16 0.01 h);
  --primary-foreground: oklch(from var(--theme-brand) 0.99 0.005 h);
  --secondary: oklch(from var(--theme-brand) 0.94 0.01 h);
  --muted: oklch(from var(--theme-brand) 0.955 0.008 h);
  --muted-foreground: oklch(from var(--theme-brand) 0.42 0.01 h);
  --accent: oklch(from var(--theme-brand) 0.93 0.012 h);
  --destructive: oklch(0.45 0.16 355);                             /* Magenta-Rot: nicht mit dem Signalrot verwechselbar */
  --border: oklch(from var(--theme-brand) 0.16 0.01 h);            /* Linien sind schwarz */
  --input: oklch(from var(--theme-brand) 0.16 0.01 h);
  --ring: oklch(from var(--theme-brand) 0.16 0.01 h);

  /* --- Flächenart "ink": Schwarz --- */
  --ink: oklch(from var(--theme-brand) 0.16 0.01 h);
  --ink-foreground: oklch(from var(--theme-brand) 0.985 0.004 h);
  --ink-muted: oklch(from var(--theme-brand) 0.8 0.01 h);
  --ink-border: oklch(from var(--theme-brand) 0.4 0.01 h);
  --ink-action: oklch(from var(--theme-brand) 0.99 0.005 h);
  --ink-action-foreground: oklch(from var(--theme-brand) 0.16 0.01 h);

  /* --- Flächenart "brand": Schalter wie in Kursbuch (bei diesem hellen Brand: dunkler Text, schwarzer Button) --- */
  --brand-foreground: oklch(from var(--theme-brand) calc(0.22 + 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.004 h);
  --brand-muted: oklch(from var(--theme-brand) calc(0.32 + 0.54 * clamp(0, (0.6 - l) * 1000, 1)) 0.04 h);
  --brand-border: oklch(from var(--theme-brand) 0.16 0.01 h);      /* schwarze Linien auch auf Gelb */
  --brand-action: oklch(from var(--theme-brand) calc(0.22 + 0.775 * clamp(0, (0.6 - l) * 1000, 1)) 0.002 h);
  --brand-action-foreground: oklch(from var(--theme-brand) calc(0.985 - 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.01 h);

  /* --- Stil: Schrift (eine Familie, zwei Breiten) --- */
  --style-font-sans: 'Archivo Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --style-font-heading: 'Archivo Variable', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif;
  --style-font-figure: 'Archivo Variable', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif;
  --heading-weight: 800;
  --heading-stretch: 75%;
  --heading-transform: uppercase;
  --figure-weight: 800;
  --board-weight: 700;

  /* --- Stil: Typo-Rollen --- */
  --type-h1-size: var(--text-f-7xl);
  --type-h1-leading: 0.95;
  --type-h1-tracking: -0.01em;
  --type-h1-page-size: var(--text-f-6xl);
  --type-h1-page-leading: 0.98;
  --type-h1-page-tracking: -0.01em;
  --type-h2-size: var(--text-f-5xl);
  --type-h2-leading: 1;
  --type-h2-tracking: -0.005em;
  --type-h3-lg-size: var(--text-f-3xl);
  --type-h3-lg-leading: 1.05;
  --type-h3-lg-tracking: 0em;
  --type-h3-size: var(--text-f-2xl);
  --type-h3-leading: 1.1;
  --type-h3-tracking: 0em;
  --type-box-title-leading: 1.1;
  --type-lead-size: var(--text-f-xl);
  --type-lead-leading: 1.45;
  --type-figure-size: var(--text-f-7xl);

  /* --- Stil: Form --- */
  --style-radius-pill: 0px;
  --style-radius-dot: 0px;
  --line-weight: 3px;
  --line-weight-strong: 4px;
  --style-shadow-xs: 0 0 0 0 transparent;
  --style-shadow-sm: 0 0 0 0 transparent;
  --style-shadow-md: 0 0 0 0 transparent;

  /* --- Stil: Kachel (weiße Fläche, starke Kante, kein Schatten) --- */
  --tile-bg: var(--card);
  --tile-fg: var(--foreground);
  --tile-padding: 1.5rem;
  --tile-border-width: 3px;
  --tile-border-color: var(--foreground);
  --tile-shadow: none;
  --tile-hover-shadow: none;

  /* --- Stil: Bewegung (keine) --- */
  --board-row-animation: none;
  --board-row-stagger: 0ms;
}

/* Flächenrollen → Flächenarten */
:root[data-style="plakat"] :is(.surface-header, .surface-highlight, .tile-featured) {
  @apply surface-brand;
}
:root[data-style="plakat"] .surface-footer {
  @apply surface-ink;
}
:root[data-style="plakat"] .surface-board {
  @apply surface-plain;
  border: var(--line-weight) solid var(--border);
}

/* Regeln auf dokumentierte Rollenklassen */
:root[data-style="plakat"] .surface-header {
  border-bottom: var(--line-weight) solid var(--border);
}
:root[data-style="plakat"] .board-cols {                           /* invertierter Tabellenkopf */
  background-color: var(--foreground);
  color: var(--background);
}
:root[data-style="plakat"] .tile:not(.tile-featured):hover {        /* Hover füllt die Kachel gelb */
  background-color: var(--brand);
}
:root[data-style="plakat"] :is(a, button, .tile, a svg) {           /* harte Zustandswechsel */
  transition-duration: 0s;
}
```

- [ ] **Step 6: Bauen, statisch und im Browser prüfen**

```bash
npx nuxt build    # danach Server auf 3100 neu starten
node scripts/check-styles.mjs --url http://localhost:3100
```

Expected: `ok      plakat: …`, `plakat: 36/36 Kontraste bestehen`. Fällt im Browser ein Paar durch, das die Rechnung bestanden hat, stimmen Rezept und CSS nicht überein – Werte abgleichen.

- [ ] **Step 7: Screenshots ansehen und bewerten**

```bash
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/plakat http://localhost:3100$url --style plakat; done
```

Expected: überall `Stil: plakat`, `Überlauf: nein`, Fonts enthalten `Archivo Variable`. Dann mit dem Read-Werkzeug ansehen: `start-360.png`, `start-1280.png`, `jobs-1280.png`, `jobs_ausbildung-fachinformatiker-anwendungsentwicklung-360.png`. Prüfliste:
  1. Headlines schmal, fett, in Versalien; der lange Jobtitel bricht bei 360 px mit Trennstrich, ohne Überlauf. Wenn nicht: `--type-h1-page-size: var(--text-f-5xl);`
  2. Accordion-Fragen sind **nicht** in Versalien.
  3. Kopfzeile gelb mit schwarzer Unterkante; Primär-Button darin schwarz; Linienband-Halte eckig.
  4. Kacheln weiß mit 3-px-Kante, Top-Job gelb; nirgends Rundungen, nirgends Schatten.
  5. Tafel: heller Kasten mit Kante, Spaltenkopf schwarz mit heller Schrift.
  6. Kein gelber Text, keine gelben Icons auf Weiß.
  7. Blur-Test (Bild stark verkleinert denken): pro Screen ein dominantes Element.
Auffälligkeiten beheben (nur in `plakat/style.css` bzw. über den gemeinsamen Ablauf) oder in Abschnitt 7 des Konzepts notieren. Ergebnis des 360-px-Tests in Abschnitt 4 eintragen.

- [ ] **Step 8: Kursbuch-Gegenprobe und Checkpoint**

```bash
node scripts/screenshot.mjs .shots/plakat-gegenprobe http://localhost:3100/ 1280
node scripts/compare-shots.mjs .shots/plakat-gegenprobe .shots/vorher --tolerance <N aus Task 1>
grep -c "<" app/styles/plakat/konzept.md
```

Expected: Kursbuch weiter „gleich“; `grep` meldet 0 (keine offenen Platzhalter im Konzept).

---

### Task 7: Preset „Weich“

**Files:**
- Create: `app/styles/weich/konzept.md`, `app/styles/weich/style.css`
- Modify: `app/styles/presets.json`, `scripts/style-recipes.mjs`, `app/assets/css/tailwind.css`, `package.json` (über Yarn)

**Interfaces:**
- Consumes: Vertrag aus Task 2, `brandKind` aus `scripts/style-recipes.mjs`.
- Produces: Preset-ID `weich`.

- [ ] **Step 1: Schriften installieren und einbinden**

```bash
yarn add @fontsource-variable/bricolage-grotesque @fontsource-variable/figtree
grep -h "font-family" node_modules/@fontsource-variable/bricolage-grotesque/index.css node_modules/@fontsource-variable/figtree/index.css | sort -u
```

Expected: `'Bricolage Grotesque Variable'` und `'Figtree Variable'`. In `tailwind.css`:

```css
@import "@fontsource-variable/bricolage-grotesque/index.css";  /* Weich: Display */
@import "@fontsource-variable/figtree/index.css";              /* Weich: Text/UI */
```

und bei den Presets: `@import "../../styles/weich/style.css";`

- [ ] **Step 2: Registry und Rezept**

`presets.json`:

```json
  {
    "id": "weich",
    "label": "Weich",
    "description": "Ruhig und freundlich: runde Formen, helle Karten mit getöntem Schatten, Waldgrün und Koralle.",
    "defaults": { "brand": "#1f5c45", "signal": "#e2604a", "radius": 1 }
  }
```

`scripts/style-recipes.mjs` (Flächen warm mit festem Hue 85, Text und Tönungen im Hue des Brands):

```js
  weich(ctx) {
    const { brand, signal, H, clampLum } = ctx
    const signalOnDark = clampLum(signal, { min: 0.19 })
    return {
      surfaces: ['background', 'card', 'secondary', 'muted', 'accent'],
      kinds: ['brand'],
      t: {
        'background': [0.975, 0.008, 85],
        'card': [0.995, 0.003, 85],
        'secondary': [0.94, 0.025, H],
        'muted': [0.955, 0.01, 85],
        'accent': [0.945, 0.025, H],
        'foreground': [0.25, 0.03, H],
        'muted-foreground': [0.46, 0.03, H],
        'primary': clampLum(brand, { max: 0.13 }),
        'primary-foreground': [0.985, 0.004, H],
        'border': [0.9, 0.01, 85],
        'input': [0.6, 0.03, H],
        'ring': [0.22, 0.05, H],
        'destructive': [0.45, 0.15, 350],
        'signal': clampLum(signal, { max: 0.22 }),
        'signal-on-dark': signalOnDark,
        'signal-on-brand': signalOnDark,
        'ink': [0.22, 0.04, H],
        'ink-foreground': [0.975, 0.006, H],
        'ink-muted': [0.8, 0.03, H],
        'ink-border': [0.35, 0.04, H],
        'ink-action': [0.995, 0.002, H],
        'ink-action-foreground': [0.25, 0.03, H],
        ...brandKind(ctx),
        'tile-bg': [0.995, 0.003, 85],
        'tile-fg': [0.25, 0.03, H],
      },
    }
  },
```

- [ ] **Step 3: Rechnen**

```bash
node scripts/contrast.mjs --style weich | tee .shots/contrast-weich.txt
```

Expected: „Alle Pflicht-Paare bestanden.“ Sonst nach dem gemeinsamen Ablauf anpassen.

- [ ] **Step 4: `app/styles/weich/konzept.md` schreiben**

```markdown
# Stil-Preset „Weich“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Ruhig, freundlich, mit leichter Tiefe: Gruppiert wird über Weißraum und Schatten, Linien sind selten. **Signatur:** helle, weich gerundete Karten, die auf einem warmen Grund liegen – auch die Tafel ist eine solche Karte. Abgrenzung von Reflex-Look (a): kein Creme, keine Serif, kein Terrakotta – der Grund ist ein warmes Weiß (Chroma 0.008), die Farbe ist Grün.

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#1f5c45` | Aktion, Links, Icons; Markenfläche für Regel-Sektion, Fußzeile, Top-Job |
| Signal | `#e2604a` | Koralle, nur Grafik und großes Wort |
Flächen-Neutrale haben einen festen warmen Farbton (Hue 85), Text und Tönungen (`secondary`, `accent`) folgen dem Farbton des Brands. `--destructive` liegt bei Hue 350, abgesetzt von der Koralle (Hue ~30).

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style weich` – Ausgabe vom <Datum>:

<Zeilen „ok/FAIL …“ aus .shots/contrast-weich.txt hier als Codeblock einfügen>

**Verboten:** Koralle als kleiner Text; weiße Schrift auf Koralle. <weitere durchgefallene VERBOTEN-Zeilen ergänzen>

## 4 Typografie
Display Bricolage Grotesque (variabel, 700, gemischte Schreibung, Laufweite −0.02 em), Text Figtree (variabel). Verwandte Haltung (beide weich und offen), Kontrast in der Rolle (eigenwillig gegen neutral). Test bei 360 px: <Ergebnis aus Step 7>.

## 5 Form, Flächen, Kachel
Radius 16 px (Buttons 14, Kacheln/Bilder/Tafel 24), Pillen und Punkte rund, Linien 1 px. Schatten dreistufig, zweiteilig, im Grün getönt. Flächenrollen: Kopfzeile = hell; Tafel = helle Karte mit Schatten; Hervorhebung, Fußzeile, Top-Job = Marke (Grün). Kachel: helle Fläche mit Schatten, **keine** Kante (1.5.3); Hover hebt den Schatten eine Stufe.

## 6 Bewegung
Die Tafelzeilen blenden gestaffelt ein (opacity + 8 px, 300 ms, 70 ms Versatz). Sonst nur Zustandsübergänge ≤ 200 ms.

## 7 Offene Punkte
<Entscheidung 24 px Kachelradius am Screenshot: bleibt / Radius auf 0.875rem gesenkt; weitere Auffälligkeiten>
```

- [ ] **Step 5: `app/styles/weich/style.css` schreiben**

```css
/*
  PRESET "Weich" – Konzept: app/styles/weich/konzept.md
  Nachrechnen: node scripts/contrast.mjs --style weich   (Rezept: scripts/style-recipes.mjs, gleiche L/C-Werte wie hier)
*/
:root[data-style="weich"] {
  /* --- Eingaben --- */
  --theme-brand: #1f5c45;
  --theme-signal: #e2604a;
  --theme-card: oklch(0.995 0.003 85);                             /* warmes Weiß, fester Farbton: Flächen bleiben warm, egal welcher Brand */
  --radius: 1rem;                                                  /* md 14 (Buttons) · lg 16 · xl 24 (Kacheln, Bilder, Tafel) */

  --primary: color(from var(--theme-brand) xyz-d65 calc(x * min(1, 0.13 / y)) calc(y * min(1, 0.13 / y)) calc(z * min(1, 0.13 / y)));
  --signal: color(from var(--theme-signal) xyz-d65 calc(x * min(1, 0.22 / y)) calc(y * min(1, 0.22 / y)) calc(z * min(1, 0.22 / y)));
  --signal-on-dark: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --signal-on-brand: var(--signal-on-dark);                        /* der Brand dieses Presets ist dunkel */

  /* --- Neutrale: Flächen warm (Hue 85), Text und Tönungen im Farbton des Brands --- */
  --background: oklch(0.975 0.008 85);
  --foreground: oklch(from var(--theme-brand) 0.25 0.03 h);
  --primary-foreground: oklch(from var(--theme-brand) 0.985 0.004 h);
  --secondary: oklch(from var(--theme-brand) 0.94 0.025 h);
  --muted: oklch(0.955 0.01 85);
  --muted-foreground: oklch(from var(--theme-brand) 0.46 0.03 h);
  --accent: oklch(from var(--theme-brand) 0.945 0.025 h);
  --destructive: oklch(0.45 0.15 350);
  --border: oklch(0.9 0.01 85);
  --input: oklch(from var(--theme-brand) 0.6 0.03 h);
  --ring: oklch(from var(--theme-brand) 0.22 0.05 h);

  /* --- Flächenart "ink" (in diesem Preset keiner Rolle zugeordnet, gehört aber zum Vertrag) --- */
  --ink: oklch(from var(--theme-brand) 0.22 0.04 h);
  --ink-foreground: oklch(from var(--theme-brand) 0.975 0.006 h);
  --ink-muted: oklch(from var(--theme-brand) 0.8 0.03 h);
  --ink-border: oklch(from var(--theme-brand) 0.35 0.04 h);
  --ink-action: oklch(from var(--theme-brand) 0.995 0.002 h);
  --ink-action-foreground: oklch(from var(--theme-brand) 0.25 0.03 h);

  /* --- Flächenart "brand": Schalter wie in Kursbuch --- */
  --brand-foreground: oklch(from var(--theme-brand) calc(0.22 + 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.004 h);
  --brand-muted: oklch(from var(--theme-brand) calc(0.32 + 0.54 * clamp(0, (0.6 - l) * 1000, 1)) 0.04 h);
  --brand-border: oklch(from var(--theme-brand) calc(l - 0.115 + 0.23 * clamp(0, (0.6 - l) * 1000, 1)) calc(c * 0.85) h);
  --brand-action: oklch(from var(--theme-brand) calc(0.22 + 0.775 * clamp(0, (0.6 - l) * 1000, 1)) 0.002 h);
  --brand-action-foreground: oklch(from var(--theme-brand) calc(0.985 - 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.01 h);

  /* --- Stil: Schrift --- */
  --style-font-sans: 'Figtree Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --style-font-heading: 'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif;
  --style-font-figure: 'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif;
  --heading-weight: 700;
  --heading-stretch: normal;
  --heading-transform: none;
  --figure-weight: 700;
  --board-weight: 600;

  /* --- Stil: Typo-Rollen --- */
  --type-h1-size: var(--text-f-7xl);
  --type-h1-leading: 1.05;
  --type-h1-tracking: -0.02em;
  --type-h1-page-size: var(--text-f-6xl);
  --type-h1-page-leading: 1.08;
  --type-h1-page-tracking: -0.02em;
  --type-h2-size: var(--text-f-5xl);
  --type-h2-leading: 1.12;
  --type-h2-tracking: -0.015em;
  --type-h3-lg-size: var(--text-f-3xl);
  --type-h3-lg-leading: 1.2;
  --type-h3-lg-tracking: -0.01em;
  --type-h3-size: var(--text-f-2xl);
  --type-h3-leading: 1.25;
  --type-h3-tracking: -0.005em;
  --type-box-title-leading: 1.25;
  --type-lead-size: var(--text-f-xl);
  --type-lead-leading: 1.55;
  --type-figure-size: var(--text-f-6xl);

  /* --- Stil: Form --- */
  --style-radius-pill: 9999px;
  --style-radius-dot: 9999px;
  --line-weight: 1px;
  --line-weight-strong: 3px;
  --style-shadow-xs: 0 1px 2px 0 oklch(from var(--theme-brand) 0.3 0.05 h / 0.08);
  --style-shadow-sm: 0 1px 2px 0 oklch(from var(--theme-brand) 0.3 0.05 h / 0.08), 0 6px 16px -4px oklch(from var(--theme-brand) 0.3 0.05 h / 0.1);
  --style-shadow-md: 0 2px 4px 0 oklch(from var(--theme-brand) 0.3 0.05 h / 0.08), 0 16px 36px -8px oklch(from var(--theme-brand) 0.3 0.05 h / 0.16);

  /* --- Stil: Kachel (helle Fläche mit Schatten, keine Kante) --- */
  --tile-bg: var(--card);
  --tile-fg: var(--foreground);
  --tile-padding: 1.5rem;
  --tile-border-width: 0px;
  --tile-border-color: transparent;
  --tile-shadow: var(--style-shadow-sm);
  --tile-hover-shadow: var(--style-shadow-md);

  /* --- Stil: Bewegung (ruhiges Einblenden) --- */
  --board-row-animation: board-fade 300ms ease-out both;
  --board-row-stagger: 70ms;
}

/* Flächenrollen → Flächenarten */
:root[data-style="weich"] :is(.surface-highlight, .surface-footer, .tile-featured) {
  @apply surface-brand;
}
:root[data-style="weich"] .surface-header {
  @apply surface-plain;
  box-shadow: var(--style-shadow-xs);
}
:root[data-style="weich"] .surface-board {
  @apply surface-plain;
  box-shadow: var(--style-shadow-md);
}
/* Die grüne Top-Job-Kachel trägt keinen Schatten: Fläche ODER Schatten */
:root[data-style="weich"] .tile-featured {
  box-shadow: none;
}
```

- [ ] **Step 6: Bauen, statisch und im Browser prüfen**

```bash
npx nuxt build    # danach Server auf 3100 neu starten
node scripts/check-styles.mjs --url http://localhost:3100
```

Expected: `ok      weich: …`, `weich: 36/36 Kontraste bestehen`.

- [ ] **Step 7: Screenshots ansehen und bewerten**

```bash
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/weich http://localhost:3100$url --style weich; done
```

Expected: `Stil: weich`, `Überlauf: nein`, Fonts enthalten `Bricolage Grotesque Variable` und `Figtree Variable`. Ansehen: `start-360.png`, `start-1280.png`, `jobs-1280.png`, Detailseite bei 360 und 1280. Prüfliste:
  1. Kacheln heben sich auf **beiden** Grundflächen (`background` und `card`) allein durch den Schatten ab. Wenn sie auf `card` verschwinden: `--style-shadow-sm` zweite Ebene auf `/ 0.14` anheben.
  2. 24 px Radius an Kacheln, Tafel und Bildern wirkt nicht „aufgeblasen“ (Research 1.8). Sonst `--radius: 0.875rem` (Kacheln 21 px) – Entscheidung in Abschnitt 7.
  3. Kopfzeile hell mit grünem Button, Linienband-Halte rund, Signal Koralle.
  4. Tafel: helle Karte mit Schatten, Text dunkel, „sofort“-Punkt Koralle.
  5. Keine Kante **und** Schatten am selben Element.
  6. Der lange Jobtitel bricht bei 360 px ohne Überlauf.

- [ ] **Step 8: Kursbuch-Gegenprobe und Checkpoint**

```bash
node scripts/screenshot.mjs .shots/weich-gegenprobe http://localhost:3100/ 1280
node scripts/compare-shots.mjs .shots/weich-gegenprobe .shots/vorher --tolerance <N aus Task 1>
grep -c "<" app/styles/weich/konzept.md
```

Expected: Kursbuch „gleich“, `grep` meldet 0.

---

### Task 8: Preset „Leitstand“ (dunkel)

Besonderheit: Die Eingaben haben hier andere Rollen. **Brand** ist das Blaugrau der Flächen (Farbton aller Neutralen, Hervorhebungsfläche), **Signal** ist der Bernstein – und zugleich die Aktionsfarbe (`--primary` wird aus `--theme-signal` abgeleitet). Das Preset setzt `.dark`, definiert seine Tokens aber selbst: `:root[data-style]` hat Vorrang vor dem `.dark`-Block in `tailwind.css`.

**Files:**
- Create: `app/styles/leitstand/konzept.md`, `app/styles/leitstand/style.css`
- Modify: `app/styles/presets.json`, `scripts/style-recipes.mjs`, `app/assets/css/tailwind.css`, `package.json` (über Yarn)

**Interfaces:**
- Consumes: Vertrag aus Task 2, `brandKind`, Feld `dark` der Registry (Task 2/4/5 werten es aus).
- Produces: Preset-ID `leitstand` mit `"dark": true`.

- [ ] **Step 1: Schriften installieren und einbinden**

```bash
yarn add @fontsource/ibm-plex-mono @fontsource-variable/ibm-plex-sans
grep -h "font-family" node_modules/@fontsource/ibm-plex-mono/500.css node_modules/@fontsource-variable/ibm-plex-sans/index.css | sort -u
```

Expected: `'IBM Plex Mono'` und `'IBM Plex Sans Variable'`. In `tailwind.css`:

```css
@import "@fontsource/ibm-plex-mono/500.css";                   /* Leitstand: Display, Ziffern, Tafel */
@import "@fontsource/ibm-plex-mono/600.css";
@import "@fontsource-variable/ibm-plex-sans/index.css";        /* Leitstand: Text/UI */
```

und bei den Presets: `@import "../../styles/leitstand/style.css";`

- [ ] **Step 2: Registry und Rezept**

`presets.json`:

```json
  {
    "id": "leitstand",
    "label": "Leitstand",
    "description": "Dunkel und technisch: Mono-Ziffern und -Headlines, feine Kanten statt Flächen, Bernstein als Aktion.",
    "dark": true,
    "defaults": { "brand": "#22314a", "signal": "#e9b04a", "radius": 0.125 }
  }
```

`scripts/style-recipes.mjs`:

```js
  leitstand(ctx) {
    const { signal, H, clampLum } = ctx
    const amber = clampLum(signal, { min: 0.19 }) // die Seite ist dunkel: Signal und Aktion müssen hell genug sein
    const t = {
      'background': [0.19, 0.025, H],
      'card': [0.225, 0.028, H],
      'secondary': [0.27, 0.03, H],
      'muted': [0.245, 0.028, H],
      'accent': [0.29, 0.035, H],
      'foreground': [0.94, 0.01, H],
      'muted-foreground': [0.74, 0.02, H],
      'primary': amber,
      'primary-foreground': [0.19, 0.025, H],
      'border': [0.36, 0.03, H],
      'input': [0.58, 0.03, H],
      'ring': [0.94, 0.01, H],
      'destructive': [0.7, 0.15, 25],
      'signal': amber,
      'signal-on-dark': amber,
      'signal-on-brand': amber,
      'ink': [0.15, 0.02, H],
      'ink-foreground': [0.94, 0.01, H],
      'ink-muted': [0.74, 0.02, H],
      'ink-border': [0.3, 0.03, H],
      'ink-action': amber,
      'ink-action-foreground': [0.19, 0.025, H],
      ...brandKind(ctx),
    }
    // auf der Hervorhebungsfläche bleibt der Button bernsteinfarben
    t['brand-action'] = amber
    t['brand-action-foreground'] = [0.19, 0.025, H]
    return { t, dark: true, surfaces: ['background', 'card', 'secondary', 'muted', 'accent'], kinds: ['ink', 'brand'] }
  },
```

- [ ] **Step 3: Rechnen**

```bash
node scripts/contrast.mjs --style leitstand | tee .shots/contrast-leitstand.txt
```

Expected: „Alle Pflicht-Paare bestanden.“ WCAG 2 bewertet dunkle Paare zu freundlich (Research 2.3): Sekundärtext auf allen Flächen soll hier ≥ 5:1 erreichen – sonst `muted-foreground` heller setzen.

- [ ] **Step 4: `app/styles/leitstand/konzept.md` schreiben**

```markdown
# Stil-Preset „Leitstand“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Leitstellen-Monitor: dunkel, dicht, präzise. Struktur entsteht über feine Kanten und Helligkeitsstufen, nicht über Farbflächen. **Signatur:** Mono-Schrift für alles, was Zahl, Zeit oder Überschrift ist. **Bewusste Abweichungen:** Dunkel ist hier Dauerzustand (Research 1.3.8 sieht die dunkle Fläche als seltenen Höhepunkt). Nähe zu Reflex-Look (b) „Fast-Schwarz + Neon“ – abgesetzt durch Blaugrau statt Schwarz und einen gedeckten Bernstein statt Neon; ein zweiter Akzent existiert nicht.

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#22314a` | Blaugrau: Farbton aller Flächen und Texte, Hervorhebungsfläche |
| Signal | `#e9b04a` | Bernstein: Aktionsfarbe (Button mit dunkler Schrift, Links, Icons) **und** Signal |
Flächenstufen: Tafel/Fußzeile L 0.15 · Grund 0.19 · Karte/Kopfzeile 0.225 · Tönungen 0.245–0.29 · Hervorhebung = Brand. `--destructive` ist ein helles Rot (Hue 25), vom Bernstein (Hue ~80) klar getrennt.

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style leitstand` – Ausgabe vom <Datum>:

<Zeilen „ok/FAIL …“ aus .shots/contrast-leitstand.txt hier als Codeblock einfügen>

**Verboten:** weiße Schrift auf Bernstein; Bernstein als Fläche hinter hellem Text. <weitere durchgefallene VERBOTEN-Zeilen ergänzen>

## 4 Typografie
Display, Kennzahlen und Tafel: IBM Plex Mono (500/600). Text und UI: IBM Plex Sans (variabel) – dieselbe Familie, verwandte Haltung. Mono ist breit (~0.6 em je Zeichen), deshalb eine kleinere Headline-Skala: H1 32–48 px, H1 der Unterseiten und H2 28–36 px; Laufweite −0.03 em; Silbentrennung ist Pflicht. Test bei 360 px: <Ergebnis aus Step 7>.

## 5 Form, Flächen, Kachel
Radius 2 px, Haarlinien, Punkte eckig. Schatten nur für Overlays. Flächenrollen: Kopfzeile = hell im Sinn der Flächenart (`card`, eine Stufe über dem Grund) mit Haarlinie; Tafel und Fußzeile = Dunkel (eine Stufe unter dem Grund); Hervorhebung und Top-Job = Marke (Blaugrau, eine Stufe heller). Kachel: transparent mit 1-px-Kante, Hover-Kante Bernstein.

## 6 Bewegung
Die Fallblattanzeige bleibt – hier passt sie am besten.

## 7 Offene Punkte
<shadcn-Komponenten im Dunkelmodus: was geprüft wurde (Accordion, Badge, Sheet, Outline-Button); weitere Auffälligkeiten>
```

- [ ] **Step 5: `app/styles/leitstand/style.css` schreiben**

```css
/*
  PRESET "Leitstand" – Konzept: app/styles/leitstand/konzept.md
  Eingaben mit anderen Rollen: Brand = Blaugrau der Flächen, Signal = Bernstein UND Aktionsfarbe.
  Die Registry setzt "dark": true -> <html class="dark">, damit die dark:-Klassen der shadcn-Komponenten greifen.
  Nachrechnen: node scripts/contrast.mjs --style leitstand
*/
:root[data-style="leitstand"] {
  /* --- Eingaben --- */
  --theme-brand: #22314a;
  --theme-signal: #e9b04a;
  --theme-card: oklch(from var(--theme-brand) 0.225 0.028 h);      /* eine Stufe über dem Grund */
  --radius: 0.125rem;

  /* Die Seite ist dunkel: Signal und Aktion brauchen mindestens Luminanz 0.19 */
  --signal-on-dark: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --signal: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --signal-on-brand: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --primary: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));

  /* --- Neutrale: alle im Farbton des Brands, dunkel --- */
  --background: oklch(from var(--theme-brand) 0.19 0.025 h);
  --foreground: oklch(from var(--theme-brand) 0.94 0.01 h);
  --primary-foreground: oklch(from var(--theme-brand) 0.19 0.025 h);
  --secondary: oklch(from var(--theme-brand) 0.27 0.03 h);
  --muted: oklch(from var(--theme-brand) 0.245 0.028 h);
  --muted-foreground: oklch(from var(--theme-brand) 0.74 0.02 h);
  --accent: oklch(from var(--theme-brand) 0.29 0.035 h);
  --destructive: oklch(0.7 0.15 25);
  --border: oklch(from var(--theme-brand) 0.36 0.03 h);
  --input: oklch(from var(--theme-brand) 0.58 0.03 h);
  --ring: oklch(from var(--theme-brand) 0.94 0.01 h);

  /* --- Flächenart "ink": eine Stufe UNTER dem Grund --- */
  --ink: oklch(from var(--theme-brand) 0.15 0.02 h);
  --ink-foreground: oklch(from var(--theme-brand) 0.94 0.01 h);
  --ink-muted: oklch(from var(--theme-brand) 0.74 0.02 h);
  --ink-border: oklch(from var(--theme-brand) 0.3 0.03 h);
  --ink-action: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --ink-action-foreground: oklch(from var(--theme-brand) 0.19 0.025 h);

  /* --- Flächenart "brand": Schalter wie in Kursbuch, der Button bleibt Bernstein --- */
  --brand-foreground: oklch(from var(--theme-brand) calc(0.22 + 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.004 h);
  --brand-muted: oklch(from var(--theme-brand) calc(0.32 + 0.54 * clamp(0, (0.6 - l) * 1000, 1)) 0.04 h);
  --brand-border: oklch(from var(--theme-brand) calc(l - 0.115 + 0.23 * clamp(0, (0.6 - l) * 1000, 1)) calc(c * 0.85) h);
  --brand-action: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --brand-action-foreground: oklch(from var(--theme-brand) 0.19 0.025 h);

  /* --- Stil: Schrift --- */
  --style-font-sans: 'IBM Plex Sans Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --style-font-heading: 'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;
  --style-font-figure: 'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;
  --heading-weight: 600;
  --heading-stretch: normal;
  --heading-transform: none;
  --figure-weight: 500;
  --board-weight: 500;

  /* --- Stil: Typo-Rollen (kleinere Skala: Mono ist breit) --- */
  --type-h1-size: var(--text-f-5xl);
  --type-h1-leading: 1.12;
  --type-h1-tracking: -0.03em;
  --type-h1-page-size: var(--text-f-4xl);
  --type-h1-page-leading: 1.15;
  --type-h1-page-tracking: -0.03em;
  --type-h2-size: var(--text-f-4xl);
  --type-h2-leading: 1.15;
  --type-h2-tracking: -0.03em;
  --type-h3-lg-size: var(--text-f-2xl);
  --type-h3-lg-leading: 1.25;
  --type-h3-lg-tracking: -0.02em;
  --type-h3-size: var(--text-f-xl);
  --type-h3-leading: 1.3;
  --type-h3-tracking: -0.01em;
  --type-box-title-leading: 1.3;
  --type-lead-size: var(--text-f-xl);
  --type-lead-leading: 1.55;
  --type-figure-size: var(--text-f-5xl);

  /* --- Stil: Form --- */
  --style-radius-pill: 2px;
  --style-radius-dot: 0px;
  --line-weight: 1px;
  --line-weight-strong: 2px;
  --style-shadow-xs: 0 0 0 0 transparent;
  --style-shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.4);
  --style-shadow-md: 0 2px 4px 0 oklch(0 0 0 / 0.4), 0 12px 32px -8px oklch(0 0 0 / 0.6);

  /* --- Stil: Kachel (Kante statt Fläche) --- */
  --tile-bg: transparent;
  --tile-fg: var(--foreground);
  --tile-padding: 1.5rem;
  --tile-border-width: 1px;
  --tile-border-color: var(--border);
  --tile-shadow: none;
  --tile-hover-shadow: none;

  /* --- Stil: Bewegung (Fallblattanzeige) --- */
  --board-row-animation: board-flip 420ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
  --board-row-stagger: 90ms;
}

/* Flächenrollen → Flächenarten */
:root[data-style="leitstand"] :is(.surface-highlight, .tile-featured) {
  @apply surface-brand;
}
:root[data-style="leitstand"] .surface-header {
  @apply surface-plain;
  border-bottom: var(--line-weight) solid var(--border);
}
:root[data-style="leitstand"] .surface-footer {
  @apply surface-ink;
}
:root[data-style="leitstand"] .surface-board {
  @apply surface-ink;
  border: var(--line-weight) solid var(--ink-border);
}
```

- [ ] **Step 6: Bauen, statisch und im Browser prüfen**

```bash
npx nuxt build    # danach Server auf 3100 neu starten
node scripts/check-styles.mjs --url http://localhost:3100
```

Expected: `ok      leitstand: …`, `leitstand: 36/36 Kontraste bestehen`.

- [ ] **Step 7: Screenshots ansehen und bewerten**

```bash
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/leitstand http://localhost:3100$url --style leitstand; done
```

Expected: `Stil: leitstand`, `Überlauf: nein`, Fonts enthalten `IBM Plex Mono 600` und `IBM Plex Sans Variable`. Ansehen: alle drei Seiten bei 360 und 1280. Prüfliste:
  1. Kein heller Rest: keine weiße Karte, kein heller Chip, kein heller Outline-Button (`dark:`-Varianten greifen, weil `.dark` gesetzt ist). Hellen Rest über Tokens beheben, nicht im Template.
  2. Der lange Jobtitel bricht bei 360 px mit Trennstrich, ohne Überlauf. Sonst `--type-h1-page-size: var(--text-f-3xl);`
  3. Primär-Button Bernstein mit dunkler Schrift – auch in Kopfzeile, Kasten „Auf einen Blick“ und mobiler Leiste.
  4. Die Fotos wirken auf dunklem Grund nicht ausgefressen; die Innenkante (`ring-foreground/10`) ist sichtbar, aber leise.
  5. Tafel eine Stufe dunkler als der Grund, mit Haarlinie; Top-Job-Kachel eine Stufe heller.
  6. Fokusring (hell) ist auf Grund, Karte und Hervorhebung sichtbar – an `start-1280-fold.png` nicht prüfbar, deshalb über die Messwerte aus Step 3 („ring/50“) belegen.
Geprüfte shadcn-Komponenten in Abschnitt 7 des Konzepts eintragen.

- [ ] **Step 8: Kursbuch-Gegenprobe und Checkpoint**

```bash
node scripts/screenshot.mjs .shots/leitstand-gegenprobe http://localhost:3100/ 1280
node scripts/compare-shots.mjs .shots/leitstand-gegenprobe .shots/vorher --tolerance <N aus Task 1>
grep -c "<" app/styles/leitstand/konzept.md
```

Expected: Kursbuch „gleich“ (insbesondere: die Klasse `dark` sitzt nicht versehentlich dauerhaft auf `<html>`), `grep` meldet 0.

---

### Task 9: Preset „Editorial“

**Files:**
- Create: `app/styles/editorial/konzept.md`, `app/styles/editorial/style.css`
- Modify: `app/styles/presets.json`, `scripts/style-recipes.mjs`, `app/assets/css/tailwind.css`, `package.json` (über Yarn)

**Interfaces:**
- Consumes: Vertrag aus Task 2, `brandKind`. Textschrift Source Sans 3 ist bereits installiert.
- Produces: Preset-ID `editorial`.

- [ ] **Step 1: Schrift installieren und einbinden**

```bash
yarn add @fontsource-variable/source-serif-4
grep -E "font-family" node_modules/@fontsource-variable/source-serif-4/opsz.css | sort -u
```

Expected: `'Source Serif 4 Variable'`. In `tailwind.css`:

```css
@import "@fontsource-variable/source-serif-4/opsz.css";        /* Editorial: Display mit optischer Größe; bewusst keine Kursiven */
```

und bei den Presets: `@import "../../styles/editorial/style.css";`

- [ ] **Step 2: Registry und Rezept**

`presets.json`:

```json
  {
    "id": "editorial",
    "label": "Editorial",
    "description": "Papier und Serif: Haarlinien gliedern, eine einzige Druckfarbe (Ochsenblut), keine Schatten.",
    "defaults": { "brand": "#8c1c2b", "signal": "#8c1c2b", "radius": 0.125 }
  }
```

`scripts/style-recipes.mjs` (Neutrale mit festem kühlen Hue 250 – „kaltes Papier“):

```js
  editorial(ctx) {
    const { brand, signal, clampLum } = ctx
    const signalOnDark = clampLum(signal, { min: 0.19 })
    return {
      surfaces: ['background', 'card', 'secondary', 'muted', 'accent'],
      kinds: ['ink', 'brand'],
      t: {
        'background': [0.975, 0.003, 250],
        'card': [0.995, 0.002, 250],
        'secondary': [0.945, 0.004, 250],
        'muted': [0.955, 0.004, 250],
        'accent': [0.94, 0.005, 250],
        'foreground': [0.2, 0.01, 250],
        'muted-foreground': [0.45, 0.01, 250],
        'primary': clampLum(brand, { max: 0.13 }),
        'primary-foreground': [0.985, 0.003, 250],
        'border': [0.86, 0.004, 250],
        'input': [0.58, 0.008, 250],
        'ring': [0.2, 0.01, 250],
        'destructive': [0.5, 0.13, 60],
        'signal': clampLum(signal, { max: 0.22 }),
        'signal-on-dark': signalOnDark,
        'signal-on-brand': signalOnDark,
        'ink': [0.2, 0.01, 250],
        'ink-foreground': [0.975, 0.003, 250],
        'ink-muted': [0.8, 0.006, 250],
        'ink-border': [0.36, 0.008, 250],
        'ink-action': [0.995, 0.002, 250],
        'ink-action-foreground': [0.2, 0.01, 250],
        ...brandKind(ctx),
      },
    }
  },
```

- [ ] **Step 3: Rechnen**

```bash
node scripts/contrast.mjs --style editorial | tee .shots/contrast-editorial.txt
```

Expected: „Alle Pflicht-Paare bestanden.“ Erwartbarer Problemfall: „signal als Grafik auf brand“ – Signal und Brand sind dieselbe Farbe; `signal-on-dark` hellt das Signal dort auf. Reicht das nicht für 3:1, in Rezept und CSS `--signal-on-brand` auf die helle Textfarbe der Markenfläche setzen (`var(--brand-foreground)` bzw. `t['brand-foreground']`) und im Konzept vermerken.

- [ ] **Step 4: `app/styles/editorial/konzept.md` schreiben**

```markdown
# Stil-Preset „Editorial“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Gedrucktes Heft: Papier, Serif-Überschriften, Haarlinien als Gliederung, eine einzige Druckfarbe. **Signatur:** die 2-px-Linie über jedem Teaser und über der Tafel – Stellen lesen sich wie Artikelanrisse. **Bewusste Nähe zu Reflex-Look (c)** „Zeitungslayout mit Haarlinien“ – als Stilstudie gekennzeichnet. Abgesetzt von (a): kaltes Papier (Hue 250) statt Creme, Ochsenblut statt Terrakotta; keine kursive Serif-Headline (1.8).

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#8c1c2b` | die eine Druckfarbe: Aktion, Links, Icons, Hervorhebungsfläche |
| Signal | `#8c1c2b` | identisch – es gibt keine zweite Farbe |
Neutrale mit festem kühlen Farbton (Hue 250, Chroma ≤ 0.01). Weil die Aktionsfarbe rot ist, liegt `--destructive` bei Hue 60 (Braunorange) und Fehler tragen immer Icon und Text (Research 1.3.7).

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style editorial` – Ausgabe vom <Datum>:

<Zeilen „ok/FAIL …“ aus .shots/contrast-editorial.txt hier als Codeblock einfügen>

**Verboten:** <durchgefallene VERBOTEN-Zeilen; Entscheidung zu --signal-on-brand aus Step 3>

## 4 Typografie
Display Source Serif 4 (variabel, optische Größe, 600, aufrecht – keine Kursiven geladen), Text Source Sans 3. Beide stammen aus derselben Schriftsippe: verwandte Haltung, Kontrast in der Rolle. Kennzahlen in Serif mit Tabellenziffern. Test bei 360 px: <Ergebnis aus Step 7>.

## 5 Form, Flächen, Kachel
Radius 2 px, Linien 1 px, Signaturlinie 2 px, kein Schatten außer an Overlays. Flächenrollen: Kopfzeile = hell mit Haarlinie; Tafel = hell, oben und unten eine 2-px-Linie, keine Rundung; Hervorhebung = Marke (die eine farbige Fläche der Seite); Fußzeile = Dunkel. Kachel: **keine Fläche** – 2-px-Linie in Textfarbe oben, darunter der Inhalt; Top-Job mit Linie in Ochsenblut; Hover färbt die Linie.

## 6 Bewegung
Nur die H1 blendet ein. Die Tafel steht sofort.

## 7 Offene Punkte
<Auffälligkeiten aus den Screenshots>
```

- [ ] **Step 5: `app/styles/editorial/style.css` schreiben**

```css
/*
  PRESET "Editorial" – Konzept: app/styles/editorial/konzept.md
  Eine Druckfarbe: Brand und Signal sind dieselbe Eingabe. Neutrale mit festem kühlen Farbton ("kaltes Papier").
  Nachrechnen: node scripts/contrast.mjs --style editorial
*/
:root[data-style="editorial"] {
  /* --- Eingaben --- */
  --theme-brand: #8c1c2b;
  --theme-signal: #8c1c2b;
  --theme-card: oklch(0.995 0.002 250);
  --radius: 0.125rem;

  --primary: color(from var(--theme-brand) xyz-d65 calc(x * min(1, 0.13 / y)) calc(y * min(1, 0.13 / y)) calc(z * min(1, 0.13 / y)));
  --signal: color(from var(--theme-signal) xyz-d65 calc(x * min(1, 0.22 / y)) calc(y * min(1, 0.22 / y)) calc(z * min(1, 0.22 / y)));
  --signal-on-dark: color(from var(--theme-signal) xyz-d65 calc(x * max(1, 0.19 / y)) calc(y * max(1, 0.19 / y)) calc(z * max(1, 0.19 / y)));
  --signal-on-brand: var(--signal-on-dark);

  /* --- Neutrale: kaltes Papier, fester Farbton 250 --- */
  --background: oklch(0.975 0.003 250);
  --foreground: oklch(0.2 0.01 250);
  --primary-foreground: oklch(0.985 0.003 250);
  --secondary: oklch(0.945 0.004 250);
  --muted: oklch(0.955 0.004 250);
  --muted-foreground: oklch(0.45 0.01 250);
  --accent: oklch(0.94 0.005 250);
  --destructive: oklch(0.5 0.13 60);                               /* Braunorange: die Aktionsfarbe ist schon rot */
  --border: oklch(0.86 0.004 250);
  --input: oklch(0.58 0.008 250);
  --ring: oklch(0.2 0.01 250);

  /* --- Flächenart "ink": Druckerschwarz --- */
  --ink: oklch(0.2 0.01 250);
  --ink-foreground: oklch(0.975 0.003 250);
  --ink-muted: oklch(0.8 0.006 250);
  --ink-border: oklch(0.36 0.008 250);
  --ink-action: oklch(0.995 0.002 250);
  --ink-action-foreground: oklch(0.2 0.01 250);

  /* --- Flächenart "brand": Schalter wie in Kursbuch --- */
  --brand-foreground: oklch(from var(--theme-brand) calc(0.22 + 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.004 h);
  --brand-muted: oklch(from var(--theme-brand) calc(0.32 + 0.54 * clamp(0, (0.6 - l) * 1000, 1)) 0.04 h);
  --brand-border: oklch(from var(--theme-brand) calc(l - 0.115 + 0.23 * clamp(0, (0.6 - l) * 1000, 1)) calc(c * 0.85) h);
  --brand-action: oklch(from var(--theme-brand) calc(0.22 + 0.775 * clamp(0, (0.6 - l) * 1000, 1)) 0.002 h);
  --brand-action-foreground: oklch(from var(--theme-brand) calc(0.985 - 0.765 * clamp(0, (0.6 - l) * 1000, 1)) 0.01 h);

  /* --- Stil: Schrift --- */
  --style-font-sans: 'Source Sans 3 Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --style-font-heading: 'Source Serif 4 Variable', Georgia, 'Times New Roman', serif;
  --style-font-figure: 'Source Serif 4 Variable', Georgia, 'Times New Roman', serif;
  --heading-weight: 600;
  --heading-stretch: normal;
  --heading-transform: none;
  --figure-weight: 600;
  --board-weight: 500;

  /* --- Stil: Typo-Rollen --- */
  --type-h1-size: var(--text-f-7xl);
  --type-h1-leading: 1.06;
  --type-h1-tracking: -0.015em;
  --type-h1-page-size: var(--text-f-6xl);
  --type-h1-page-leading: 1.08;
  --type-h1-page-tracking: -0.015em;
  --type-h2-size: var(--text-f-5xl);
  --type-h2-leading: 1.12;
  --type-h2-tracking: -0.01em;
  --type-h3-lg-size: var(--text-f-3xl);
  --type-h3-lg-leading: 1.2;
  --type-h3-lg-tracking: -0.005em;
  --type-h3-size: var(--text-f-2xl);
  --type-h3-leading: 1.25;
  --type-h3-tracking: 0em;
  --type-box-title-leading: 1.25;
  --type-lead-size: var(--text-f-xl);
  --type-lead-leading: 1.55;
  --type-figure-size: var(--text-f-6xl);

  /* --- Stil: Form --- */
  --style-radius-pill: 2px;
  --style-radius-dot: 9999px;
  --line-weight: 1px;
  --line-weight-strong: 2px;
  --style-shadow-xs: 0 0 0 0 transparent;
  --style-shadow-sm: 0 0 0 0 transparent;
  --style-shadow-md: 0 8px 24px -6px oklch(0.2 0.01 250 / 0.18);   /* nur Overlays und Skip-Link */

  /* --- Stil: Kachel (keine Fläche: Linie oben, Inhalt darunter) --- */
  --tile-bg: transparent;
  --tile-fg: var(--foreground);
  --tile-padding: 1.25rem 0 0;
  --tile-border-width: 2px 0 0;
  --tile-border-color: var(--foreground);
  --tile-shadow: none;
  --tile-hover-shadow: none;

  /* --- Stil: Bewegung (die Tafel steht sofort) --- */
  --board-row-animation: none;
  --board-row-stagger: 0ms;
}

/* Flächenrollen → Flächenarten */
:root[data-style="editorial"] .surface-highlight {
  @apply surface-brand;
}
:root[data-style="editorial"] .surface-footer {
  @apply surface-ink;
}
:root[data-style="editorial"] .surface-header {
  @apply surface-plain;
  border-bottom: var(--line-weight) solid var(--border);
}
:root[data-style="editorial"] .surface-board {
  @apply surface-plain;
  background-color: transparent;
  border-block: var(--line-weight-strong) solid var(--foreground);
  border-radius: 0;
}
/* Top-Job: keine eigene Fläche, nur die Linie in der Druckfarbe */
:root[data-style="editorial"] .tile-featured {
  border-top-color: var(--primary);
}
/* Kacheln ohne Fläche brauchen keine Rundung */
:root[data-style="editorial"] .tile {
  border-radius: 0;
}
```

- [ ] **Step 6: Bauen, statisch und im Browser prüfen**

```bash
npx nuxt build    # danach Server auf 3100 neu starten
node scripts/check-styles.mjs --url http://localhost:3100
```

Expected: `ok      editorial: …`, `editorial: 36/36 Kontraste bestehen`, am Ende `Alle Presets in Ordnung.` (alle fünf).

- [ ] **Step 7: Screenshots ansehen und bewerten**

```bash
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/editorial http://localhost:3100$url --style editorial; done
```

Expected: `Stil: editorial`, `Überlauf: nein`, Fonts enthalten `Source Serif 4 Variable` und `Source Sans 3 Variable`. Ansehen: alle drei Seiten bei 360 und 1280. Prüfliste:
  1. Kacheln: Linie oben, Inhalt bündig mit der Linie (kein seitlicher Innenabstand), Fußzeile der Kachel sauber. Im Raster stehen die Linien auf einer Höhe.
  2. Top-Job-Linie in Ochsenblut; das Badge bleibt lesbar.
  3. Tafel ohne Kasten, oben und unten eine 2-px-Linie; „sofort“-Punkt in der Druckfarbe.
  4. Genau **eine** farbige Fläche im Seitenkörper (Regel-Sektion); Kasten „Auf einen Blick“ auf der Detailseite ebenfalls Ochsenblut mit hellem Button.
  5. Keine Kursiven, keine Schatten an ruhendem Inhalt.
  6. Filterchips: fast eckig (2 px), aktiver Chip in der Druckfarbe.

- [ ] **Step 8: Kursbuch-Gegenprobe und Checkpoint**

```bash
node scripts/screenshot.mjs .shots/editorial-gegenprobe http://localhost:3100/ 1280
node scripts/compare-shots.mjs .shots/editorial-gegenprobe .shots/vorher --tolerance <N aus Task 1>
grep -c "<" app/styles/editorial/konzept.md
```

Expected: Kursbuch „gleich“, `grep` meldet 0.

---

### Task 10: Dokumentation und Abnahme

**Files:**
- Modify: `docs/design-konzept.md` (neuer Abschnitt 13, Korrekturen in 3, 6, 8, 12)
- Delete: `.shots/`

**Interfaces:**
- Consumes: alle vorherigen Aufgaben.

- [ ] **Step 1: `docs/design-konzept.md` aktualisieren**

Im Kopf den Stand ergänzen („… dritte Fassung: Stil-Presets, siehe Abschnitt 13“). In Abschnitt 3 („Theme: drei Eingaben …“) die Ortsangaben korrigieren: Die Eingaben und Ableitungen stehen jetzt in `app/styles/kursbuch/style.css`, nicht mehr im `:root`-Block von `tailwind.css`; `contrast.mjs` wird mit `--style kursbuch` aufgerufen. In Abschnitt 6 die Tabelle um den Satz ergänzen: „Templates benutzen nur noch Flächen**rollen** (`surface-header`, `surface-footer`, `surface-board`, `surface-highlight`, `tile-featured`); in Kursbuch stehen dahinter die Flächenarten `brand` bzw. `ink`.“ In Abschnitt 8 unter „Geänderte Dateien unter `app/components/ui/`“: „`badge/index.ts`: `rounded-full` → `rounded-pill`, damit das Stil-Preset die Badge-Form bestimmt.“ In Abschnitt 12 den Punkt „Nicht geprüft … der `.dark`-Block“ ergänzen um: „Das dunkle Preset Leitstand benutzt den `.dark`-Block nicht, sondern eigene Tokens.“

Neuen Abschnitt anhängen:

```markdown
## 13 Stil-Presets

Die Seite hat fünf umschaltbare Stile: **Kursbuch** (dieses Dokument), **Plakat**, **Weich**, **Leitstand**, **Editorial**. Daten, Texte, Fotos, Sektionen und Markup sind in allen gleich – nur das Aussehen wechselt. Spec: `docs/superpowers/specs/2026-09-20-stil-presets-design.md`.

**Bewusste Abweichung von der Research (2.1):** Ein Stil wird dort aus dem Gegenstand abgeleitet. Das gilt nur für Kursbuch; die anderen vier sind Stilstudien über demselben Gegenstand. Alle prüfbaren Regeln (Kontraste, Schriftrollen, Anti-Patterns, reduzierte Bewegung) gelten für jedes Preset und sind in dessen `konzept.md` nachgewiesen.

**Aufbau:** `data-style="<id>"` auf `<html>` (Standard in `nuxt.config.ts`, im Dev-Modus über den Themer). `app/styles/contract.css` enthält die Rollen, die die Templates benutzen – Flächenarten (`surface-ink`, `surface-brand`, `surface-plain`), Typo-Rollen (`type-*`), `.tile`, `.board-row`. `app/styles/<id>/style.css` liefert alle Werte und ordnet die Flächenrollen einer Flächenart zu. **Kein Preset erbt von einem anderen:** Jedes definiert den gesamten Variablensatz.

**In Templates gilt:** keine festen Stilwerte. Überschriften über `type-*`, Linien über `border-*-(length:--line-weight)`, Punkte `rounded-dot`, Chips/Badges `rounded-pill`, Karten `tile`, farbige oder dunkle Flächen nur über die Flächenrollen.

**Ein neues Preset anlegen:**
1. Eintrag in `app/styles/presets.json` (ID, Name, eine Zeile Beschreibung, Standardfarben, Radius, ggf. `"dark": true`).
2. Rezept in `scripts/style-recipes.mjs`, dann `node scripts/contrast.mjs --style <id>` – erst rechnen.
3. `app/styles/<id>/konzept.md` schreiben (Haltung, Signatur, Farbe mit Nachweis, Typografie, Form/Flächen/Kachel, Bewegung).
4. `app/styles/<id>/style.css`: `kursbuch/style.css` als Liste der nötigen Variablen nehmen, **alle** Werte neu setzen, Flächenrollen zuordnen. Schriften über fontsource installieren und in `tailwind.css` importieren, Preset-Datei dort importieren.
5. `node scripts/check-styles.mjs --url http://localhost:3100` (Vollständigkeit + Messung im Browser), Screenshots mit `node scripts/screenshot.mjs <ordner> <url> --style <id>` bei 360/768/1280/1536 px ansehen.

**Späterer Ausbau:** Ein Preset-Ordner kann `components/` mit Varianten einzelner Bausteine bekommen (anderes Markup), und für Kundenprojekte kann ein einzelnes Preset zur Build-Zeit importiert werden – dann mit eigenem Inhalt und wieder vollständig nach Methode 2.1.

| Preset | Schrift | Form | Kachel | Tafel | Konzept |
|---|---|---|---|---|---|
| Kursbuch | Barlow Semi Condensed / Source Sans 3 | Radius 8, Linien 1 px | Farbfläche | dunkel, Fallblatt | dieses Dokument |
| Plakat | Archivo (schmal, Versalien) | Radius 0, Linien 3 px | weiße Fläche mit Kante | heller Kasten, Kopf invertiert | `app/styles/plakat/konzept.md` |
| Weich | Bricolage Grotesque / Figtree | Radius 16 | Schatten | helle Karte | `app/styles/weich/konzept.md` |
| Leitstand | IBM Plex Mono / Sans | Radius 2, Haarlinien, dunkel | Kante | dunkel, Fallblatt | `app/styles/leitstand/konzept.md` |
| Editorial | Source Serif 4 / Source Sans 3 | Radius 2, Haarlinien | Linie oben | Linien oben und unten | `app/styles/editorial/konzept.md` |
```

Die Tabellenwerte nach den Entscheidungen aus Task 6–9 korrigieren (z. B. Weich-Radius, falls gesenkt).

- [ ] **Step 2: Gesamtabnahme**

```bash
node --test scripts/tests/
npx nuxt typecheck
npx nuxt build    # Server auf 3100 neu starten
node scripts/check-styles.mjs --url http://localhost:3100
for id in kursbuch plakat weich leitstand editorial; do node scripts/contrast.mjs --style $id | tail -1; done
grep -rn "fonts.googleapis\|fonts.gstatic" app .output/public/_nuxt/*.css | head
for url in / /jobs /jobs/ausbildung-fachinformatiker-anwendungsentwicklung; do node scripts/screenshot.mjs .shots/final http://localhost:3100$url; done
node scripts/compare-shots.mjs .shots/vorher .shots/final --tolerance <N aus Task 1>
```

Expected: Tests, Typecheck, Build grün; `Alle Presets in Ordnung.`; fünfmal „Alle Pflicht-Paare bestanden.“; kein Treffer für Google Fonts; Kursbuch deckungsgleich mit dem Stand vor dem Umbau.

- [ ] **Step 3: Aufräumen und Übergabe**

`.shots/` löschen und den Server auf Port 3100 beenden. Dem Nutzer mitteilen: (1) Nach den Font-Installationen muss der eigene Dev-Server neu gestartet werden (sonst „504 Outdated Optimize Dep“, Seite nicht klickbar). (2) Presets im Themer unter „Stil“ oder per `?style=<id>`. (3) Offene Punkte aus den Abschnitten 7 der vier Konzepte gesammelt nennen.








