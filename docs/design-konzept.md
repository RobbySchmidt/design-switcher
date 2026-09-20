# Designkonzept Kursbuch (Arbeitgeberseite)

Erarbeitet nach `docs/design-research.md`. Stand: 20.09.2026, zweite Fassung („mehr Farbe“, siehe Abschnitt 2); dritte Fassung: Stil-Presets, siehe Abschnitt 13.
Dieses Projekt ist **nicht** der Directus-Starter, den die Research in Kapitel 3 beschreibt: Es gibt kein CMS, kein `BlockSection`, kein `mutedClass()`. Übernommen sind die Prinzipien dahinter (Flächenrollen, `paddingBottom`-Regel nach Geometrie, Sekundärtext als eigener Ton statt Opacity) – umgesetzt in `PageSection.vue` und der Utility `surface-ink`.

## 1 Leitidee

**Gegenstand:** Kursbuch ist eine erfundene Firma, die Fahrplansoftware für Verkehrsbetriebe baut. Auf die Seite kommen Leute, die einen Job suchen. Die eine Aufgabe der Seite: Sie sollen die offenen Stellen ansehen.

**Haltung:** Informationsdesign des öffentlichen Verkehrs – Abfahrtstafel, Netzplan, Haltestellenschild. Alles dort ist auf schnelles Erfassen gebaut: klare Spalten, Tabellenziffern, schmale Schrift für lange Wörter, eine Signalfarbe nur für das, was jetzt zählt. Das passt zu einer Stellenseite, auf der Leute scannen und vergleichen.

**Die eine Signatur:** die **Abfahrtstafel** im Hero (`DepartureBoard.vue`). Offene Stellen stehen dort wie Abfahrten, das Startdatum der Stelle ist die Abfahrtszeit, ein roter Punkt markiert, was „sofort“ losfährt. Sie ist die einzige Dunkelfläche und trägt die einzige orchestrierte Bewegung der Seite. Zwei leise Echos: der Bewerbungsablauf als Linie mit Haltestellen, das Signet im Header als Haltestellenkreis.

**Gegenprobe:** Eine beliebige Software-Arbeitgeberseite käme nicht auf Tafel und Linienverlauf; die Idee hängt am Gegenstand. Sie ist keiner der Reflex-Looks aus 1.8 (kein Creme+Serif, kein Schwarz+Neon, kein Zeitungslayout). Bewusst verworfen: der zuvor gebaute „Awesomic“-Look (Zink-Grau, 36-px-Radien, eine Schrift für alles) – das war ein fremder Default, kein aus dem Gegenstand abgeleiteter Stil. Ebenfalls verworfen: vollflächig blaue Top-Job-Kacheln (Aktionsfarbe als Fläche, siehe 3).

**Trägt die Idee alle Inhalte?** Ja: Stellenliste, Detailseite und Landingpage sind alle „Fahrgastinformation“. Die Tafel erscheint nur auf der Landingpage; die anderen Seiten übernehmen nur Schrift, Ziffern und den roten Punkt.

## 2 Farbableitung

Es gibt keine Assets zum Messen (keine Illustration, kein Logo). Hue-Anker sind die zwei vorgegebenen Markenfarben, umgerechnet mit `scripts/contrast.mjs`:

| Quelle | Hex | OKLCH | wird zu |
|---|---|---|---|
| Marken-Blau (Vorgabe) | `#052f66` | `0.315 0.107 257.6` | `--primary`; sein Hue 257 tönt **alle** Neutralen |
| Marken-Rot (Vorgabe) | `#f42b4f` | `0.628 0.230 18.5` | `--signal` |
| Tram-Gelb (Fotos) | – | `0.78 0.15 85` | nur `--chart-3`, kommt in der UI nicht vor |

**Bewusste Abweichung von der Research (Wunsch des Projektinhabers):** Die erste Fassung hielt sich streng an 1.1.9/1.3.1 („Aktionsfarbe nur an Aktionen“, kräftige Fläche als Ausnahme) und wirkte dadurch weiß-grau. Die zweite Fassung setzt beide Markenfarben sichtbar ein – aber nur dort, wo es gerechnet trägt:

- **Blau** ist jetzt Aktionsfarbe **und** Markenfarbe: Buttons, alle Textlinks, Icons in Kachel und Kopf, Kennzahlen, Benefit-Werte, Schrittnummern, aktiver Filterchip, das Top-Job-Badge. Dazu als **Markenfläche** (`surface-brand`): die Regel-Sektion in der Seitenmitte, der Footer und die Karte „Auf einen Blick“. Die Neutralen sind kräftiger blau getönt (Chroma 0.011–0.03 statt 0.006–0.014).
- **Rot** bleibt Signal, hat aber mehr Auftritte: ein Wort in der H1 („Fahrpläne“), die Linie samt Halten im Bewerbungsablauf, die Marker über den sechs Regeln, der Punkt im Top-Job-Badge, „sofort“ auf der Tafel, das Signet. Regel: Rot nur als **Grafik** oder als **großer Text ab 24 px** (dort genügt 3:1). Kleiner roter Text und weiße Schrift auf Rot bleiben verboten.
- Preis der Abweichung: Der gefüllte Primär-Button ist nicht mehr das einzige Blaue im Viewport. Er bleibt trotzdem die größte zusammenhängende blaue Form neben der Headline; auf Markenflächen wird er hell und hebt sich dort als Form mit 12.9:1 ab.

