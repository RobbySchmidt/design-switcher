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
// Alle statischen Prüfungen laufen auf dem kommentarfreien Text: Die Regeln unten lesen die Datei zeilenweise,
// deshalb würden eine auskommentierte Deklaration (`/* --foo: … */`) als Vertragsvariable und ein Wort wie
// "#facade" in einem Kommentar als Hex-Farbe gelten – beides Fehlalarme.
const withoutComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '')
const variablesOf = css => new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(match => match[1]))

// Die Preset-Dateien sind ungeschachtelt: ein Schnitt an "}" ergibt je Regel den Selektor vor "{" und den Rumpf dahinter.
const rulesOf = css => css.split('}').map((chunk) => {
  const brace = chunk.indexOf('{')
  return brace < 0 ? null : { selector: chunk.slice(0, brace), body: chunk.slice(brace + 1) }
}).filter(Boolean)
const KINDS = ['surface-ink', 'surface-brand', 'surface-plain']

// Der Vertrag ist der Token-Block auf :root, nicht die ganze Datei: Eine Regel für eine Flächenrolle darf eine
// gescopte Variable setzen (Editorial überschreibt in der Tafel --surface-bg), ohne dass das eine neue
// Vertragsvariable wäre. Verglichen wird deshalb nur der Rumpf von :root[data-style="<id>"].
const tokenBlockOf = (css, id) => {
  const block = rulesOf(css).find(rule => rule.selector.trim() === `:root[data-style="${id}"]`)
  return block ? block.body : ''
}

const files = {}
for (const preset of presets) {
  const file = new URL(`${preset.id}/style.css`, root)
  if (!existsSync(file)) { problem(`${preset.id}: app/styles/${preset.id}/style.css fehlt`); continue }
  const raw = readFileSync(file, 'utf8')
  files[preset.id] = { raw, css: withoutComments(raw) }
}
const reference = variablesOf(tokenBlockOf(files.kursbuch?.css ?? '', 'kursbuch'))
for (const [id, { raw, css }] of Object.entries(files)) {
  const own = variablesOf(tokenBlockOf(css, id))
  const missing = [...reference].filter(name => !own.has(name))
  const extra = [...own].filter(name => !reference.has(name))
  if (missing.length) problem(`${id}: Variablen fehlen: ${missing.join(', ')}`)
  if (extra.length) problem(`${id}: Variablen, die Kursbuch nicht kennt (Vertrag erweitert? Dann in ALLEN Presets ergänzen): ${extra.join(', ')}`)
  if (!rulesOf(css).some(rule => rule.selector.trim() === `:root[data-style="${id}"]`))
    problem(`${id}: Block :root[data-style="${id}"] fehlt`)

  // Rollenprüfung: Es genügt nicht, dass der Name irgendwo in der Datei steht – es muss eine Regel geben, die
  // die Rolle anspricht UND ihr eine Flächenart zuweist. Ausnahme: Ein Preset darf eine Rolle bewusst ohne
  // Flächenart lassen (Editorial: die Top-Job-Kachel wechselt nur die Linienfarbe). Das muss es in einem
  // Kommentar mit "rolle-ohne-flaeche: <rolle>" erklären – dann reicht, dass die Rolle überhaupt vorkommt.
  const rules = rulesOf(css)
  const before = problems
  for (const role of ROLES) {
    const mentioned = rules.filter(rule => rule.selector.includes(`.${role}`))
    const assigned = mentioned.some(rule => KINDS.some(kind => rule.body.includes(`@apply ${kind}`)))
    if (assigned) continue
    if (raw.includes(`rolle-ohne-flaeche: ${role}`)) {
      if (!mentioned.length) problem(`${id}: Flächenrolle .${role} ist als "rolle-ohne-flaeche" vermerkt, kommt aber in keiner Regel vor`)
      continue
    }
    problem(mentioned.length
      ? `${id}: Flächenrolle .${role} bekommt keine Flächenart (@apply surface-ink|surface-brand|surface-plain fehlt). Absicht? Dann im Kommentar "rolle-ohne-flaeche: ${role}" vermerken.`
      : `${id}: Flächenrolle .${role} ist nicht zugeordnet`)
  }
  const rolesOk = problems === before

  if (/#[0-9a-f]{3,8}\b/i.test(css.replace(/--theme-(brand|signal|card):\s*#[0-9a-f]{6}/gi, '')))
    problem(`${id}: Hex-Farbe außerhalb der Eingaben --theme-* gefunden`)
  if (!missing.length && !extra.length && rolesOk) console.log(`ok      ${id}: ${own.size} Variablen, alle Rollen zugeordnet`)
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
