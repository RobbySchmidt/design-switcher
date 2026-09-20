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
`node scripts/contrast.mjs --style plakat` – Ausgabe vom 20.09.2026:

```
ok    18.59 (>= 4.5)  foreground auf background
ok     8.10 (>= 4.5)  muted-foreground auf background
ok    18.59 (>= 4.5)  primary als Text/Link auf background
ok     7.81 (>= 4.5)  destructive als Text auf background
ok    18.59 (>= 3)  input-Kontur auf background
ok     3.59 (>= 3)  ring/50 (Fokus-Halo) auf background
ok     4.76 (>= 3)  signal als Grafik / großer Text auf background
ok    14.92 (>= 4.5)  primary-foreground auf primary/90 über background
ok    19.41 (>= 4.5)  foreground auf card
ok     8.45 (>= 4.5)  muted-foreground auf card
ok    19.41 (>= 4.5)  primary als Text/Link auf card
ok     8.15 (>= 4.5)  destructive als Text auf card
ok    19.41 (>= 3)  input-Kontur auf card
ok     3.64 (>= 3)  ring/50 (Fokus-Halo) auf card
ok     4.97 (>= 3)  signal als Grafik / großer Text auf card
ok    14.87 (>= 4.5)  primary-foreground auf primary/90 über card
ok    16.29 (>= 4.5)  foreground auf secondary
ok     7.09 (>= 4.5)  muted-foreground auf secondary
ok    16.29 (>= 4.5)  primary als Text/Link auf secondary
ok     6.84 (>= 4.5)  destructive als Text auf secondary
ok    16.29 (>= 3)  input-Kontur auf secondary
ok     3.50 (>= 3)  ring/50 (Fokus-Halo) auf secondary
ok     4.17 (>= 3)  signal als Grafik / großer Text auf secondary
ok    15.26 (>= 4.5)  primary-foreground auf primary/90 über secondary
ok    17.03 (>= 4.5)  foreground auf muted
ok     7.42 (>= 4.5)  muted-foreground auf muted
ok    17.03 (>= 4.5)  primary als Text/Link auf muted
ok     7.15 (>= 4.5)  destructive als Text auf muted
ok    17.03 (>= 3)  input-Kontur auf muted
ok     3.52 (>= 3)  ring/50 (Fokus-Halo) auf muted
ok     4.36 (>= 3)  signal als Grafik / großer Text auf muted
ok    15.11 (>= 4.5)  primary-foreground auf primary/90 über muted
ok    15.80 (>= 4.5)  foreground auf accent
ok     6.88 (>= 4.5)  muted-foreground auf accent
ok    15.80 (>= 4.5)  primary als Text/Link auf accent
ok     6.63 (>= 4.5)  destructive als Text auf accent
ok    15.80 (>= 3)  input-Kontur auf accent
ok     3.46 (>= 3)  ring/50 (Fokus-Halo) auf accent
ok     4.04 (>= 3)  signal als Grafik / großer Text auf accent
ok    15.26 (>= 4.5)  primary-foreground auf primary/90 über accent
ok    18.86 (>= 4.5)  primary-foreground auf primary (Button, Top-Job-Badge)
ok     8.15 (>= 4.5)  Weiß auf destructive (Button)
ok    19.41 (>= 4.5)  tile-fg auf der Kachel
ok     8.45 (>= 4.5)  muted-foreground auf der Kachel
ok    19.41 (>= 4.5)  primary (Icons, Pfeil) auf der Kachel
ok    18.59 (>= 4.5)  ink-foreground auf ink
ok    10.39 (>= 4.5)  ink-muted auf ink
ok     4.44 (>= 3)  signal als Grafik auf ink
ok     5.18 (>= 3)  Fokus-Halo (50 %) auf ink
ok    18.86 (>= 3)  Button als Form auf ink
ok    18.86 (>= 4.5)  Button-Schrift auf dem Button (ink)
ok     2.11 (>= 1.2)  dekorativ: ink-border auf ink
ok    12.17 (>= 4.5)  brand-foreground auf brand
ok     8.91 (>= 4.5)  brand-muted auf brand
ok     3.49 (>= 3)  signal als Grafik auf brand
ok    12.18 (>= 3)  Button als Form auf brand
ok    16.59 (>= 4.5)  Button-Schrift auf dem Button (brand)
ok     3.06 (>= 3)  Fokus-Halo (50 %) auf brand
ok    13.65 (>= 1.2)  dekorativ: brand-border auf brand
ok    13.65 (>= 4.5)  Hover der Kachel: Text auf brand
ok     5.95 (>= 4.5)  Hover der Kachel: Sekundärtext auf brand
ok    18.59 (>= 4.5)  Tafelkopf: background auf foreground
ok     4.97 (>= 4.5)  VERBOTEN? signal als kleiner Text auf card
ok     4.97 (>= 4.5)  VERBOTEN? Weiß auf signal
ok    18.59 (>= 1.2)  dekorativ: border auf background
ok    19.41 (>= 1.2)  dekorativ: border auf card
```