## 3 Token-Palette mit Kontrastnachweis

Der vollständige Block steht in `app/styles/kursbuch/style.css` (OKLCH mit Hex-Kommentar, alle Werte im sRGB-Gamut) – seit dem Umbau auf Stil-Presets nicht mehr im `:root`-Block von `tailwind.css`, siehe Abschnitt 13. Nachweis: `node scripts/contrast.mjs --style kursbuch`.

Projekt-Tokens über die shadcn-Variablen hinaus: `--signal`, `--ink`, `--ink-foreground`, `--ink-muted`, `--ink-border` (in `@theme inline` registriert → `bg-signal`, `bg-ink` …). `--ink` existiert, weil die Dunkelfläche **nicht** die Aktionsfarbe sein darf (Rollenkonflikt aus Research 3.1).

| Paar | Verhältnis | Ziel |
|---|---|---|
| `foreground` auf background / card / secondary / muted / accent | 16.0 / 17.1 / 13.9 / 14.8 / 14.1 | ≥ 4.5 |
| `muted-foreground` auf denselben Flächen | 6.6 / 7.0 / 5.7 / 6.1 / 5.8 | ≥ 4.5 |
| `primary` als Link auf denselben Flächen | 12.1 / 12.9 / 10.5 / 11.2 / 10.7 | ≥ 4.5 |
| `primary-foreground` auf `primary` | 12.5 | ≥ 4.5 |
| `primary-foreground` auf `primary/90` (Button-Hover) über allen hellen Flächen | 9.4 – 9.7 | ≥ 4.5 |
| `destructive` als Text auf hellen Flächen; Weiß auf `destructive` | 5.6 – 6.8; 6.9 | ≥ 4.5 |
| `input`-Kontur auf hellen Flächen | 3.2 – 3.9 | ≥ 3 |
| `ring` mit 50 % Alpha (Fokus-Halo) auf hellen Flächen | 3.2 – 3.4 | ≥ 3 |
| `signal` als Grafik auf hellen Flächen / auf `ink` | 3.2 – 3.9 / 4.6 | ≥ 3 |
| `ink-foreground` / `ink-muted` auf `ink` | 16.9 / 9.7 | ≥ 4.5 |
| heller Fokus-Halo (50 %) auf `ink` | 4.9 | ≥ 3 |
| heller Button als Form auf `ink` | 17.9 | ≥ 3 |
| `primary-foreground` / `brand-muted` auf der Markenfläche (`primary`) | 12.5 / 8.6 | ≥ 4.5 |
| heller Button als Form / heller Fokus-Halo (50 %) auf der Markenfläche | 12.9 / 4.3 | ≥ 3 |
| `signal` als Grafik auf der Markenfläche | 3.3 | ≥ 3 |
| `signal` als **großer** Text (≥ 24 px) auf background / card / muted | 3.7 / 3.9 / 3.4 | ≥ 3 |
| `border` auf background / card, `ink-border` auf `ink` (dekorativ) | 1.30 / 1.39 / 1.54 | ~1.2–1.4 |

**Verbotene Kombinationen** (gerechnet und durchgefallen):
- `signal` als **kleiner** Text (< 24 px) auf hellen Flächen: 3.9 – auch nicht als Badge-Schrift. Auf `secondary`/`accent` auch groß nicht (3.2–3.3 wären knapp bestanden, dort aber nicht vorgesehen).
- Weiß auf `signal`: 4.0 – kein roter Button, kein rotes Badge mit weißer Schrift.
- `signal` als kleiner Text auf `ink`: 4.6, nominell bestanden, aber WCAG 2 bewertet dunkle Paare zu freundlich → ebenfalls nicht verwenden.
- blauer Primär-Button auf `ink`: 1.4 als Form. `surface-ink` überschreibt deshalb `--primary` in seinem Scope zu einem hellen Button.

`destructive` ist ein Rostrot (Hue 38), damit Fehler nie mit dem Signalrot (Hue 18.5) verwechselt werden. Der `.dark`-Block ist zur Palette passend gefüllt (gleicher Hue, L invertiert); das Projekt bietet keinen Dark Mode an, die Hauptpaare dort sind **nicht** nachgerechnet.

### Theme: drei Eingaben, alles andere abgeleitet

Seit dem Themer gibt es nur noch **drei Farbeingaben** plus den Radius. Sie stehen zusammen mit allen Ableitungen im Block `:root[data-style="kursbuch"]` in `app/styles/kursbuch/style.css`; jedes andere Preset hat seine eigene Datei mit denselben Variablen (Abschnitt 13):

| Eingabe | Standard | steuert |
|---|---|---|
| `--theme-brand` | `#052f66` | Markenfläche (`--brand`), Aktionsfarbe (`--primary`) und den **Farbton aller Neutralen** (Grundfläche, Kacheln, Text, Linien, Tafel) |
| `--theme-signal` | `#f42b4f` | `--signal` (helle Flächen) und `--signal-on-dark` (Tafel, Markenfläche) |
| `--theme-card` | fast Weiß im Farbton des Brands | `--card`, `--popover`. Muss hell bleiben, der Text darauf ist dunkel |
| `--radius` | `0.5rem` | alle Rundungen (sm/md/lg/xl); Pillen bleiben rund |

