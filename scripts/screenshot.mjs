// Screenshots per Chrome DevTools Protocol mit echter Viewport-Emulation (auch < 500 px) + Überlauf-Prüfung.
// Aufruf: node scripts/screenshot.mjs <ausgabeordner> <url> [breite ...] [--style <id>]      (Standardbreiten: 360 768 1280 1536)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, openPage, sleep } from './lib/cdp.mjs'

const args = process.argv.slice(2)
const styleIndex = args.indexOf('--style')
const styleId = styleIndex >= 0 ? args.splice(styleIndex, 2)[1] ?? null : null
const [outDir, url, ...widthArgs] = args
if (!outDir || !url) {
  console.error('Aufruf: node scripts/screenshot.mjs <ausgabeordner> <url> [breite ...] [--style <id>]')
  process.exit(1)
}
// Ein fehlender Wert hinter --style wurde früher still ignoriert: Die Aufnahme lief dann im Standard-Preset,
// landete aber im Ordner des gewünschten. Deshalb hier abbrechen statt weiterlaufen.
if (styleIndex >= 0 && !styleId) {
  console.error('--style braucht einen Wert, z. B. --style kursbuch')
  process.exit(1)
}
const widths = widthArgs.length ? widthArgs.map(Number) : [360, 768, 1280, 1536]
// --style setzt das Preset nach dem Laden direkt auf <html> – funktioniert auch am gebauten Server ohne Themer
const preset = styleId && JSON.parse(readFileSync(new URL('../app/styles/presets.json', import.meta.url), 'utf8')).find(item => item.id === styleId)
if (styleId && !preset) {
  console.error(`Unbekannter Stil "${styleId}"`)
  process.exit(1)
}

const browser = await launchBrowser()
try {
  mkdirSync(outDir, { recursive: true })
  const name = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'start'

  for (const width of widths) {
    const { cdp, evaluate } = await openPage(browser.port, { url, width })
    // Immer auf die Schriften warten – auch ohne --style. Seit die Datei die @font-face-Regeln ALLER Presets
    // enthält, ist der Ladezeitpunkt der Schriften nicht mehr stabil; ohne Warten entstehen nicht
    // reproduzierbare Aufnahmen (mal Fallback-, mal Zielschrift). Zweimal `fonts.ready` mit Pause dazwischen,
    // weil das erste Versprechen schon erfüllt sein kann, bevor der Nachzügler überhaupt angefordert wurde.
    await evaluate('(async () => { await document.fonts.ready; await new Promise(r => setTimeout(r, 300)); await document.fonts.ready })()')
    if (preset) {
      await evaluate(`(async () => { const e = document.documentElement; e.setAttribute('data-style', ${JSON.stringify(preset.id)}); e.classList.toggle('dark', ${!!preset.dark}); await document.fonts.ready; await new Promise(r => setTimeout(r, 800)); await document.fonts.ready })()`)
    }
    // Lazy-Bilder laden: einmal durchscrollen. `behavior: 'instant'` ist nötig, weil tailwind.css
    // auf <html> `scroll-smooth` setzt – mit dem Default (smooth) läuft die Seite beim Zurückspringen
    // auf 0 noch, während schon fotografiert wird, was Tafel/Fließtext sichtbar verrutschen lässt.
    const scrolledBackTo = await evaluate(`(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo({ top: y, left: 0, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)) } scrollTo({ top: 0, left: 0, behavior: 'instant' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return scrollY })()`)
    // Steht die Seite nicht wieder ganz oben, ist das Bild gegenüber der Baseline verschoben – melden statt still fotografieren.
    if (scrolledBackTo !== 0)
      console.warn(`WARNUNG ${width}px: Seite steht nach dem Durchscrollen bei scrollY ${scrolledBackTo} statt 0 – Aufnahme vermutlich verrutscht.`)
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