**Verboten:** Gelb als Text oder Icon auf hellen Flächen (Brand auf Weiß ~1.4:1, nicht reparabel – deshalb ist Gelb hier ausschließlich Fläche). Keine weitere Zeile ist durchgefallen: Die beiden bewusst geprüften Problemfälle bestehen mit diesem Signalrot knapp (Signalrot als kleiner Text auf Weiß und weiße Schrift auf Signalrot je 4.97:1). Sie bleiben trotzdem Ausnahmen – der Stil setzt Rot als Grafik und großes Wort ein, nicht als Fließtextfarbe.

## 4 Typografie
Archivo (variabel, selbst gehostet, `wdth.css`). Display: 800, Breite 75 %, Versalien, Laufweite −0.01 em, Zeilenhöhe 0.95–1.0. Text und UI: 400–600, normale Breite. Eine Familie genügt (Research 1.2.6). Kennzahlen und Tafel in der schmalen Breite. Test bei 360 px mit „Ausbildung Fachinformatiker Anwendungsentwicklung“: vier Zeilen, beide Umbrüche mit Trennstrich („AUSBILDUNG FACH- / INFORMATIKER / ANWENDUNGSENT- / WICKLUNG (M/W/D)“), kein Überlauf (scrollWidth = clientWidth, 360 px). Die H1-Größe der Unterseiten bleibt deshalb bei `--text-f-6xl`; die dritte Zeile läuft allerdings bis an die letzten Pixel des Satzspiegels.

## 5 Form, Flächen, Kachel
Radius 0 – auch Chips, Badges, Punkte. Linien 3 px, Signaturlinien 4 px, schwarz. Kein Schatten. Flächenrollen: Kopfzeile, Hervorhebung, Top-Job = Marke (Gelb); Fußzeile = Dunkel (Schwarz); Tafel = hell mit Kante, Spaltenkopf invertiert. Kachel: weiße Fläche mit 3-px-Kante (Kante statt Schatten, 1.5.3); Hover füllt sie gelb.

## 6 Bewegung
Keine Einstiegsbewegung der Tafel, Zustandswechsel hart (0 ms). Die H1 blendet wie in allen Presets ein; mit „Bewegung reduzieren“ entfällt auch das.

Die Regel `:is(a, button, .tile, a svg) { transition-duration: 0s }` trifft **absichtlich** alle Links, Buttons und Kacheln dieses Presets: Spec 5.2 verlangt „Hover ist ein harter Farbwechsel ohne Übergang“, und das gilt für jedes Bedienelement, nicht für eine Auswahl davon. Betroffen sind nur Zustandsübergänge (`transition`) – Seitenwechsel, Sheet und Accordion laufen als Animationen auf anderen Elementen und bleiben unberührt.

## 7 Offene Punkte
Drei Beobachtungen aus den Screenshots, die ein reines CSS-Preset nicht beheben kann, weil sie in Basis-Komponenten stecken (Markup bleibt in dieser Aufgabe unangetastet):

- **Der Avatar bleibt rund – erledigt (Task 10).** `app/components/ui/avatar/Avatar.vue` und `AvatarFallback.vue` setzten `rounded-full` fest, statt `rounded-dot` aus dem Vertrag zu lesen. Auf der Stellenseite (Ansprechpartnerin „MS“) war das das einzige runde Element des Presets. Beide Dateien lesen jetzt `rounded-dot`: Für Kursbuch wirkungsgleich (`--style-radius-dot: 9999px`), in Plakat ist der Avatar quadratisch.
- **Outline-Buttons tragen eine 1-px-Kante – erledigt (Task 10).** Die shadcn-Variante `outline` (zum Beispiel „Initiativ bewerben“ am Seitenende) benutzte Tailwinds `border` statt `border-(length:--line-weight)`, wie es die eigenen Bausteine tun; die Haarlinie wirkte neben den 3-px-Linien dünn. Die Variante hängt jetzt an `--line-weight`, der Button trägt also die 3-px-Kante des Presets.
- **Die Tag-Badges behalten bewusst eine feste 1-px-Kante.** Auch sie hingen kurzzeitig an `--line-weight`; bei 52 × 26 px großen Chips mit 12–14 px Schrift trägt eine 3-px-Kante so stark auf wie die Buchstaben, die Tags werden zu kleinen Kästen und die Reihe zu einem grauen Band. Auf der gelben Top-Job-Kachel kam ein Doppelrahmen mit 6 px Luft dazu. `app/components/ui/badge/index.ts` steht deshalb wieder auf Tailwinds `border`. Die Form (`rounded-pill`, hier 0) kommt weiter aus dem Preset.
- **Kleine Versalien laufen eng.** Research 1.2.5 will für Versalien +5–12 % Laufweite; die Rollen `type-h3` (Kacheltitel) und `type-wordmark` stehen hier bei 0 em bzw. den fest im Vertrag verdrahteten −0.025 em. Bei Archivo 800 in 75 % Breite bleibt das in den Screenshots gut lesbar, deshalb bewusst so belassen. Die großen Headlines bleiben nach Research 1.2.5 („große Headlines leicht enger“) bei −0.01 em.

Bewusst so und kein offener Punkt: Die Trennlinie im Kachelfuß und die Kanten der Tag-Chips sind mit `foreground/15` bzw. `/25` aufgehellt – 3 px hellgrau statt schwarz. Das kommt aus dem Markup und ist als dekorative Linie (Research 1.6.3) richtig; schwarz gezogen würden sie mit der Kachelkante konkurrieren.