Die Ableitung passiert im Browser mit relativer Farbsyntax (`oklch(from var(--theme-brand) 0.972 0.011 h)`): Helligkeit und Sättigung jeder Rolle sind fest, nur der Farbton kommt vom Brand. Drei Sicherungen greifen bei anderen Farbwahlen (bei den Standardfarben greift keine):

- **Luminanz-Klemmen** über `color(from … xyz-d65 …)`: `y` ist dort genau die WCAG-Luminanz. `--primary` ≤ 0.13 (Link ≥ 4.5:1 auf der Kachel), `--signal` ≤ 0.22 (Grafik ≥ 3:1 auf der Kachel), `--signal-on-dark` ≥ 0.19. Alle drei Kanäle werden mit demselben Faktor skaliert, der Farbton bleibt.
- **Hell/Dunkel-Schalter** für die Markenfläche: `clamp(0, (0.6 - l) * 1000, 1)` ergibt 1 bei dunklem und 0 bei hellem Brand. Daraus folgen `--brand-foreground`, `--brand-muted`, `--brand-border`, `--brand-action`: Bei einem hellen Brand werden Text und Button auf der Markenfläche dunkel.
- **Das Signal löst je Fläche anders auf:** `surface-ink` und `surface-brand` setzen in ihrem Scope `--signal: var(--signal-on-dark)`.

Was kein Automatismus lösen kann, meldet die Kontrast-Ampel: ein Brand im Bereich L 0.57–0.61 (weder heller noch dunkler Text erreicht 4.5:1), ein Signal auf einem **hellen** Brand, zwei Farben mit zu ähnlicher Luminanz.

**Werkzeuge:** Das Themer-Panel (`ThemePanel.vue`, unten links, in Dev-Server und Build eingebunden) setzt die vier Variablen live auf `<html>`, speichert sie im `localStorage` und **misst** die vom Browser aufgelösten Farben über ein 1×1-Canvas – die Ampel zeigt also den echten Zustand, nicht eine zweite Rechnung. „CSS kopieren“ liefert die Zeilen für die Preset-Datei. `node scripts/contrast.mjs --style kursbuch ["#brand" "#signal"]` rechnet dasselbe Theme vollständig durch (mehr Paare als das Panel).

**Bekannt und kosmetisch:** `nuxt build` meldet 40 Warnungen `[vite:css][postcss] Lexical error` (vor den Presets waren es vier – jedes Preset mit Luminanz-Klemmen bringt ein paar dazu). Der `calc`-Parser des Minifiers kennt die relative Farbsyntax und ihre Kanal-Schlüsselwörter `x y z` nicht; er lässt die betroffenen Ausdrücke unverändert stehen, statt sie zu kürzen. Das gebaute CSS ist geprüft: jeder Preset-Block genau einmal enthalten, keine doppelten Deklarationen, alle Ausdrücke intakt. Browser: relative Farbsyntax braucht Chrome/Edge 119+, Safari 16.4+, Firefox 128+.

## 4 Typografie

**Paarung:** Display **Barlow Semi Condensed** (500/600) – eine DIN-nahe Grotesk aus der Welt der Schilder und Kennzeichen; die schmale Weite ist funktional, weil deutsche Komposita („Anwendungsentwicklung“, 21 Zeichen) sonst mobile Headlines sprengen. Text/UI **Source Sans 3** (variabel) – ruhig, humanistisch, sehr lesbar bei 16–18 px. Verwandte Haltung (beides nüchterne Informationsschriften), Kontrast in der Rolle (schmal und technisch gegen offen und weich).

**Rollenregel:** Display nur in `h1`–`h3` (automatisch über `@layer base`), auf der Abfahrtstafel und für Kennzahlen (`font-heading`). Alles andere ist Source Sans. Accordion-Fragen sind technisch `h3`, bekommen aber bewusst `font-sans`, weil sie Bedienelemente sind.

**Einbindung:** `@fontsource-variable/source-sans-3` und `@fontsource/barlow-semi-condensed` (500, 600), importiert in `tailwind.css`. Kein Request an Google – der frühere `@import` von `fonts.googleapis.com` ist entfernt (LG München I, 3 O 17493/20). Keine Kursiven geladen.

| Rolle | Klasse | px | Schrift | Zeilenhöhe | Laufweite |
|---|---|---|---|---|---|
| H1 Landingpage | `text-f-7xl` | 45–72 | Display 600 | 1.04 | −0.015 em |
| H1 Unterseiten, Schluss-H2 | `text-f-6xl` | 39–60 | Display 600 | 1.05 | −0.015 em |
| H2 | `text-f-5xl` | 32–48 | Display 600 | 1.1 | −0.01 em |
| H3 groß (Teams, Detail-Abschnitte) | `text-f-3xl` | 25–30 | Display 600 | 1.2 | 0 |
| H3 klein (Kachel, Regeln, Halte) | `text-f-2xl` | 18–24 | Display 600 | 1.2 | 0 |
| Lead | `text-f-xl` | 16–20 | Text 400 | 1.5 | 0 |
| Fließtext | `text-f-lg` (body) | 16–18 | Text 400 | 1.55 | 0 |
| UI/Meta | `text-base` / `text-sm` | 16 / 14 | Text 400–600 | 1.5 | 0 |
| Tafel-Spaltenköpfe | `text-xs uppercase` | 12 | Text 600 | – | +0.08 em |

