# Stil-Preset „Weich“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Ruhig, freundlich, mit leichter Tiefe: Gruppiert wird über Weißraum und Schatten, Linien sind selten. **Signatur:** helle, weich gerundete Karten, die auf einem warmen Grund liegen – auch die Tafel ist eine solche Karte. Abgrenzung von Reflex-Look (a): kein Creme, keine Serif, kein Terrakotta – der Grund ist ein warmes Weiß (Chroma 0.008), die Farbe ist Grün.

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#1f5c45` | Aktion, Links, Icons; Markenfläche für Regel-Sektion, Fußzeile, Top-Job |
| Signal | `#e2604a` | Koralle, nur Grafik und großes Wort |

Flächen-Neutrale haben einen festen warmen Farbton (Hue 85), Text und Tönungen (`secondary`, `accent`) folgen dem Farbton des Brands. `--destructive` liegt bei Hue 350, abgesetzt von der Koralle (Hue ~30).

Auf der grünen Markenfläche ist die Koralle eine eigene, hellere Stufe (`--signal-on-brand`, OKLCH L 0.75 / C 0.14 im Farbton der Eingabe). Grund steht in Abschnitt 3.

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style weich` – Ausgabe vom 20.09.2026:

```
ok    14.73 (>= 4.5)  foreground auf background
ok     6.52 (>= 4.5)  muted-foreground auf background
ok     7.30 (>= 4.5)  primary als Text/Link auf background
ok     7.54 (>= 4.5)  destructive als Text auf background
ok     3.62 (>= 3)  input-Kontur auf background
ok     3.28 (>= 3)  ring/50 (Fokus-Halo) auf background
ok     3.62 (>= 3)  signal als Grafik / großer Text auf background
ok     5.94 (>= 4.5)  primary-foreground auf primary/90 über background
ok    15.60 (>= 4.5)  foreground auf card
ok     6.91 (>= 4.5)  muted-foreground auf card
ok     7.74 (>= 4.5)  primary als Text/Link auf card
ok     7.99 (>= 4.5)  destructive als Text auf card
ok     3.83 (>= 3)  input-Kontur auf card
ok     3.35 (>= 3)  ring/50 (Fokus-Halo) auf card
ok     3.83 (>= 3)  signal als Grafik / großer Text auf card
ok     5.87 (>= 4.5)  primary-foreground auf primary/90 über card
ok    13.40 (>= 4.5)  foreground auf secondary
ok     5.94 (>= 4.5)  muted-foreground auf secondary
ok     6.65 (>= 4.5)  primary als Text/Link auf secondary
ok     6.86 (>= 4.5)  destructive als Text auf secondary
ok     3.29 (>= 3)  input-Kontur auf secondary
ok     3.21 (>= 3)  ring/50 (Fokus-Halo) auf secondary
ok     3.29 (>= 3)  signal als Grafik / großer Text auf secondary
ok     5.98 (>= 4.5)  primary-foreground auf primary/90 über secondary
ok    13.88 (>= 4.5)  foreground auf muted
ok     6.15 (>= 4.5)  muted-foreground auf muted
ok     6.89 (>= 4.5)  primary als Text/Link auf muted
ok     7.11 (>= 4.5)  destructive als Text auf muted
ok     3.41 (>= 3)  input-Kontur auf muted
ok     3.22 (>= 3)  ring/50 (Fokus-Halo) auf muted
ok     3.41 (>= 3)  signal als Grafik / großer Text auf muted
ok     5.96 (>= 4.5)  primary-foreground auf primary/90 über muted
ok    13.60 (>= 4.5)  foreground auf accent
ok     6.03 (>= 4.5)  muted-foreground auf accent
ok     6.75 (>= 4.5)  primary als Text/Link auf accent
ok     6.96 (>= 4.5)  destructive als Text auf accent
ok     3.34 (>= 3)  input-Kontur auf accent
ok     3.21 (>= 3)  ring/50 (Fokus-Halo) auf accent
ok     3.34 (>= 3)  signal als Grafik / großer Text auf accent
ok     5.98 (>= 4.5)  primary-foreground auf primary/90 über accent
ok     7.53 (>= 4.5)  primary-foreground auf primary (Button, Top-Job-Badge)
ok     8.10 (>= 4.5)  Weiß auf destructive (Button)
ok    15.60 (>= 4.5)  tile-fg auf der Kachel
ok     6.91 (>= 4.5)  muted-foreground auf der Kachel
ok     7.74 (>= 4.5)  primary (Icons, Pfeil) auf der Kachel
ok     7.53 (>= 4.5)  brand-foreground auf brand
ok     5.21 (>= 4.5)  brand-muted auf brand
ok     3.34 (>= 3)  signal als Grafik auf brand
ok     7.74 (>= 3)  Button als Form auf brand
ok    17.03 (>= 4.5)  Button-Schrift auf dem Button (brand)
ok     3.15 (>= 3)  Fokus-Halo (50 %) auf brand
ok     1.63 (>= 1.2)  dekorativ: brand-border auf brand
FAIL   3.83 (>= 4.5)  VERBOTEN? signal als kleiner Text auf card
FAIL   3.89 (>= 4.5)  VERBOTEN? Weiß auf signal
ok     1.25 (>= 1.2)  dekorativ: border auf background
ok     1.33 (>= 1.2)  dekorativ: border auf card
```

**Verboten:** Koralle als kleiner Text (3.83:1 auf der hellen Karte); weiße Schrift auf Koralle (3.89:1). Beides bleibt Grafik und großes Wort – in der H1 („Fahrpläne“) und als Punkt, Strich und Marke.

**Angepasst gegenüber dem ersten Rechengang:** `signal-on-brand` fiel mit **2.25:1** auf dem dunklen Grün durch (Ziel 3:1). Die Koralle der Eingabe wird auf der Markenfläche deshalb nicht mehr nur luminanz-geklemmt (wie `signal-on-dark`), sondern als eigene helle Stufe gesetzt: Helligkeit in Schritten von 0.02 angehoben bis **L 0.75**, Chroma dabei von 0.167 auf **0.14** gesenkt, weil die volle Sättigung bei dieser Helligkeit außerhalb von sRGB liegt. Ergebnis **3.34:1**. Die Änderung steht gleichlautend in `app/styles/weich/style.css` und in `scripts/style-recipes.mjs`.

Gamut: alle Token liegen in sRGB – außer `--ring` (L 0.22 / C 0.05 im Grün), das den Rotkanal um 0.0008 linear unterschreitet. Der Browser fängt das ab; der Unterschied liegt unter 1/255 und betrifft nur den Fokus-Halo, der mit 3.21–3.35:1 ohnehin gemessen besteht.

## 4 Typografie
Display Bricolage Grotesque (variabel, 700, gemischte Schreibung, Laufweite −0.02 em), Text Figtree (variabel). Verwandte Haltung (beide weich und offen), Kontrast in der Rolle (eigenwillig gegen neutral). Test bei 360 px: „Ausbildung Fachinformatiker Anwendungsentwicklung (m/w/d)“ bricht in vier Zeilen, der einzige nötige Umbruch im Wort trägt einen Trennstrich („Ausbildung / Fachinformatiker / Anwendungsent- / wicklung (m/w/d)“), kein Überlauf (scrollWidth = clientWidth). Die H1-Größe der Unterseiten bleibt deshalb bei `--text-f-6xl`.

**Tafelzeilen.** Bricolage baut deutlich breiter als die schmalen Groteske der anderen Presets, und die Stellenspalte der Tafel ist schmal (bei 1280 px je nach Ortsname 211–238 px). Mit der bisher im Vertrag festen Größe `--text-f-xl` (20 px) schnitten vier von fünf Titeln ab. Der Vertrag hat deshalb eine neue Variable: `--type-board-size` – `@utility type-board` in `app/styles/contract.css` liest sie, Kursbuch und Plakat setzen sie auf `var(--text-f-xl)` (unverändertes Verhalten), Weich auf **`1rem`**. Dazu `--board-weight: 500` statt 600. Größer geht nicht: Gemessen braucht der längste Titel („Werkstudent Online-Marketing“) bei 16 px / Gewicht 500 noch 234 px und hat 227 px – kleiner als 16 px verbietet Research 1.2.2. Ergebnis: bei 1280 und 1536 px lesen sich drei von fünf Titeln vollständig, bei 768 px alle fünf.

## 5 Form, Flächen, Kachel
Radius 16 px (Buttons 14, Kacheln/Bilder/Tafel 24), Pillen und Punkte rund, Linien 1 px. Schatten dreistufig, zweiteilig, im Grün getönt. Flächenrollen: Kopfzeile = hell; Tafel = helle Karte mit Schatten; Hervorhebung, Fußzeile, Top-Job = Marke (Grün). Kachel: helle Fläche mit Schatten, **keine** Kante (1.5.3); Hover hebt den Schatten eine Stufe.

Die grüne Top-Job-Kachel trägt bewusst **keinen** Schatten: Ihre Fläche grenzt sie schon ab, Fläche und Schatten zugleich wären das Anti-Pattern aus 1.8. Aus demselben Grund steht `--tile-border-width` auf 0 – die Hover-Kante des Vertrags bleibt damit unsichtbar, den Hover trägt allein der Schatten.

## 6 Bewegung
Die Tafelzeilen blenden gestaffelt ein (opacity + 8 px, 300 ms, 70 ms Versatz). Sonst nur Zustandsübergänge ≤ 200 ms.

## 7 Offene Punkte
- **Radius 24 px an Kacheln, Tafel und Bildern bleibt.** Am Screenshot geprüft (Startseite 1280 und 360, Stellenliste 1280, Detailseite): Bei Kachelbreiten von 340–460 px und der 1000 px breiten Tafel wirkt die Rundung freundlich, nicht aufgeblasen; Research 1.5.4 („Radius skaliert mit der Elementgröße, keine extremen Radien an großen Karten“) ist eingehalten. Die Ausweichentscheidung `--radius: 0.875rem` war nicht nötig, `defaults.radius` in `app/styles/presets.json` bleibt bei 1.
- **Schatten der Kachel nachgeschärft.** Auf der Card-Fläche („Gerade ausgeschrieben“, „Ähnliche Stellen“) hat die helle Kachel dieselbe Farbe wie ihr Grund; mit der Umgebungsebene bei 0.10 Deckung war die Kante oben praktisch unsichtbar (3 von 255 Stufen Unterschied). Zweite Ebene von `--style-shadow-sm` auf 0.14 angehoben – jetzt trägt der Schatten die Fläche allein, ohne dass eine Kante nötig wird.
- **Zwei Tafeltitel bleiben abgeschnitten.** Bei 1280 und 1536 px enden „Werkstudent Online-Marketi…“ und „Backend-Entwickler Node.…“ mit Auslassungspunkten; sie brauchen 7 px bzw. 2 px mehr, als die Spalte hergibt. Bei 360 px trifft es drei von fünf (die Spalte ist dort 184 px breit) – das ist auch in Kursbuch so und liegt an der Spaltenbreite, nicht am Preset. Innerhalb dieses Presets ist die Grenze erreicht: 16 px ist die kleinste zulässige Größe. Zwei Wege wären denkbar, beide außerhalb einer reinen Preset-Aufgabe: die Breitenachse von Bricolage nutzen (`wdth`-Datei importieren, `--heading-stretch` unter 100 % setzen – ändert aber alle Überschriften) oder der Tafel im Markup mehr Spaltenbreite geben.
- **Outline-Button trägt Kante und Kontaktschatten.** Die shadcn-Variante `outline` („Initiativ bewerben“) bringt `shadow-xs` fest mit; in Presets ohne Schatten fiel das nie auf, hier liegen Kante und Schatten übereinander. Es geht um eine 1-px-Linie und einen 1-px-Kontaktschatten, nicht um die „Haarlinie plus breiter Schatten“ aus 1.8 – deshalb belassen. Seit Task 10 liest der Outline-Button seine Linienstärke aus `--line-weight` und der Avatar seine Form aus `--style-radius-dot`; in diesem Preset ändert das nichts (1 px, Punkte rund). Die **Tag-Badges** behalten bewusst eine feste 1-px-Kante – mit der Signaturstärke eines Presets trägt der Rahmen an so kleinen Chips zu stark auf (in Plakat geprüft).
