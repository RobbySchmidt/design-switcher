// Gemeinsamer Unterbau für screenshot.mjs und check-styles.mjs: Browser starten, per CDP verbinden, Seite öffnen.
// Braucht nur Node >= 22 (WebSocket, fetch) und einen installierten Edge oder Chrome.
import { spawn } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function launchBrowser() {
  // ?? '' statt undefined: Sonst enthielte der Pfad den Text "undefined" und existsSync liefe ins Leere
  const localAppData = process.env.LOCALAPPDATA ?? ''
  const candidates = [
    { exe: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', hyphenData: `${localAppData}/Microsoft/Edge/User Data/hyphen-data` },
    { exe: 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', hyphenData: `${localAppData}/Microsoft/Edge/User Data/hyphen-data` },
    { exe: 'C:/Program Files/Google/Chrome/Application/chrome.exe', hyphenData: `${localAppData}/Google/Chrome/User Data/hyphen-data` },
  ].find(c => existsSync(c.exe))
  if (!candidates)
    throw new Error('Kein Edge/Chrome gefunden')

  const profile = mkdtempSync(join(tmpdir(), 'cdp-shot-'))
  // Silbentrennung wie bei echten Nutzern: Chromium liefert die Trennwörterbücher (auch Deutsch) als
  // Nachlade-Komponente in <User Data>/hyphen-data aus. Ein frisches --user-data-dir hat diese Komponente
  // nicht, wodurch `hyphens: auto` in unseren Screenshots lautlos wirkungslos bleibt – echte Browser mit
  // bereits installierter Komponente trennen dagegen. Wörterbücher aus dem echten, installierten Profil
  // nur lesend hierher kopieren (nur der Wörterbuch-Ordner, sonst nichts aus dem Profil); fehlt die
  // Komponente oder schlägt das Kopieren fehl, läuft der Screenshot einfach ohne Trennung weiter.
  try {
    if (existsSync(candidates.hyphenData))
      cpSync(candidates.hyphenData, join(profile, 'hyphen-data'), { recursive: true })
  }
  catch {
    // kein Wörterbuch verfügbar – kein Problem, dann eben ohne Silbentrennung
  }

  const port = 9300 + Math.floor(Math.random() * 500)
  const proc = spawn(candidates.exe, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: 'ignore' })

  for (let i = 0; i < 50; i++) {
    try {
      await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
      return {
        port,
        close: () => {
          proc.kill()
          // Temp-Profil (inkl. kopierter Wörterbücher) wieder aufräumen – der Browserprozess hält die Dateien
          // manchmal noch einen Moment gesperrt, deshalb Fehler hier einfach ignorieren.
          try {
            rmSync(profile, { recursive: true, force: true })
          }
          catch {
            // Profil bleibt liegen, kein Problem – kein Blocker für den Screenshot-Lauf
          }
        },
      }
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
