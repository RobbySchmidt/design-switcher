# Stil-Presets für den Themer – Entwurf

Stand: 20.09.2026 · Status: Entwurf zur Freigabe · Grundlage: `docs/design-research.md`, `docs/design-konzept.md`

## 1 Ziel

Die Seite (Landingpage `/`, Stellenliste `/jobs`, Stellenseite `/jobs/[slug]`) bekommt neben dem heutigen Stil „Kursbuch“ vier weitere, eigenständige Stile: **Plakat, Weich, Leitstand, Editorial**. Im Themer wählt man einen Stil aus; Farben und Radius lassen sich danach wie bisher anpassen.

Ein Stil-Preset ist mehr als eine Farbpalette: Es bestimmt Schriften, Charakter der Überschriften, Form, Linien, Art der Kacheln, welche Flächen dunkel, farbig oder hell sind, und die eine Einstiegsbewegung.

**Fest für alle Presets:** Daten (`app/data/`), Routen, Texte, Fotos, Sektionen und ihre Reihenfolge, das Markup der Komponenten, die shadcn-Basis, lucide-Icons.

**Nicht Teil dieser Runde:** Komponenten-Varianten je Preset (eigenes Markup), eigene Texte oder Bilder je Preset, ein Stil-Umschalter für Besucher im Live-Betrieb, ein Dark-Mode-Schalter. Die Struktur wird aber so angelegt, dass Komponenten-Varianten und Kundenprojekte später ohne Umbau dazukommen (Abschnitt 9).

## 2 Verhältnis zur Research

Die prüfbaren Regeln gelten für **jedes** Preset: gerechnete Kontraste (2.3), Schriftrollen, Zeilenlängen, Zielgrößen, „Kante oder Schatten“, Anti-Patterns (1.8), reduzierte Bewegung, Test der längsten Wörter bei 360 px.

**Bewusste Abweichung:** Methode 2.1 leitet einen Stil aus dem Gegenstand ab. Die Presets sind Stilstudien über demselben Gegenstand und denselben Inhalten; nur „Kursbuch“ ist aus dem Gegenstand abgeleitet. Das wird in `docs/design-konzept.md` vermerkt. Zwei Presets liegen nah an Reflex-Looks aus 1.8 (Leitstand → b, Editorial → c); das steht in ihren Konzepten, zusammen mit dem, was sie davon absetzt.

Für jedes Preset gilt die Arbeitsweise der Research: **erst rechnen und das Konzept schreiben, dann CSS.**

## 3 Architektur

```
app/styles/
  index.ts               Registry der Presets
  contract.css           Rollen-Utilities, die die Templates benutzen (keine Werte)
  kursbuch/style.css     der heutige Stil als Preset Nr. 1
  plakat/style.css       + konzept.md
  weich/style.css        + konzept.md
  leitstand/style.css    + konzept.md
  editorial/style.css    + konzept.md
```

Das Konzept von Kursbuch bleibt `docs/design-konzept.md`.

**Umschalten:** `data-style="<id>"` auf `<html>`. Jedes Preset steht in einem Block `:root[data-style="<id>"]`. Alle Presets liegen im CSS-Bundle, das Umschalten braucht kein Neuladen. Custom Properties lösen dort auf, wo sie deklariert sind – deshalb gehört das Attribut auf `<html>`, genau wie die Theme-Eingaben heute.

**Vollständigkeit statt Vererbung:** Jedes Preset definiert den **gesamten** Vertrag selbst. Es gibt keine Rückfallwerte aus Kursbuch – sonst wäre ein neuer Stil doch wieder „der alte plus Änderungen“. Ein Prüfskript vergleicht die Variablennamen aller Presets mit denen von Kursbuch und meldet fehlende.

**Standard-Preset:** `nuxt.config.ts` setzt `app.head.htmlAttrs['data-style']` (Start: `kursbuch`). Im Build gibt es keinen Themer; das Preset ist dort fest.

**Registry (`app/styles/index.ts`):**

```ts
export interface StylePreset {
  id: string
  label: string
  description: string            // eine Zeile für den Themer
  dark?: boolean                 // setzt zusätzlich .dark auf <html> (für die dark:-Klassen der shadcn-Komponenten)
  defaults: { brand: string, signal: string, card?: string, radius: number }
}
```

**Dunkles Preset:** Leitstand definiert seine Tokens selbst im eigenen Block (`:root[data-style]` hat Vorrang vor `.dark`). Die Klasse `.dark` wird nur gesetzt, damit die `dark:`-Varianten der shadcn-Komponenten greifen. Der vorhandene `.dark`-Block in `tailwind.css` bleibt unverändert und unbenutzt.

