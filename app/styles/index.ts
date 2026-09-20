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
