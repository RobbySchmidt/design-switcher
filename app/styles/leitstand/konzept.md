# Stil-Preset „Leitstand“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Leitstellen-Monitor: dunkel, dicht, präzise. Struktur entsteht über feine Kanten und Helligkeitsstufen, nicht über Farbflächen. **Signatur:** Mono-Schrift für alles, was Zahl, Zeit oder Überschrift ist. **Bewusste Abweichungen:** Dunkel ist hier Dauerzustand (Research 1.3.8 sieht die dunkle Fläche als seltenen Höhepunkt). Nähe zu Reflex-Look (b) „Fast-Schwarz + Neon“ – abgesetzt durch Blaugrau statt Schwarz und einen gedeckten Bernstein statt Neon; ein zweiter Akzent existiert nicht.

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#22314a` | Blaugrau: Farbton aller Flächen und Texte, Hervorhebungsfläche |
| Signal | `#e9b04a` | Bernstein: Aktionsfarbe (Button mit dunkler Schrift, Links, Icons) **und** Signal |

Flächenstufen: Tafel/Fußzeile L 0.15 · Grund 0.19 · Karte/Kopfzeile 0.225 · Tönungen 0.245–0.29 · Hervorhebung = Brand (L 0.312). `--destructive` ist ein helles Rot (Hue 25), vom Bernstein (Hue 79) klar getrennt (Research 1.3.7).

Die Eingaben haben in diesem Preset andere Rollen als in Kursbuch: Der Brand ist **keine** Aktionsfarbe, sondern der Farbton der Neutralen und die Hervorhebungsfläche. Die Aktionsfarbe ist der Bernstein – `--primary`, `--ink-action` und `--brand-action` sind alle derselbe luminanz-geklemmte Signalton. Deshalb trägt der Button auf jeder Fläche dieselbe Farbe, und die Seite hat genau einen Akzent (Research 1.3.1).