Maximalbreiten: Lesetext `max-w-[65ch]`, Lead ~`60ch`, Headlines über `max-w-[16–22ch]`. Basis: `h1–h3` mit `text-wrap: balance` und `hyphens: auto` (dafür `lang="de"` in `nuxt.config.ts`), `p, li` mit `text-wrap: pretty`. Mikrotypografie: Halbgeviertstrich in Spannen, geschützte Leerzeichen vor „€“ (`formatSalary`).

**Test bei 360 px:** Der längste Titel („Ausbildung Fachinformatiker Anwendungsentwicklung“) und alle H1 brechen ohne Überlauf (per CDP-Emulation geprüft, `scrollWidth == clientWidth`).

## 5 Raum, Raster, Rhythmus

- **Container:** eine Utility `container-page` (max. 76rem, 16 px Rand, ab `md` 32 px) – identische Kanten in Header, allen Sektionen, Footer.
- **Sektionen:** `PageSection` setzt immer `pt-f-24`, `pb-f-24` nur mit `pad-bottom`. Regel: andere Fläche danach → `true`; gleiche Fläche → `false`; letzte vor dem Footer → `true`.
- **Drei Ebenen:** in Komponenten 4–24 px (`gap-1.5` … `p-6`); zwischen Komponenten `mb-f-12` (Sektionskopf → Inhalt), `gap-f-8` (Kartenraster), `gap-f-12`/`gap-f-16` (Split-Spalten); zwischen Sektionen `f-24`.
- **Raster:** Splits asymmetrisch (7/5, 5/7, 4/8, 8/4), Kartenraster 1 → 2 → 3.
- **Muster-Abfolge Landingpage:** Split mit Tafel → Zahlenband → Split mit Foto und Zeilenliste → zweispaltige Regelliste → Bildband → Split mit Tabelle → Linienverlauf → Split mit Accordion → Kartenraster → linksbündiger Schluss. Nie zweimal dasselbe Muster hintereinander, genau **ein** Dreier-Kartenraster.

## 6 Flächen

| Fläche | Klasse | Rolle |
|---|---|---|
| `background` | `bg-background` | Grundfläche, Standard |
| `card` | `bg-card` | hellere Wechselfläche, Header, Footer, Karten |
| `muted` | `bg-muted` | Tönung unter Kartenrastern, damit Karten sich abheben |
| `ink` | `surface-ink` | Dunkelfläche – **nur** die Abfahrtstafel |
| `brand` | `surface-brand` | Markenfläche im Blau: Regel-Sektion, Footer, Karte „Auf einen Blick“ |

Templates benutzen nur noch Flächen**rollen** (`surface-header`, `surface-footer`, `surface-board`, `surface-highlight`, `tile-featured`); in Kursbuch stehen dahinter die Flächenarten `brand` bzw. `ink`.

`surface-ink` überschreibt in ihrem Scope `--foreground`, `--muted-foreground`, `--border`, `--ring` und `--primary` (Prinzip wie `.dark`). Darin stimmen `text-muted-foreground`, Linien, Fokusring und der Primär-Button automatisch. Keine hellen Karten hineinsetzen. `surface-brand` arbeitet genauso (eigener Sekundärton `--brand-muted`, `--brand-border`, heller Button und Fokusring). Der Footer ist Markenfläche; die Sektion davor ist immer hell, zwei kräftige Flächen stoßen nie aneinander. Die Markenfläche erscheint pro Seite höchstens zweimal (Seitenmitte + Footer).

## 7 Bildwelt

Keine Illustrationen (es gibt keine) – damit entfallen Multiply-Blend und alle Illustrationsregeln. Fotos nur aus der Welt des Gegenstands: **gelbe Berliner Straßenbahnen**, einheitliche Stimmung; bewusst keine generischen Büro-Stockfotos. Zwei Einsätze:

| Datei | Einsatz | Format |
|---|---|---|
| `tram-fernsehturm.jpg` (Julia Joppien, Unsplash) | Sektion „Woran du arbeitest“ | 4:5, `rounded-xl`, feine Innenkante (heller Himmel auf heller Fläche) |
| `friedrichstrasse-regen.jpg` (Birk Enwald, Unsplash) | Bildband in der Seitenmitte = visueller Höhepunkt | 21:9, mobil 4:3, randlos, kein Text auf dem Bild |

Immer `width`/`height`, `loading="lazy"`, beschreibender Alt-Text. Icons: nur lucide, Größen 16/18/20, nie in farbigen Kacheln. Das Häkchen bei Benefits bleibt, weil es „ist enthalten“ aussagt; Aufgabenlisten haben normale Bullets.

## 8 Komponenten-Einsatz