**Schriften:** alle selbst gehostet über fontsource, Importe gesammelt am Anfang von `tailwind.css`. Der Browser lädt nur die Dateien der Schriften, die das aktive Preset tatsächlich verwendet. Neue Pakete (Yarn 1): `@fontsource-variable/archivo` (mit Breitenachse, `wdth.css`), `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/figtree`, `@fontsource/ibm-plex-mono` (500, 600), `@fontsource-variable/ibm-plex-sans`, `@fontsource-variable/source-serif-4`. Keine Kursiven.

## 4 Der Token-Vertrag

Alles, was heute als fester Stilwert in Templates und Scoped-Styles steht (rund 45 Stellen in `index.vue`, `jobs/*.vue`, `JobCard`, `DepartureBoard`, `SiteHeader`, `SiteFooter`, `PageSection`), zieht in Rollen-Utilities aus `contract.css` um. Die Utilities lesen Variablen; die Werte kommen aus dem Preset.

| Bereich | Variablen / Utilities | Anmerkung |
|---|---|---|
| Eingaben | `--theme-brand`, `--theme-signal`, `--theme-card`, `--radius` | wie heute; der Themer setzt sie inline auf `<html>` |
| Farb-Tokens | alle shadcn-Variablen, `--signal`, `--signal-on-dark`, `--ink*`, `--brand*` | jedes Preset hat eigene L/C-Rezepte (relative Farbsyntax auf die Eingaben), inklusive eigener Regel für `--primary` (bei Plakat Schwarz statt Brand) |
| Schrift | `--style-font-sans`, `--style-font-heading`, `--style-font-figure`; `--heading-weight`, `--heading-transform`, `--heading-stretch` | `--font-sans`/`--font-heading` in `@theme inline` verweisen darauf, damit `font-sans`/`font-heading` dem Preset folgen |
| Typo-Rollen | Utilities `type-h1`, `type-h1-page`, `type-h2`, `type-h3-lg`, `type-h3`, `type-lead`, `type-figure`; je Rolle `--type-<rolle>-size`, `-leading`, `-tracking` | 1:1 die Rollentabelle aus dem Konzept; Maximalbreiten (`max-w-[..ch]`) bleiben im Template |
| Form | `--radius`, `--radius-pill`, `--line-weight`, `--line-weight-strong`, `--image-radius` | `--line-weight-strong` ersetzt die festen 3 px in Linienband, Halte-Linie und Markern |
| Kachel | Utilities `tile`, `tile-featured`; `--tile-bg`, `--tile-border`, `--tile-shadow`, `--tile-radius`, Hover-Werte | Fläche, Kante **oder** Schatten – nie Kante plus breiter Schatten (1.5.3) |
| Flächenrollen | Utilities `surface-header`, `surface-footer`, `surface-board`, `surface-highlight` | lesen Rollen-Variablen, die das Preset auf eine seiner Flächenarten verweist (dunkel, Marke, hell). Scope-Prinzip bleibt: Text, Sekundärtext, Linien, Fokusring, Primär-Button und Signal stimmen innerhalb der Fläche automatisch |
| Bewegung | `--board-row-animation`, `--board-row-stagger`, `--transition-state` | Keyframes (`board-flip`, `board-fade`) ziehen aus dem Scoped-Style in `contract.css`. `prefers-reduced-motion` schaltet weiterhin alles Dekorative ab |

`PageSection` kennt danach die Flächen `background`, `card`, `muted`, `highlight`. `surface-ink` und `surface-brand` bleiben als Flächen**arten** bestehen, werden in Templates aber nicht mehr direkt benutzt.

**Lücke, die dabei geschlossen wird:** Auf einer hellen Markenfläche löst `--signal` heute falsch auf (`--signal-on-dark`, das Panel warnt nur). Das Signal auf der Markenfläche folgt künftig demselben Hell/Dunkel-Schalter wie Text und Button. Plakat braucht das.

Ein Preset darf zusätzlich zu den Werten **einzelne CSS-Regeln auf die dokumentierten Rollenklassen** enthalten (Beispiel: invertierter Tabellenkopf der Tafel bei Plakat). Kein eigenes Markup, keine Vue-Dateien.

## 5 Die Presets

Hex-Werte sind Startwerte. Verbindlich werden sie im jeweiligen `konzept.md`, nachgerechnet mit `scripts/contrast.mjs`; durchgefallene Kombinationen werden dort als verboten dokumentiert.

### 5.1 Kursbuch (Bestand)
Unverändert. Die heutigen Werte ziehen aus `tailwind.css` nach `kursbuch/style.css`. **Abnahme: Screenshots vor und nach dem Umbau sind deckungsgleich.**

