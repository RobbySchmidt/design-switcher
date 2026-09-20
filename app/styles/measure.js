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
