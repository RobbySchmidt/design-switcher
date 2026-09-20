// Token-Rezepte je Stil-Preset für scripts/contrast.mjs. Jedes Rezept MUSS dieselben L/C-Werte tragen wie
// app/styles/<id>/style.css – und zwar VON HAND: Es gibt keinen automatischen Abgleich zwischen Rezept und CSS.
// Wer hier einen Wert ändert, ändert ihn auch dort (und umgekehrt) und rechnet das konzept.md neu.
// scripts/check-styles.mjs --url misst davon unabhängig die echten Kontraste im Browser: Das fängt zu schwache
// Paare ab, aber NICHT eine Abweichung zwischen diesem Rezept und der CSS-Datei.
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
        // Auf dem dunklen Grün erreicht die Eingabe nur 2.25:1; aufgehellt auf L 0.75, Chroma auf 0.14 gesenkt (sRGB-Grenze)
        'signal-on-brand': [0.75, 0.14, signal[2]],
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
  editorial(ctx) {
    const { brand, signal, H, F, clampLum } = ctx
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
        // Brand und Signal sind dieselbe Farbe: auf der Markenfläche erreicht das aufgehellte Signal nur 2.07:1.
        // Auf Ochsenblut ist das Signal deshalb die helle Textfarbe der Fläche selbst (= brand-foreground).
        'signal-on-brand': [0.22 + 0.765 * F, 0.004, H],
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
}

export { brandKind }