- **Button:** pro Viewport ein gefüllter Primär-Button. Landingpage: „Offene Stellen ansehen“ (Hero, über dem Kartenraster). Detailseite: „Jetzt bewerben“. Der Header-Button trägt dieselbe Beschriftung, ist aber `outline`, damit er dem gefüllten Button im Inhalt nicht Konkurrenz macht. Haupt-CTAs `h-12 px-7 text-base` (48 px), Header `h-11`. Sekundäraktion als unterstrichener Link oder `outline`.
- **Card:** Farbfläche statt Kante (dritte Fassung, Wunsch des Projektinhabers: keine weißen Kacheln), kein Schatten; `rounded-xl` (12 px), `p-6`. Stellen-Kacheln sind hellblau (`secondary`: Text 13.9, Sekundärtext 5.7, Icons/Links 10.5), Top-Jobs stehen auf der Markenfläche (`surface-brand`). Damit die farbigen Kacheln einen ruhigen Grund haben, stehen die Kartenraster auf `background` oder `card`, nie auf `muted`. Karten nur für Stellen und „Auf einen Blick“. Teams, Regeln, Benefits, Schritte, Ansprechperson sind **keine** Karten. Hover: Kontur wechselt auf Blau, Pfeil rückt 4 px (200 ms, ease-out). Ausnahme zur Kanten-Regel: „Auf einen Blick“ ist eine Markenfläche ohne Kante.
- **Badge:** Tags als `outline` (transparent, `text-foreground`). „Top-Job“ ist das Standard-Badge im Blau mit rotem Punkt – die einzige Stelle, an der beide Markenfarben in einem Element zusammenkommen.
- **Accordion:** `type="multiple"`, ganze Zeile klickbar.
- **Radius:** `--radius: 0.5rem` → sm 4 · md 6 (Buttons, Inputs) · lg 8 · xl 12 (Karten, Bilder, Tafel); Pillen nur für Filterchips und Tags.
- **Schatten:** `--shadow-xs/sm/md`, im Marken-Blau getönt. Ruhender Inhalt ist flach; `md` nur für den Skip-Link und Overlays.

**Geänderte Dateien unter `app/components/ui/`:**

- `button/index.ts`: Der `shadow-cta` aus dem Awesomic-Versuch ist entfernt. Die Variante `outline` liest ihre Linienstärke aus dem Vertrag (`border-(length:--line-weight)` statt Tailwinds festem `border`) – in Kursbuch weiterhin 1 px, in Plakat 3 px.
- `badge/index.ts`: Die `outline`-Variante steht wieder auf dem neutralen shadcn-Original (`text-foreground`, kein Hintergrund); die zwischenzeitliche Variante `bg-background text-primary` ist zurückgenommen, die Überschreibungen an den Verwendungen sind entfernt. Die Form kommt aus dem Preset (`rounded-full` → `rounded-pill`). Die Kante bleibt bewusst bei Tailwinds `border`, also fest 1 px: Ein Badge ist 22–30 px hoch, mit der Signaturstärke eines Presets (in Plakat 3 px) trägt der Rahmen so stark auf wie die Schrift darin. Die Tags werden dadurch zu kleinen Kästen statt zu Etiketten.
- `avatar/Avatar.vue` und `avatar/AvatarFallback.vue`: `rounded-full` → `rounded-dot`, damit der Avatar der Punktform des Presets folgt (Kursbuch 9999 px, also unverändert; Plakat und Leitstand quadratisch).

## 9 Motion

Die eine orchestrierte Bewegung: der **Hero-Einstieg**. Die H1 blendet ein (`animate-in fade-in slide-in-from-bottom-2 duration-500`), danach klappen die Tafelzeilen gestaffelt auf (420 ms, 90 ms Versatz, `rotateX` wie eine Fallblattanzeige). Reines CSS, nur `opacity`/`transform`, sichtbar ohne JavaScript, mit „Bewegung reduzieren“ komplett aus. Sonst nur Zustandsübergänge ≤ 200 ms ease-out (Hover-Kontur, Pfeil, Seitenwechsel per `opacity`). Negativliste: keine Scroll-Reveals, kein Bild-Zoom, kein pulsierender Punkt, kein Autoplay, kein Parallax.

## 10 Sektion für Sektion (Landingpage `/`)

| # | Sektion | Fläche | pb |
|---|---|---|---|
| 1 | Hero: Versprechen + Aktion + Abfahrtstafel | background | nein |
| 2 | Zahlenband (Beweis) | background | ja |
| 3 | Woran du arbeitest (Angebot) | card | ja |
| 4 | Sechs Regeln (Vertrauen) – Farbhöhepunkt | **brand** | ja |
| 5 | Bildband (Emotion, Höhepunkt) | Foto | – |
| 6 | Was du bekommst (Angebot) | background | nein |
| 7 | Vier Halte bis zum Angebot (Ablauf) | background | nein |
| 8 | Häufige Fragen (Einwände) | background | ja |
| 9 | Gerade ausgeschrieben (Aktion) | card | ja |
| 10 | Nichts Passendes? (ruhiger Schluss) | background | ja |

„Stimmen“ aus der Standard-Dramaturgie fehlen bewusst: Für eine erfundene Firma gäbe es nur erfundene Zitate, und Social Proof ohne echte Quelle schadet (Research 1.7.5).