Weil die Seite dunkel ist, wird der Bernstein nach **unten** geklemmt statt nach oben: `max(1, 0.19 / y)` hebt ihn auf mindestens Luminanz 0.19 an, falls im Themer ein dunklerer Signalton gewählt wird. Die Eingabe selbst liegt mit 0.44 darüber und bleibt unverändert.

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style leitstand` – Ausgabe vom 20.09.2026:

```
ok    15.50 (>= 4.5)  foreground auf background
ok     8.01 (>= 4.5)  muted-foreground auf background
ok     9.48 (>= 4.5)  primary als Text/Link auf background
ok     6.47 (>= 4.5)  destructive als Text auf background
ok     4.31 (>= 3)  input-Kontur auf background
ok     4.64 (>= 3)  ring/50 (Fokus-Halo) auf background
ok     9.48 (>= 3)  signal als Grafik / großer Text auf background
ok     7.82 (>= 4.5)  primary-foreground auf primary/90 über background
ok    14.35 (>= 4.5)  foreground auf card
ok     7.42 (>= 4.5)  muted-foreground auf card
ok     8.78 (>= 4.5)  primary als Text/Link auf card
ok     6.00 (>= 4.5)  destructive als Text auf card
ok     4.00 (>= 3)  input-Kontur auf card
ok     4.54 (>= 3)  ring/50 (Fokus-Halo) auf card
ok     8.78 (>= 3)  signal als Grafik / großer Text auf card
ok     7.91 (>= 4.5)  primary-foreground auf primary/90 über card
ok    12.65 (>= 4.5)  foreground auf secondary
ok     6.54 (>= 4.5)  muted-foreground auf secondary
ok     7.73 (>= 4.5)  primary als Text/Link auf secondary
ok     5.28 (>= 4.5)  destructive als Text auf secondary
ok     3.52 (>= 3)  input-Kontur auf secondary
ok     4.29 (>= 3)  ring/50 (Fokus-Halo) auf secondary
ok     7.73 (>= 3)  signal als Grafik / großer Text auf secondary
ok     8.00 (>= 4.5)  primary-foreground auf primary/90 über secondary
ok    13.62 (>= 4.5)  foreground auf muted
ok     7.04 (>= 4.5)  muted-foreground auf muted
ok     8.33 (>= 4.5)  primary als Text/Link auf muted
ok     5.69 (>= 4.5)  destructive als Text auf muted
ok     3.79 (>= 3)  input-Kontur auf muted
ok     4.43 (>= 3)  ring/50 (Fokus-Halo) auf muted
ok     8.33 (>= 3)  signal als Grafik / großer Text auf muted
ok     7.97 (>= 4.5)  primary-foreground auf primary/90 über muted
ok    11.85 (>= 4.5)  foreground auf accent
ok     6.13 (>= 4.5)  muted-foreground auf accent
ok     7.25 (>= 4.5)  primary als Text/Link auf accent
ok     4.95 (>= 4.5)  destructive als Text auf accent
ok     3.30 (>= 3)  input-Kontur auf accent
ok     4.12 (>= 3)  ring/50 (Fokus-Halo) auf accent
ok     7.25 (>= 3)  signal als Grafik / großer Text auf accent
ok     8.06 (>= 4.5)  primary-foreground auf primary/90 über accent
ok     9.48 (>= 4.5)  primary-foreground auf primary (Button, Top-Job-Badge)
ok    16.50 (>= 4.5)  ink-foreground auf ink
ok     8.53 (>= 4.5)  ink-muted auf ink
ok    10.09 (>= 3)  signal als Grafik auf ink
ok     4.63 (>= 3)  Fokus-Halo (50 %) auf ink
ok    10.09 (>= 3)  Button als Form auf ink
ok     9.48 (>= 4.5)  Button-Schrift auf dem Button (ink)
ok     1.44 (>= 1.2)  dekorativ: ink-border auf ink
ok    12.52 (>= 4.5)  brand-foreground auf brand
ok     8.55 (>= 4.5)  brand-muted auf brand
ok     6.71 (>= 3)  signal als Grafik auf brand
ok     6.71 (>= 3)  Button als Form auf brand
ok     9.48 (>= 4.5)  Button-Schrift auf dem Button (brand)
ok     4.37 (>= 3)  Fokus-Halo (50 %) auf brand
ok     1.59 (>= 1.2)  dekorativ: brand-border auf brand
ok     8.78 (>= 4.5)  VERBOTEN? signal als kleiner Text auf card
FAIL   1.95 (>= 4.5)  VERBOTEN? Weiß auf signal
ok     1.70 (>= 1.2)  dekorativ: border auf background
ok     1.57 (>= 1.2)  dekorativ: border auf card
```

Alle Pflicht-Paare bestanden, im ersten Rechengang, ohne Anpassung einer Token-Helligkeit. Alle 28 Token liegen im sRGB-Gamut.

**Verboten:** helle Schrift auf Bernstein (Weiß erreicht nur **1.95:1**) – der Button trägt deshalb `--primary-foreground`, den Grundton der Seite (9.48:1). Bernstein als Fläche hinter hellem Text ist damit ebenfalls verboten.

**Nicht verboten, anders als die Vorlage vermutet:** Bernstein als **kleiner Text** auf der Karte besteht hier mit **8.78:1**. Auf der dunklen Karte ist der Signalton die hellere Farbe, nicht die dunklere – deshalb darf er auch Linktext sein und ist es auch (`primary als Text/Link` auf allen fünf Flächen 7.25–9.48:1). Dokumentiert ist das Gemessene, nicht die Vorlage.

**Dunkle Paare nach Research 2.3:** WCAG 2 bewertet helle Schrift auf dunklem Grund zu freundlich. Selbst gesetztes Ziel für Sekundärtext war deshalb 5:1 statt 4.5:1. Gemessen: 8.01 (Grund), 7.42 (Karte), 6.54 (secondary), 7.04 (muted), 6.13 (accent), 8.53 (Tafel/Fußzeile), 8.55 (Hervorhebung) – alle deutlich darüber, `--muted-foreground` musste nicht heller gesetzt werden.

## 4 Typografie
Display, Kennzahlen und Tafel: IBM Plex Mono (500/600). Text und UI: IBM Plex Sans (variabel, Achse 100–700) – dieselbe Familie, verwandte Haltung, Kontrast in der Rolle (Research 1.2.6). Mono ist breit (rund 0.6 em je Zeichen), deshalb eine kleinere Headline-Skala als in den anderen Presets: H1 32–48 px (`--text-f-5xl`), H1 der Unterseiten und H2 28–36 px (`--text-f-4xl`); Laufweite −0.03 em; Silbentrennung ist Pflicht.

Die −0.03 em liegen knapp unter der Spanne aus Research 1.2.5 (−0.01 bis −0.025 em). Begründet ist das durch die feste Dickte der Mono: Die Buchstaben stehen von Haus aus weiter auseinander als in einer Proportionalschrift, das Engerstellen holt nur einen Teil davon zurück. Am Screenshot geprüft – die Wörter wirken bei 32 und 48 px nicht zusammengequetscht.

**Test bei 360 px:** „Ausbildung Fachinformatiker Anwendungsentwicklung (m/w/d)“ bricht in vier Zeilen, der einzige nötige Wortumbruch trägt einen Trennstrich („Ausbildung / Fachinformatiker / Anwendungsent- / wicklung (m/w/d)“), kein Überlauf (`scrollWidth` gleich `clientWidth` auf allen vier Breiten). Die Ausweichgröße `--type-h1-page-size: var(--text-f-3xl)` aus der Prüfliste war damit nicht nötig; es bleibt bei `--text-f-4xl`.

**Tafelzeilen.** `--type-board-size` steht auf **`1rem`** (16 px, die kleinste nach Research 1.2.2 zulässige Stufe) bei `--board-weight: 500`. Gemessen bei 1280 px: Die Stellenspalte ist je nach Ortsname 210–234 px breit, die fünf Titel brauchen in Mono 16 px 250 / 210 / 269 / 213 / 250 px. Eine größere Stufe geht also nicht; die verbleibenden Kürzungen stehen in Abschnitt 7. Bei 768 px passen alle fünf Titel vollständig.

## 5 Form, Flächen, Kachel
Radius 2 px, Haarlinien, Punkte eckig (`--style-radius-dot: 0px`, `--style-radius-pill: 2px`). Schatten nur für Overlays: `--style-shadow-xs` ist transparent, `sm` und `md` sind kalte Schwarztöne für Popover und Sheet. Flächenrollen: Kopfzeile = hell im Sinn der Flächenart (`card`, eine Stufe über dem Grund) mit Haarlinie nach unten; Tafel und Fußzeile = Dunkel (eine Stufe unter dem Grund), die Tafel zusätzlich mit umlaufender Haarlinie; Hervorhebung und Top-Job = Marke (Blaugrau, eine Stufe heller). Kachel: transparent mit 1-px-Kante, Hover-Kante Bernstein – Kante **oder** Fläche, nie beides und nie ein Schatten dazu (Research 1.5.3).

Die Fotos brauchen auf dem dunklen Grund keine helle Innenkante, um nicht auszulaufen – sie grenzen sich schon durch ihre eigene Helligkeit ab. Die vorhandene Innenkante (`ring-foreground/10`) bleibt trotzdem sinnvoll: Wo ein Bild an seinem Rand dunkel ist, zieht sie eine leise Linie (gemessen 25,35,26 gegen 2,13,2 im Bild und 20,28,41 auf dem Grund), wo es hell ist, verschwindet sie.

## 6 Bewegung
Die Fallblattanzeige bleibt – hier passt sie am besten: `board-flip` 420 ms, Versatz 90 ms je Zeile, Ease-out. Sonst nur Zustandsübergänge von höchstens 200 ms; `prefers-reduced-motion` schaltet beides über den Vertrag ab.

## 7 Offene Punkte

- **shadcn-Komponenten im Dunkelmodus – geprüft, kein heller Rest.** Angesehen auf allen drei Seiten bei 360 und 1280 px und zusätzlich per DOM-Durchlauf gemessen (jede Fläche und jedes Textpaar der gerenderten Seite): Die einzigen Flächen mit einer Luminanz über 0.25 sind die bernsteinfarbenen – Primär-Buttons, Top-Job-Badge, Signalpunkte, Signalstrich. Keine weiße Karte, kein heller Chip, kein helles Overlay. Geprüft im Einzelnen: Accordion (FAQ), Badge (Top-Job, Tag-Badges, Filter-Chips), Sheet (mobile Navigation, geöffnet gemessen), Button in den Varianten `default`, `outline`, `ghost` und `link`, Avatar-Fallback (dunkler Kreis, helle Initialen), die mobile Bewerbungsleiste (`bg-card/95`) und der Kasten „Auf einen Blick“. Kein einziges Textpaar liegt unter seinem WCAG-Ziel.
- **Outline-Button und Filter-Chips tragen im Dunkelmodus eine leise Füllung.** Die shadcn-Variante `outline` bringt `dark:bg-input/30 dark:border-input` fest mit. Das ist kein heller Rest (die Füllung liegt bei Luminanz 0.05), aber es ist eine Fläche, wo das Preset lieber nur eine Kante hätte. Über Tokens ist es nicht zu lösen: Die Füllung hängt an `--input`, und `--input` muss als funktionale Grenze auf jeder Fläche mindestens 3:1 erreichen (gemessen 3.30 auf `accent`, also fast ohne Luft nach unten). Research 1.5.1 lässt die Sekundäraktion ausdrücklich als „leise Fläche“ zu – deshalb belassen. Behebbar nur im Markup (Feinschliff, Task 10).
- **Drei von fünf Tafeltiteln werden bei 1280 und 1536 px gekürzt.** Vollständig lesen sich „UX/UI Designer“ und „Kundenberater Support“; gekürzt werden „Frontend-Entwickler Vu…“, „Werkstudent Online-Mar…“ und „Backend-Entwickler N…“. Die drei brauchen 250, 269 und 250 px und haben 234, 226 und 210 px. Kleiner als 16 px verbietet Research 1.2.2, die Breitenachse fehlt der Mono, und `--board-weight: 400` würde höchstens 4 px bringen. Bei 768 px passen alle fünf, bei 360 px (Spalte 184 px) nur „UX/UI Designer“ – das ist auch in Kursbuch so und liegt an der Spaltenbreite. Alle Kürzungen brechen spät genug, dass die Stelle erkennbar bleibt; die Zeile ist verlinkt, die Detailseite trägt den vollen Titel.
- **Ein Kacheltitel in der Stellenliste läuft in die Zeilenbegrenzung.** „Ausbildung Fachinformatiker Anwendungsentwicklung (m/w/d)“ braucht in Mono drei Zeilen, das Markup erlaubt zwei (`line-clamp-2`) – in Kursbuch passt derselbe Titel knapp in zwei. Die Kachel ist 314 px breit, bei 19 px Mono sind das 27 Zeichen je Zeile, der Titel hat 57. Eine Stufe kleiner (`--text-f-lg`) würde ihn retten, träfe aber die Größe des Fließtextes und damit die Hierarchie – das wäre der schlechtere Tausch. Bleibt so.
- **Die Fragen im Accordion stehen in der Textschrift, nicht in der Mono.** Grund ist nicht die Vererbung – Tailwinds Preflight setzt `font: inherit` auf Buttons, der Text im `button` würde die Schrift des `h3` sehr wohl übernehmen. Der `AccordionTrigger` in `app/pages/index.vue` trägt ausdrücklich die Klasse `font-sans`. Das ist eine bewusste Entscheidung aus dem Kursbuch-Konzept (Abschnitt 4: Accordion-Fragen sind technisch `h3`, aber Bedienelemente) und gilt für alle Presets gleichermaßen. In diesem Preset fällt es stärker auf, weil der Unterschied Mono gegen Proportional größer ist als Grotesk gegen Grotesk. Bleibt so; änderbar nur im Template, nicht über einen Preset-Wert.
- **Eine Zeile in `app/assets/css/tailwind.css` musste weichen: `--card` im `.dark`-Block.** Der Block steht hinter den Preset-Importen und schlägt deshalb bei gleicher Spezifität alles, was auf `:root` steht – und `--card` ist kein Preset-Token, sondern der gemeinsame Alias aus `contract.css` auf die Eingabe `--theme-card`. Für ein dunkles Preset heißt das: Die eigene Karten-Stufe (L 0.225) wurde still durch die des `.dark`-Blocks (L 0.21) ersetzt, und der Karten-Regler des Themers blieb wirkungslos. Alle übrigen Werte des Blocks überschreibt der Preset-Block ohnehin, weil `:root[data-style="…"]` spezifischer ist. Mit der gelöschten Zeile stimmen Rezept, `style.css` und Browser wieder überein (im Browser nachgemessen). Für die drei hellen Presets ändert das nichts – sie tragen die Klasse `dark` nie; die Kursbuch-Gegenprobe ist deckungsgleich.
- **Avatar und Outline-Button hängen jetzt am Vertrag (Task 10).** Der Avatar las ein festes `rounded-full`, der Outline-Button eine feste 1-px-Kante; beides kommt nun aus dem Preset (`--style-radius-dot`, `--line-weight`). In diesem Preset heißt das: Der Avatar ist quadratisch, die Seite hat keinen Kreis mehr; die Linienstärke bleibt bei 1 px, also unverändert. Die **Tag-Badges** behalten bewusst eine feste 1-px-Kante – an einem 22–30 px hohen Chip trägt die Signaturstärke eines Presets so stark auf wie die Schrift (in Plakat geprüft).
- **Der Punkt im Top-Job-Badge war unsichtbar – erledigt (Task 10).** Das Signal ist hier zugleich die Aktionsfarbe, der 6-px-Punkt lag also Bernstein auf Bernstein. Über die Hook-Klasse `badge-dot` färbt das Preset ihn auf `var(--primary-foreground)`, also in die Schriftfarbe des Badges; `--primary-foreground` löst am Punkt selbst auf und stimmt damit auch innerhalb gescopter Flächen. Derselbe Fall und dieselbe Lösung in Editorial.
- **`--signal-on-brand` ist wie `--signal` und `--primary` der geklemmte Bernstein.** Das trägt, solange die Hervorhebungsfläche dunkel bleibt (gemessen 6.71:1). Wählt jemand im Themer einen hellen Brand, meldet die Ampel das Paar – genau der in `global.md` beschriebene Umgang mit `--signal-on-brand`.
