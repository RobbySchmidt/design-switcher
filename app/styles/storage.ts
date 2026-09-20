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
