// Kontrast- und Gamut-Nachweis für ein Stil-Preset (Methode: docs/design-research.md, Kapitel 2.3)
// Aufruf: node scripts/contrast.mjs                                  -> Kursbuch mit seinen Standardfarben
//         node scripts/contrast.mjs --style plakat                   -> ein anderes Preset
//         node scripts/contrast.mjs --style weich "#0b5d3b" "#ff7a00" -> Preset mit anderen Eingaben (Brand, Signal)
// Die Rezepte stehen in scripts/style-recipes.mjs und spiegeln app/styles/<id>/style.css.
import { readFileSync } from 'node:fs'
import { recipes } from './style-recipes.mjs'
const enc = x => x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
const dec = x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
const clamp = v => Math.min(1, Math.max(0, v))
function lin([L, C, h]) { // OKLCH -> lineares sRGB
  const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}
const inGamut = c => lin(c).every(v => v >= -0.0005 && v <= 1.0005)
const hex = c => '#' + lin(c).map(v => Math.round(enc(clamp(v)) * 255).toString(16).padStart(2, '0')).join('')
const lum = c => { const [r, g, b] = lin(c).map(clamp); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
function hex2oklch(h) {
  return rgb2oklch([1, 3, 5].map(i => dec(parseInt(h.slice(i, i + 2), 16) / 255)))
}
function rgb2oklch([r, g, b]) { // lineares sRGB -> OKLCH
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), (Math.atan2(B, A) * 180 / Math.PI + 360) % 360]
}
// Luminanz-Klemme wie im CSS: lineares Licht mit einem Faktor skalieren (= XYZ skalieren), Farbton bleibt
const clampLum = (c, { max = Infinity, min = 0 }) => {
  const y = lum(c)
  const k = y > max ? max / y : y < min && y > 0 ? min / y : 1
  return k === 1 ? c : rgb2oklch(lin(c).map(v => clamp(v * k)))
}
function mix(fg, bg, alpha) { // fg mit Alpha über bg, wie der Browser (gamma-sRGB)
  const f = lin(fg).map(v => enc(clamp(v))), g = lin(bg).map(v => enc(clamp(v)))
  return hex2oklch('#' + f.map((v, i) => Math.round((v * alpha + g[i] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join(''))
}

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
