# Stil-Preset „Editorial“

Erarbeitet nach `docs/design-research.md`. Stilstudie über denselben Inhalten wie Kursbuch – bewusste Abweichung von Methode 2.1 (siehe `docs/design-konzept.md`, Abschnitt „Stil-Presets“).

## 1 Haltung
Gedrucktes Heft: Papier, Serif-Überschriften, Haarlinien als Gliederung, eine einzige Druckfarbe. **Signatur:** die 2-px-Linie über jedem Teaser und über der Tafel – Stellen lesen sich wie Artikelanrisse. **Bewusste Nähe zu Reflex-Look (c)** „Zeitungslayout mit Haarlinien“ – als Stilstudie gekennzeichnet. Abgesetzt von (a): kaltes Papier (Hue 250) statt Creme, Ochsenblut statt Terrakotta; keine kursive Serif-Headline (1.8).

Was die Nähe zu (c) rechtfertigt: Das Thema der Seite ist eine Tafel mit Zeilen – Zeitungssatz ist dafür die nächstliegende, nicht die dekorative Form. Und (c) wird hier nicht halb zitiert, sondern konsequent gebaut: Die Kacheln haben **gar keine** Fläche mehr, nur eine Linie darüber; es gibt genau **eine** farbige Fläche im Seitenkörper; ruhender Inhalt trägt **keinen** Schatten.

## 2 Farbe
| Eingabe | Hex | Rolle |
|---|---|---|
| Brand | `#8c1c2b` | die eine Druckfarbe: Aktion, Links, Icons, Hervorhebungsfläche |
| Signal | `#8c1c2b` | identisch – es gibt keine zweite Farbe |

Neutrale mit festem kühlen Farbton (Hue 250, Chroma ≤ 0.01). Weil die Aktionsfarbe rot ist, liegt `--destructive` bei Hue 60 (Braunorange) und Fehler tragen immer Icon und Text (Research 1.3.7).

Auf der Markenfläche gilt eine Sonderregel: `--signal-on-brand` ist dort **nicht** das aufgehellte Signal, sondern die helle Textfarbe der Fläche selbst (`var(--brand-foreground)`). Begründung in Abschnitt 3.

## 3 Kontrastnachweis
`node scripts/contrast.mjs --style editorial` – Ausgabe vom 20.09.2026:

```
ok    16.84 (>= 4.5)  foreground auf background
ok     6.92 (>= 4.5)  muted-foreground auf background
ok     8.44 (>= 4.5)  primary als Text/Link auf background
ok     5.80 (>= 4.5)  destructive als Text auf background
ok     3.98 (>= 3)  input-Kontur auf background
ok     3.36 (>= 3)  ring/50 (Fokus-Halo) auf background
ok     8.44 (>= 3)  signal als Grafik / großer Text auf background
ok     7.07 (>= 4.5)  primary-foreground auf primary/90 über background
ok    17.84 (>= 4.5)  foreground auf card
ok     7.33 (>= 4.5)  muted-foreground auf card
ok     8.94 (>= 4.5)  primary als Text/Link auf card
ok     6.14 (>= 4.5)  destructive als Text auf card
ok     4.22 (>= 3)  input-Kontur auf card
ok     3.41 (>= 3)  ring/50 (Fokus-Halo) auf card
ok     8.94 (>= 3)  signal als Grafik / großer Text auf card
ok     7.03 (>= 4.5)  primary-foreground auf primary/90 über card
ok    15.41 (>= 4.5)  foreground auf secondary
ok     6.33 (>= 4.5)  muted-foreground auf secondary
ok     7.72 (>= 4.5)  primary als Text/Link auf secondary
ok     5.31 (>= 4.5)  destructive als Text auf secondary
ok     3.64 (>= 3)  input-Kontur auf secondary
ok     3.29 (>= 3)  ring/50 (Fokus-Halo) auf secondary
ok     7.72 (>= 3)  signal als Grafik / großer Text auf secondary
ok     7.21 (>= 4.5)  primary-foreground auf primary/90 über secondary
ok    15.88 (>= 4.5)  foreground auf muted
ok     6.52 (>= 4.5)  muted-foreground auf muted
ok     7.96 (>= 4.5)  primary als Text/Link auf muted
ok     5.47 (>= 4.5)  destructive als Text auf muted
ok     3.76 (>= 3)  input-Kontur auf muted
ok     3.34 (>= 3)  ring/50 (Fokus-Halo) auf muted
ok     7.96 (>= 3)  signal als Grafik / großer Text auf muted
ok     7.17 (>= 4.5)  primary-foreground auf primary/90 über muted
ok    15.18 (>= 4.5)  foreground auf accent
ok     6.23 (>= 4.5)  muted-foreground auf accent
ok     7.61 (>= 4.5)  primary als Text/Link auf accent
ok     5.23 (>= 4.5)  destructive als Text auf accent
ok     3.59 (>= 3)  input-Kontur auf accent
ok     3.29 (>= 3)  ring/50 (Fokus-Halo) auf accent
ok     7.61 (>= 3)  signal als Grafik / großer Text auf accent
ok     7.21 (>= 4.5)  primary-foreground auf primary/90 über accent
ok     8.69 (>= 4.5)  primary-foreground auf primary (Button, Top-Job-Badge)
ok     6.23 (>= 4.5)  Weiß auf destructive (Button)
ok    16.84 (>= 4.5)  ink-foreground auf ink
ok     9.69 (>= 4.5)  ink-muted auf ink
ok     4.14 (>= 3)  signal als Grafik auf ink
ok     5.01 (>= 3)  Fokus-Halo (50 %) auf ink
ok    17.84 (>= 3)  Button als Form auf ink
ok    17.84 (>= 4.5)  Button-Schrift auf dem Button (ink)
ok     1.67 (>= 1.2)  dekorativ: ink-border auf ink
ok     8.67 (>= 4.5)  brand-foreground auf brand
ok     5.84 (>= 4.5)  brand-muted auf brand
ok     8.67 (>= 3)  signal als Grafik auf brand
ok     8.93 (>= 3)  Button als Form auf brand
ok    17.10 (>= 4.5)  Button-Schrift auf dem Button (brand)
ok     3.22 (>= 3)  Fokus-Halo (50 %) auf brand
ok     1.66 (>= 1.2)  dekorativ: brand-border auf brand
ok     8.94 (>= 4.5)  VERBOTEN? signal als kleiner Text auf card
ok     9.07 (>= 4.5)  VERBOTEN? Weiß auf signal
ok     1.42 (>= 1.2)  dekorativ: border auf background
ok     1.51 (>= 1.2)  dekorativ: border auf card

Alle Pflicht-Paare bestanden. (VERBOTEN-Zeilen dürfen durchfallen – dann gehören sie ins Konzept.)
```

**Verboten: nichts.** Beide bewusst geprüften Problemfälle bestehen hier, weil das Signal kein helles Rot, sondern ein dunkles Ochsenblut ist: als kleiner Text auf der hellen Karte 8.94:1, weiße Schrift auf dem Signal 9.07:1. Anders als in Kursbuch oder Weich darf die Signalfarbe in diesem Preset also auch Text tragen – sie ist dieselbe Farbe wie die Aktion.

**Angepasst gegenüber dem ersten Rechengang:** „signal als Grafik auf brand“ fiel mit **2.07:1** durch (Ziel 3:1). Das ist kein Helligkeitsproblem, das sich in 0.02-Schritten lösen ließe: Brand und Signal sind **dieselbe** Eingabe, die Grafik läge also auf ihrer eigenen Farbe. Aufhellen (`signal-on-dark`, Luminanz-Klemme nach oben) bringt nur `#e2334b` und damit 2.07:1 – ein zweites, helleres Rot wäre außerdem genau die zweite Farbe, die dieses Preset nicht haben will. Deshalb nach Vorgabe des Briefs: `--signal-on-brand` ist auf der Markenfläche die helle Textfarbe der Fläche, `var(--brand-foreground)` (`#fdf9f9`), im Rezept `[0.22 + 0.765 * F, 0.004, H]`. Ergebnis **8.67:1**. Konsequenz im Bild: Die kurzen Marker über den sechs Regeln stehen hell auf Ochsenblut statt farbig – auf der einen farbigen Fläche der Seite ist Hell der Akzent. Die Änderung steht gleichlautend in `app/styles/editorial/style.css` und in `scripts/style-recipes.mjs`.