- **Header:** sticky auf der Markenfläche (Klammer mit dem Footer). Die Navigation ist ein **Linienband** wie über der Straßenbahntür: vier Anker als Haltestellen auf einer Linie. Beim Scrollen färbt sich die Strecke bis zur aktuellen Sektion rot, der Halt der aktuellen Sektion ist gefüllt und trägt `aria-current`. Reine Zustandsübergänge (200 ms), ohne JavaScript eine normale Linkliste. Der Button ist der Primär-Button, der auf der Markenfläche hell wird. Unter `lg`: Signet, Wortmarke, Button („Offene Stellen“, der Rest nur für Screenreader) und ein Menü-Button, der dasselbe Linienband senkrecht in einem Sheet öffnet.
- **`/jobs`:** H1, Trefferzahl, Filterchips über die URL (`?team=…`, teilbar, 44 px hoch), Kartenraster.
- **`/jobs/[slug]`:** Kopf mit denselben Bausteinen wie die Kachel; Split 8/4 mit mitlaufender Karte „Auf einen Blick“; mobil Fakten direkt unter dem Kopf und feste Bewerben-Leiste unten; „Ähnliche Stellen“ auf `card`. Unbekannter Slug → 404.
- **Footer:** Kontakt offen sichtbar (`mailto:`, `tel:`, Zeiten), Hinweis auf das Übungsprojekt, Bildnachweise.

## 11 Umsetzungsreihenfolge (erledigt)

1 Fonts + Tokens + Schatten + Base-Typo in `tailwind.css` → 2 `PageSection`, `surface-ink`, `container-page` → 3 Fotos ausgewählt (angesehen, nicht nur Dateinamen) → 4 `JobCard`, Header, Footer → 5 Seiten → 6 Screenshots per CDP bei 360/768/1280/1536 px, Überlauf überall `nein`.

## 12 Offene Punkte / Annahmen

- **Firma, Zahlen, Regeln, Benefits, FAQ sind erfunden.** „Kursbuch“ war mein Vorschlag und ist nicht ausdrücklich bestätigt. Telefonnummer und E-Mail sind Platzhalter.
- **Geprüft (20.09.2026):** `nuxt typecheck` ohne Fehler, `nuxt build` erfolgreich; der gebaute Server liefert alle Seiten, das CSS ist vollständig (Tokens, `surface-brand`, beide Schriften, kein Request an Google Fonts), 404 für unbekannte Slugs.
- **Nicht geprüft:** Tastatur-Durchlauf, 200 % Zoom, Kontrast-Stichproben in den DevTools, der `.dark`-Block. Das dunkle Preset Leitstand benutzt den `.dark`-Block nicht, sondern eigene Tokens; kein Preset liest aus ihm einen Wert. Aus dem Block wurde die Zeile `--card` entfernt: Er steht hinter den Preset-Importen und schlug damit bei gleicher Spezifität den gemeinsamen Alias `--card: var(--theme-card)` aus `contract.css` aus, sodass ein dunkles Preset still die Karten-Stufe des `.dark`-Blocks bekam.
- **Seitenwurzel:** Jede Datei unter `app/pages/` braucht genau einen Wurzelknoten – ein HTML-Kommentar vor dem `<main>` zählt mit und bricht den Seitenübergang (`out-in`): Die nächste Seite bleibt leer (NUXT_E4004). Kommentare deshalb immer **in** das `<main>`.
- **Header-CTA:** Seit dem blauen Header ist er ein heller, gefüllter Button. Im ersten Screen stehen damit zwei gefüllte Buttons (hell im Header, blau im Hero) – Abweichung von „≤ 1 gefüllter Primär-Button pro Viewport“ zugunsten von „CTA dauerhaft im Header“ (1.7.2).
- `app/components/Icon.vue` importiert nur noch die verwendeten lucide-Icons. Ein neues Icon muss dort importiert und in die Liste eingetragen werden (im Dev-Modus warnt die Konsole, wenn eines fehlt).
- Fotos laufen über `@nuxt/image` (`<NuxtImg format="webp" sizes="…">`): WebP und `srcset` entstehen zur Laufzeit aus den JPGs in `public/images/`. Jede `sizes`-Angabe braucht einen Breakpoint-Namen (`sm:100vw`), ein nacktes `100vw` erzeugt 1-px-Bilder. Das Modul bringt `ipx` als Beta-Version (4.0.0-beta.1) mit; für statisches Hosting (`nuxt generate`) werden die Varianten beim Generieren erzeugt.

## 13 Stil-Presets

Die Seite hat fünf umschaltbare Stile: **Kursbuch** (dieses Dokument), **Plakat**, **Weich**, **Leitstand**, **Editorial**. Daten, Texte, Fotos, Sektionen und Markup sind in allen gleich – nur das Aussehen wechselt. Spec: `docs/superpowers/specs/2026-09-20-stil-presets-design.md`.

**Bewusste Abweichung von der Research (2.1):** Ein Stil wird dort aus dem Gegenstand abgeleitet. Das gilt nur für Kursbuch; die anderen vier sind Stilstudien über demselben Gegenstand. Alle prüfbaren Regeln (Kontraste, Schriftrollen, Anti-Patterns, reduzierte Bewegung) gelten für jedes Preset und sind in dessen `konzept.md` nachgewiesen.