### 5.2 Plakat – laut, hart, schwarz auf Farbe
- **Schrift:** Archivo (eine Familie). Display 800, schmal (Breite ~75), Versalien, enge Laufweite. Text 400–600, normale Breite.
- **Farbe:** helle Markenfläche Gelb (~`#ffd500`) mit schwarzer Schrift; Signal Rot (~`#e10600`); Neutrale fast Schwarz-Weiß. Aktionsfarbe ist Schwarz (gelbe Links erreichen nie 4,5:1).
- **Form:** Radius 0, Chips und Badges eckig, Linien 3 px schwarz.
- **Kachel:** weiße Fläche, 3-px-Kante, kein Schatten. Top-Job auf Gelb.
- **Tafel:** harte Tabelle, schwarzer Kopf mit weißen Versalien. **Header:** Gelb mit schwarzer Unterkante.
- **Bewegung:** keine Einstiegsanimation der Tafel; Hover als harter Wechsel (`--transition-state: 0ms`).

### 5.3 Weich – ruhig, freundlich, mit Tiefe
- **Schrift:** Display Bricolage Grotesque 700, Text Figtree.
- **Farbe:** Waldgrün (~`#1f5c45`) als Marke und Aktion, Signal Koralle (~`#e2604a`), warm getönte Neutrale auf hellem Grund (kein Creme).
- **Form:** Radius 16 px (Kacheln 24 px, ersatzweise 20), Pillen rund, Linien 1 px und selten.
- **Kachel:** helle Fläche mit getöntem zweiteiligem Schatten, keine Kante; Hover hebt den Schatten eine Stufe. Top-Job auf Grün.
- **Tafel:** helle Karte mit Schatten. **Header:** hell, Button grün.
- **Bewegung:** Tafelzeilen blenden gestaffelt ein (opacity + 8 px, 300 ms).
- **Risiko:** 24 px Radius an großen Kacheln (1.8 „extremer Radius“) – am Screenshot entscheiden.

### 5.4 Leitstand – dunkel, technisch, dicht
- **Schrift:** Display und Ziffern IBM Plex Mono 500/600, Text IBM Plex Sans.
- **Farbe:** ganze Seite dunkel (Blaugrau, L ~0,19), zwei bis drei Flächenstufen; gedeckter Bernstein (~`#e9b04a`) als Aktion und Signal, Button mit dunkler Schrift. `dark: true`.
- **Form:** Radius 2 px, Haarlinien, Kanten statt Flächen.
- **Kachel:** transparent mit 1-px-Kante, Hover-Kante Bernstein; Top-Job eine Stufe heller plus Marker.
- **Tafel:** bleibt dunkel, Terminal-Charakter. **Header:** dunkel mit Haarlinie.
- **Bewegung:** Fallblatt bleibt.
- **Risiko:** Mono ist breit (~0,6 em je Zeichen) → kleinere Headline-Skala (H1 ~28–52 px) und Silbentrennung; Test mit „Anwendungsentwicklung“ bei 360 px. Abweichung von 1.3.8 (Dunkel als Dauerzustand) und Nähe zu Reflex-Look (b) werden vermerkt.

### 5.5 Editorial – Papier, Serif, eine Druckfarbe
- **Schrift:** Display Source Serif 4 (optische Größe, 600, keine Kursiven), Text Source Sans 3 (vorhanden).
- **Farbe:** neutrales Papierweiß, Text fast Schwarz, **eine** Farbe: Ochsenblut (~`#8c1c2b`) für Marke, Aktion und Signal. `--destructive` wird im Farbton abgesetzt.
- **Form:** Radius 2 px, Haarlinien als Hauptgliederung, kein Schatten.
- **Kachel:** keine Fläche; oben 2-px-Linie in Textfarbe, Top-Job mit Linie in Ochsenblut.
- **Tafel:** helle Tabelle mit Haarlinien. **Header:** Papier mit Haarlinie.
- **Bewegung:** nur die H1 blendet ein.
- **Risiko:** nah an Reflex-Look (c); abgesetzt durch kaltes Papier statt Creme und dunkles Rot statt Terrakotta.

**Für alle:** Fokusring ≥ 3:1 auf jeder Fläche; Haupt-CTAs 48 px; ein gefüllter Primär-Button pro Viewport; Linienband im Header und Halte-Linie im Ablauf bleiben als Elemente, Strichstärke, Punktform und Farbe kommen aus dem Preset.

## 6 Themer