**Gamut:** Alle Token liegen in sRGB außer `--destructive` (L 0.50 / C 0.13 / H 60): Der Blaukanal unterschreitet 0 um 0.009 linear, der Browser klemmt ihn auf 0. Der Ton wird dadurch minimal satter, nicht heller; gemessen besteht das Paar mit 5.23–6.14:1 auf allen Flächen und 6.23:1 als Button-Grund.

## 4 Typografie
Display Source Serif 4 (variabel, optische Größe, 600, aufrecht – `opsz.css`, es sind **keine** Kursiven geladen), Text Source Sans 3. Beide stammen aus derselben Schriftsippe (Adobe Source): verwandte Haltung, Kontrast in der Rolle. Kennzahlen in Serif mit Tabellenziffern. Test bei 360 px: „Ausbildung Fachinformatiker Anwendungsentwicklung (m/w/d)“ bricht in vier Zeilen, der einzige nötige Wortumbruch trägt einen Trennstrich („Ausbildung / Fachinformatiker / Anwendungsent- / wicklung (m/w/d)“), kein Überlauf (`scrollWidth = clientWidth` auf allen vier Breiten). Die H1-Größe der Unterseiten bleibt deshalb bei `--text-f-6xl`.

**Tafelzeilen.** `--type-board-size` steht auf **`var(--text-f-lg)`** (16 px mobil bis 18 px ab 1200 px), eine Stufe unter Kursbuch. Gemessen an den fünf Titeln der Tafel: Mit `--text-f-xl` (19.1 px bei 1280, 19.9 px bei 1536) passen bei 1280 px alle fünf, bei 1536 px braucht „Werkstudent Online-Marketing“ 279 px und hat 276 – drei Pixel zu wenig. Mit `--text-f-lg` passen bei 768, 1280 und 1536 px **alle fünf** Titel vollständig. Bei 360 px bleibt ein Titel gekürzt (234 px nötig, 224 px vorhanden) – das ist auch bei 16 px so und liegt an der Spaltenbreite, nicht an der Größe.

## 5 Form, Flächen, Kachel
Radius 2 px, Linien 1 px, Signaturlinie 2 px, kein Schatten außer an Overlays (`--style-shadow-xs` und `--style-shadow-sm` sind transparent, nur `md` trägt einen weichen Ton für Popover, Sheet und Skip-Link). Flächenrollen: Kopfzeile = hell mit Haarlinie; Tafel = hell, oben und unten eine 2-px-Linie, keine Rundung; Hervorhebung = Marke (die eine farbige Fläche der Seite); Fußzeile = Dunkel. Kachel: **keine Fläche** – 2-px-Linie in Textfarbe oben, darunter der Inhalt (`--tile-padding: 1.25rem 0 0`, also kein seitlicher Innenabstand); Top-Job mit Linie in Ochsenblut; Hover färbt allein die Linie um.

Weil die Kachel keine Fläche hat, greift die Regel „Kante **oder** Schatten“ (1.5.3) hier gar nicht erst: Es gibt weder eine umlaufende Kante noch einen Schatten, nur eine einzelne Linie als Anriss. Die Top-Job-Kachel bekommt dementsprechend **keine** eigene Flächenart – nur die Linienfarbe wechselt. Badge und Texte darin lesen deshalb weiter die Wurzel-Tokens (Badge 8.69:1).