**Aufbau:** `data-style="<id>"` auf `<html>` (Startwert in `nuxt.config.ts`, umgeschaltet über den Themer – auch im Build). `app/styles/contract.css` enthält die Rollen, die die Templates benutzen – Flächenarten (`surface-ink`, `surface-brand`, `surface-plain`), Typo-Rollen (`type-*`, darunter `type-board` mit der Tafelgröße `--type-board-size`), `.tile`, `.board-row`. `app/styles/<id>/style.css` liefert alle Werte und ordnet die Flächenrollen einer Flächenart zu. **Kein Preset erbt von einem anderen:** Jedes definiert den gesamten Variablensatz aus **74 Variablen**; `node scripts/check-styles.mjs` vergleicht sie gegen Kursbuch und meldet jede fehlende und jede unbekannte.

**Hook-Klassen** – Klassen im Markup, an die ein Preset Regeln hängen darf: `surface-header`, `surface-footer`, `surface-board`, `surface-highlight`, `tile`, `tile-featured`, `board-head`, `board-cols`, `board-row`, `board-foot`, `badge-dot`. Die fünf Flächenrollen (`surface-*`, `tile-featured`) muss jedes Preset einer Flächenart zuordnen, der Rest ist freiwillig. `badge-dot` sitzt am Punkt im Top-Job-Badge: Normalerweise trägt er `bg-signal`; Presets, in denen Signal- und Aktionsfarbe dieselbe sind (Leitstand, Editorial), färben ihn dort auf `--primary-foreground` um, weil er sonst auf dem gleichfarbigen Badge verschwindet.

**In Templates gilt:** keine festen Stilwerte. Überschriften über `type-*`, Linien über `border-*-(length:--line-weight)`, Punkte `rounded-dot`, Chips/Badges `rounded-pill`, Karten `tile`, farbige oder dunkle Flächen nur über die Flächenrollen.

**Ein neues Preset anlegen:**
1. Eintrag in `app/styles/presets.json` (ID, Name, eine Zeile Beschreibung, Standardfarben, Radius, ggf. `"dark": true`). `"dark": true` setzt nur die Klasse `dark` auf `<html>` und schaltet damit die `dark:`-Varianten der shadcn-Komponenten; die Farben kommen trotzdem vollständig aus der Preset-Datei, nicht aus dem `.dark`-Block in `tailwind.css`.
2. Rezept in `scripts/style-recipes.mjs`, dann `node scripts/contrast.mjs --style <id>` – erst rechnen. **Rezept und CSS hält niemand automatisch synchron:** Wer einen L/C-Wert ändert, ändert ihn in beiden Dateien und rechnet das `konzept.md` neu. `check-styles.mjs --url` misst unabhängig davon die echten Kontraste im Browser – das fängt zu schwache Paare ab, aber keine Abweichung zwischen Rezept und CSS.
3. `app/styles/<id>/konzept.md` schreiben (Haltung, Signatur, Farbe mit Nachweis, Typografie, Form/Flächen/Kachel, Bewegung).
4. `app/styles/<id>/style.css`: `kursbuch/style.css` als Liste der nötigen Variablen nehmen, **alle** Werte neu setzen, Flächenrollen zuordnen (`@apply surface-ink|surface-brand|surface-plain`; `check-styles.mjs` verlangt für jede der fünf Rollen eine Regel mit Zuweisung – soll eine Rolle bewusst ohne Flächenart bleiben, erklärt das ein Kommentar `rolle-ohne-flaeche: <rolle>` in derselben Datei). Schriften über fontsource installieren und in `tailwind.css` importieren, Preset-Datei dort importieren. Die Regeln der Preset-Datei bleiben **ungeschichtet** (kein `@layer`): Nur so schlagen sie `.tile` und `.board-row` aus `@layer components`, unabhängig von der Spezifität. Genau deshalb stehen die Schutzregeln für „Bewegung reduzieren“ in `contract.css` mit `!important` – eine wichtige Deklaration in einem Layer schlägt jede ungeschichtete normale, umgekehrt könnte ein Preset den Schutz aushebeln.
5. `node scripts/check-styles.mjs --url http://localhost:3100` (Vollständigkeit + Messung im Browser), Screenshots mit `node scripts/screenshot.mjs <ordner> <url> --style <id>` bei 360/768/1280/1536 px ansehen.

**Prüfumgebung:** Die Screenshot-Skripte fahren Edge/Chrome headless über CDP (`scripts/lib/cdp.mjs`). Drei Dinge sind dort eingebaut, damit die Bilder den echten Browser zeigen:

- **Trennwörterbücher.** Chromium liefert sie als Nachlade-Komponente in `<User Data>/hyphen-data` aus; ein frisches `--user-data-dir` hat sie nicht, und `hyphens: auto` bliebe lautlos wirkungslos. `cdp.mjs` kopiert den Wörterbuch-Ordner aus dem installierten Profil ins Wegwerf-Profil.
- **`overflow-wrap: anywhere` auf `h1–h3`** als Sicherheitsnetz: Ein Wort, das der Browser nicht trennen kann, muss brechen statt die Seite zu sprengen – wichtig für Presets mit Versalien- und Monospace-Überschriften.
- **Warten auf die Schriften.** `screenshot.mjs` wartet nach dem Laden immer auf `document.fonts.ready` (zweimal, mit Pause). Seit die CSS-Datei die `@font-face`-Regeln aller fünf Presets enthält, ist der Ladezeitpunkt sonst nicht stabil.
- **Unit-Tests:** `yarn test` (= `node --test scripts/tests/*.test.mjs`). Expandiert der Glob in einer Shell nicht, hilft `node --test scripts/tests/theme-storage.test.mjs`.
- **Bildvergleich:** `node scripts/compare-shots.mjs <a> <b>` zählt ein Pixel erst ab einer Abweichung von mehr als 2 von 255 in einem Kanal. „Deckungsgleich“ heißt also „keine sichtbare Abweichung“, nicht „bytegleich“.