- Neues Feld **„Stil“** oben im Panel, gespeist aus der Registry (Name + eine Zeile Beschreibung).
- Preset-Wechsel: setzt `data-style` (und bei `dark: true` die Klasse `.dark`), stellt Farbregler und Radius auf die Standardwerte des Presets.
- Farbanpassungen werden **je Preset** gespeichert. Neues Format im `localStorage` (Schlüssel bleibt `kursbuch-theme`): `{ style, overrides: { <id>: { brand, signal, card, radius } } }`. Ein alter, flacher Eintrag wird als Anpassung von Kursbuch übernommen.
- Das Restore-Script im `<head>` (`app.vue`) setzt zusätzlich Attribut und Klasse, damit beim Neuladen nichts aufblitzt.
- Nur im Dev-Modus: `?style=<id>` in der URL wählt ein Preset – für das Screenshot-Skript und zum Zeigen.
- „Zurücksetzen“ geht auf die Standardwerte des aktiven Presets. „CSS kopieren“ liefert die Token-Zeilen für dessen `style.css` plus die Zeile für `nuxt.config.ts`.
- Die Kontrast-Ampel misst weiter den echten Zustand, jetzt über die Rollenflächen (`surface-header`, `surface-board`, `surface-highlight`, `tile`, `tile-featured`), damit die Beschriftungen auch stimmen, wenn die Tafel hell ist.
- Das Panel selbst bleibt stilneutral (eigene feste Palette).

## 7 Prüfung

1. **Rechnen:** `node scripts/contrast.mjs --style <id>` – je Preset ein Rezept mit denselben L/C-Werten wie in der `style.css`; Pflicht-Paare aus Research 2.3 plus Gamut. Ergebnis und verbotene Kombinationen ins `konzept.md`.
2. **Messen:** neues Skript `scripts/check-styles.mjs` (CDP wie `screenshot.mjs`): prüft Vollständigkeit der Variablen je Preset und liest im Browser dieselben Kontraste wie die Ampel. Fängt ab, wenn Rezept und CSS auseinanderlaufen.
3. **Screenshots:** 5 Presets × 3 Seiten × 360/768/1280/1536 px mit Überlauf-Check. Kritisch: längste Jobtitel bei 360 px in Versalien (Plakat) und Mono (Leitstand).
4. **Regression:** Kursbuch vor/nach dem Umbau deckungsgleich.
5. `npx nuxt typecheck`, `npx nuxt build`; kein Request an Google Fonts.

## 8 Reihenfolge

1. Vorher-Screenshots von Kursbuch.
2. `contract.css`, Registry, Templates auf Rollen umstellen, Werte nach `kursbuch/style.css`. Regression prüfen.
3. Themer: Stilwahl, Speicherformat, Restore-Script, `?style=`.
4. **Plakat** als härtester Test des Vertrags (helle Markenfläche, Radius 0, Versalien). Fehlt dem Vertrag etwas, wird er hier einmal ergänzt – für alle Presets.
5. Weich, Leitstand, Editorial – je Preset: `konzept.md` → `style.css` → prüfen.
6. `docs/design-konzept.md`: Abschnitt „Stil-Presets“ (Vertrag, Abweichung von 2.1, Anleitung „neues Preset anlegen“). `scripts/contrast.mjs` und `check-styles.mjs` dort als Werkzeuge nennen.

## 9 Späterer Ausbau (nicht jetzt)

- **Komponenten-Varianten (B):** Ein Preset-Ordner kann `components/` bekommen (z. B. ein anderer Hero statt der Tafel); die Registry erhält dafür ein Feld. Der Token-Vertrag bleibt unverändert.
- **Kundenprojekte:** Preset-Ordner kopieren, eigene Inhalte und Bilder dazu, nur dieses eine Preset importieren (Build-Zeit statt `data-style`-Auswahl). Dann gilt auch Methode 2.1 wieder vollständig: Der Stil wird aus dem Gegenstand des Kunden abgeleitet.

## 10 Offene Punkte

- Alle Hex-Startwerte und die Headline-Skalen von Plakat und Leitstand sind ungerechnet bzw. ungetestet.
- Weich: 24 oder 20 px Kachelradius.
- Bricolage Grotesque und Archivo bringen Zusatzachsen mit; nur die benötigten Achsendateien importieren (Dateigröße prüfen).
- Das Verzeichnis ist kein Git-Repository; die Spec ist nicht committet.

## 11 Nachträge aus der Umsetzung (20.09.2026)

Der Text oben bleibt so stehen, wie er beim Entwurf geschrieben wurde. Was die Umsetzung anders oder zusätzlich ergeben hat:

- **Der Vertrag hat 74 Variablen.** Neu gegenüber dem Entwurf ist `--type-board-size` (Gruppe „Typo-Rollen“): Die Stellenspalte der Tafel ist schmal, und breite Display-Schriften brauchen dort eine Stufe weniger. Werte: Kursbuch und Plakat `--text-f-xl`, Editorial `--text-f-lg`, Weich und Leitstand `1rem`.
- **Aus dem `.dark`-Block in `app/assets/css/tailwind.css` musste `--card` weichen.** Der Block steht hinter den Preset-Importen und schlug bei gleicher Spezifität den gemeinsamen Alias `--card: var(--theme-card)` aus `contract.css` – ein dunkles Preset bekam so still die Karten-Stufe des `.dark`-Blocks statt der eigenen. Kein Preset liest aus dem Block einen Wert; `"dark": true` schaltet nur die `dark:`-Varianten der shadcn-Komponenten.
- **Neue Hook-Klasse `badge-dot`** am Punkt im Top-Job-Badge. `contract.css` gibt ihr keine Regel: Normalerweise trägt der Punkt `bg-signal`. Presets, in denen Signal- und Aktionsfarbe dieselbe sind (Leitstand, Editorial), färben ihn auf `var(--primary-foreground)` um, weil er sonst auf dem gleichfarbigen Badge unsichtbar ist.
- **`--signal-on-brand` je Preset:** Kursbuch und Leitstand das geklemmte Signal, Plakat das helle Signal, Weich einen eigenen hellen Wert (helle Koralle – die Eingabe schafft auf dem dunklen Grün nur 2.25:1), Editorial die Textfarbe der Markenfläche (Signal = Brand, aufgehellt nur 2.07:1).
- **Tafel-Padding-Regel in Editorial:** Die Tafel hat dort keinen Kasten, nur zwei Linien. Der Innenabstand der Vorlage würde den Tafeltext gegenüber seinen eigenen Linien einrücken, deshalb setzt das Preset `padding-inline: 0` auf `board-head`, `board-cols`, `board-foot` und die Zeilenlinks.
- **Geänderte Dateien unter `app/components/ui/`:** `badge/index.ts` (`rounded-full` → `rounded-pill`), `button/index.ts` (Variante `outline`: `border` → `border-(length:--line-weight)`), `avatar/Avatar.vue` und `AvatarFallback.vue` (`rounded-full` → `rounded-dot`). In Kursbuch ändert das nichts (1 px, 9999 px). Die **Kante** des Badges bleibt bewusst bei Tailwinds festem `border`: Mit der Signaturstärke eines Presets (Plakat 3 px) trägt der Rahmen an einem 22–30 px hohen Tag so stark auf wie die Schrift.
- **Rezept und CSS werden von Hand synchron gehalten.** `check-styles.mjs --url` misst die echten Kontraste im Browser und fängt damit zu schwache Paare ab; einen Abgleich zwischen `scripts/style-recipes.mjs` und `app/styles/<id>/style.css` gibt es nicht. Wer einen L/C-Wert ändert, ändert beides und rechnet das `konzept.md` neu.
- **`--shadow-lg` und `--shadow-xl`** zeigen in `@theme inline` auf `--style-shadow-md`. shadcn-Overlays (Sheet, Dialog, Menüs) benutzen diese Stufen; ohne die Zuordnung hätten sie Tailwinds Standardschatten – in einem Preset ohne Schatten also einen, den es nicht geben darf.
- **Der Themer wird im Build gar nicht erst registriert.** `import.meta.dev` und `v-if` verhindern nur die Ausführung; der Komponenten-Scanner baut den Chunk trotzdem und Nuxt lädt ihn per `<link rel="prefetch">` vor. Der Hook `components:extend` in `nuxt.config.ts` nimmt `ThemePanel` in Produktions-Builds aus der Registrierung.
- **Rollenprüfung in `check-styles.mjs`:** Jede der fünf Flächenrollen braucht eine Regel, die sie anspricht **und** ihr per `@apply surface-ink|surface-brand|surface-plain` eine Flächenart zuweist. Eine Rolle darf bewusst ohne Flächenart bleiben, wenn die Datei das mit einem Kommentar `rolle-ohne-flaeche: <rolle>` erklärt (so in Editorial für `tile-featured`).
- **Prüfumgebung:** `scripts/lib/cdp.mjs` kopiert die Trennwörterbücher ins Headless-Profil (sonst bleibt `hyphens: auto` wirkungslos), `h1–h3` haben zusätzlich `overflow-wrap: anywhere` als Sicherheitsnetz, und `scripts/screenshot.mjs` wartet nach dem Laden immer auf `document.fonts.ready`.