**Innenabstand der Tafel korrigiert.** Die Vorlage gibt der Tafel innen 20 px (ab 640 px 24 px) seitlichen Abstand – sinnvoll, solange sie ein Kasten ist. Ohne Kasten rückte der Tafeltext gegenüber seinen eigenen zwei Linien ein, während Kacheln, Kennzahlen und Überschriften bündig stehen; das sah nach Versehen aus, nicht nach Absicht. Eine Regel auf den dokumentierten Haken (`board-head`, `board-cols`, `board-foot`, `board-row > a`) setzt `padding-inline: 0`. Nebeneffekt: Die Stellenspalte gewinnt 40–48 px, und die Tafeltitel passen dadurch vollständig (Abschnitt 4).

## 6 Bewegung
Nur die H1 blendet ein. Die Tafel steht sofort (`--board-row-animation: none`). Sonst nur Zustandsübergänge ≤ 200 ms.

## 7 Offene Punkte
- **Der Punkt im Top-Job-Badge war unsichtbar – erledigt (Task 10).** `JobCard.vue` und die Stellenseite setzen in das Badge einen 6-px-Punkt in `bg-signal`; der Badge-Grund ist `--primary`. In einem Preset mit nur einer Druckfarbe sind beide dasselbe Ochsenblut, der Punkt verschwand und ließ links im Badge eine 6-px-Lücke. Gelöst über die Hook-Klasse `badge-dot`: Der Punkt trägt im Markup zusätzlich diese Klasse, und dieses Preset färbt ihn auf `var(--primary-foreground)` – also in die Schriftfarbe des Badges. Kein neuer Vertragswert nötig, `--primary-foreground` löst am Punkt selbst auf und stimmt damit auch innerhalb gescopter Flächen. In Leitstand steht derselbe Fall (Bernstein auf Bernstein) und ist gleich gelöst.
- **Der Hover der Top-Job-Kachel ist still.** Die Kachel-Regel des Vertrags färbt beim Überfahren die Kante in die Aktionsfarbe – die Linie der Top-Job-Kachel trägt diese Farbe schon. Die Rückmeldung leistet dort allein der Pfeil im Kachelfuß, der um 4 px nach rechts wandert. Bei allen anderen Kacheln wechselt die Linie von Druckerschwarz zu Ochsenblut.
- **Ein Tafeltitel bleibt bei 360 px gekürzt.** „Werkstudent Online-Market…“ braucht 234 px, die Spalte gibt 224 px her. Kleiner als 16 px verbietet Research 1.2.2; bei 768, 1280 und 1536 px passen alle fünf Titel.
- **Filterchips liegen auf `--secondary`.** Die inaktiven Chips der Stellenliste sind die einzigen getönten Flächen neben den drei genannten. Sie sind Bedienelemente, keine Sektionsflächen, und der Unterschied zum Papier beträgt nur drei Prozent Helligkeit – als „farbige Fläche“ im Sinn von 1.3.8 zählen sie nicht. Belassen.
- **Outline-Button und Avatar hängen jetzt am Vertrag (Task 10).** Beide hatten eine fest verdrahtete 1-px-Kante bzw. ein festes `rounded-full`; sie lesen nun `--line-weight` und `--style-radius-dot`. Für dieses Preset ändert das nichts sichtbar: Die Linienstärke ist ohnehin 1 px, und `--style-radius-dot` steht auf rund – der Avatar bleibt also bewusst der einzige Kreis neben lauter 2-px-Radien, passend zum Punkt im Linienband und auf der Tafel. Die **Tag-Badges** behalten bewusst eine feste 1-px-Kante, weil die Signaturstärke eines Presets an so kleinen Chips zu stark aufträgt (in Plakat geprüft).
- **Kopfzeile und Papier liegen dicht beieinander.** Die Kopfzeile ist `card` (`#fcfdff`) auf `background` (`#f5f7f9`) – der Unterschied ist bewusst klein, die Haarlinie darunter trägt die Trennung. So bleibt oben am Bildschirmrand eine Linie statt einer zweiten Fläche, passend zur Haltung.