**Bewusst feste Werte in Templates.** Der Vertrag deckt Farben, Schrift, Form und Bewegung ab, nicht jede Feinheit. Diese Stellen stehen absichtlich fest im Markup und folgen keinem Preset – alle sind aus Tokens abgeleitet, keine ist ein Hex-Wert:

- `border-foreground/25` an den Tag-Badges und `/15` an der Trennlinie im Kachelfuß (`JobCard.vue`) – aufgehellte dekorative Linien, die mit der Kachelkante nicht konkurrieren sollen.
- die feste 1-px-Kante der Tag-Badges (siehe Abschnitt 8).
- `hover:bg-foreground/10` an den Zeilen der Abfahrtstafel.
- `after:ring-1 after:ring-foreground/10` am Foto – die feine Innenkante für hellen Himmel auf heller Fläche.
- `box-shadow: inset 0 0 0 4px var(--background)` am Endhalt des Linienbands.
- `bg-card/95` an der mobilen Bewerbungsleiste.
- `font-sans` an den Accordion-Fragen: Sie sind technisch `h3`, aber Bedienelemente (Abschnitt 4). Deshalb tragen sie die Textschrift statt der Display-Schrift – in Leitstand fällt der Unterschied am stärksten auf.

**Was der Build ausliefert.** Alle fünf Presets und alle `@font-face`-Regeln stehen in **einer** CSS-Datei; das Umschalten kostet zur Laufzeit nichts, dafür trägt jeder Besucher die vier inaktiven Presets mit. Gemessen am Build vom 20.09.2026:

| Posten | roh | gzip |
|---|---|---|
| `entry.*.css` gesamt | 184 081 B (180 KB) | 27 499 B (26,9 KB) |
| davon die vier inaktiven Preset-Blöcke | 17 820 B (17,4 KB) | – |
| davon 43 `@font-face`-Regeln | 14 489 B (14,1 KB) | – |
| Schriftdateien in `.output/public/_nuxt` | 59 Dateien, 1,36 MB | – |

Die Schriftdateien sind Build-Assets: Der Browser lädt nur die des aktiven Presets, der Rest liegt ungenutzt auf dem Server. Für ein Kundenprojekt gilt deshalb, was unter „Späterer Ausbau“ steht: nur das eine Preset importieren, dann fallen die vier Blöcke und die fremden Schriften weg.

**Späterer Ausbau:** Ein Preset-Ordner kann `components/` mit Varianten einzelner Bausteine bekommen (anderes Markup), und für Kundenprojekte kann ein einzelnes Preset zur Build-Zeit importiert werden – dann mit eigenem Inhalt und wieder vollständig nach Methode 2.1.

| Preset | Schrift (Display / Text) | Form | Kachel | Tafel | Konzept |
|---|---|---|---|---|---|
| Kursbuch | Barlow Semi Condensed 600 / Source Sans 3 | Radius 8 (xl 12), Linien 1 px (Signatur 3 px), Pillen und Punkte rund | Farbfläche (`secondary`), keine Kante, kein Schatten | dunkel (`ink`), Fallblatt 420 ms / 90 ms Versatz, Zellen 16–20 px | dieses Dokument |
| Plakat | Archivo 800 in 75 % Breite, Versalien (eine Familie für alles) | Radius 0 – auch Pillen und Punkte, Linien 3 px (Signatur 4 px) | weiße Fläche mit 3-px-Kante, kein Schatten, Hover füllt gelb | hell mit 3-px-Kante, Spaltenkopf invertiert, keine Bewegung, Zellen 16–20 px | `app/styles/plakat/konzept.md` |
| Weich | Bricolage Grotesque 700 / Figtree | Radius 16 (Buttons 14, Kacheln/Bilder/Tafel 24), Linien 1 px (Signatur 3 px), Pillen und Punkte rund | helle Fläche mit Schatten, **keine** Kante | helle Karte mit Schatten, ruhiges Einblenden 300 ms / 70 ms, Zellen 16 px | `app/styles/weich/konzept.md` |
| Leitstand | IBM Plex Mono 600 / IBM Plex Sans (Seite dunkel) | Radius 2, Pillen 2 px, Punkte eckig, Linien 1 px (Signatur 2 px) | ohne Fläche, 1-px-Kante | dunkel mit 1-px-Kante, Fallblatt 420 ms / 90 ms, Zellen 16 px | `app/styles/leitstand/konzept.md` |
| Editorial | Source Serif 4 600 / Source Sans 3 | Radius 2, Pillen 2 px, Punkte rund, Linien 1 px (Signatur 2 px), Schatten nur für Overlays | ohne Fläche und ohne Rundung: nur eine 2-px-Linie oben | ohne Fläche, 2-px-Linien oben und unten, bündig, keine Bewegung, Zellen 16–18 px | `app/styles/editorial/konzept.md` |
