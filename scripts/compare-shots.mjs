// Vergleicht zwei Screenshot-Ordner Pixel für Pixel (gleiche Dateinamen). Ohne Abhängigkeiten: PNG-Decoder über zlib.
// Aufruf: node scripts/compare-shots.mjs <ordnerA> <ordnerB> [--tolerance <pixel>]   -> Exit-Code 1 bei Abweichung
//
// WICHTIG, was "gleich" hier heißt: Ein Pixel zählt erst als abweichend, wenn sich mindestens ein Kanal um MEHR
// ALS 2 von 255 unterscheidet. "deckungsgleich" bedeutet also "keine sichtbare Abweichung", nicht "bytegleich" –
// ein Unterschied von 1–2 Stufen (typisch für Antialiasing-Kanten) fällt durchs Raster. --tolerance legt zusätzlich
// fest, wie viele solcher abweichenden Pixel eine Datei haben darf.
// Dateien, die nur im zweiten Ordner liegen, werden als Abweichung gemeldet (der erste Ordner gibt die Liste vor).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inflateSync } from 'node:zlib'

const args = process.argv.slice(2)
const toleranceIndex = args.indexOf('--tolerance')
const tolerance = toleranceIndex >= 0 ? Number(args.splice(toleranceIndex, 2)[1]) : 0
const [dirA, dirB] = args
if (!dirA || !dirB) {
  console.error('Aufruf: node scripts/compare-shots.mjs <ordnerA> <ordnerB> [--tolerance <pixel>]')
  process.exit(1)
}

function decodePng(file) {
  const buf = readFileSync(file)
  let pos = 8, width = 0, height = 0, colorType = 0, bitDepth = 0
  const idat = []
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos)
    const type = buf.toString('latin1', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      if (data[12])
        throw new Error(`${file}: Interlacing wird nicht unterstützt`)
    }
    if (type === 'IDAT')
      idat.push(data)
    pos += 12 + length
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6))
    throw new Error(`${file}: nur 8-Bit RGB/RGBA`)

  const bpp = colorType === 6 ? 4 : 3
  const stride = width * bpp
  const raw = inflateSync(Buffer.concat(idat))
  const px = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const out = px.subarray(y * stride, (y + 1) * stride)
    const prev = y ? px.subarray((y - 1) * stride, y * stride) : null
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0
      const b = prev ? prev[x] : 0
      const c = prev && x >= bpp ? prev[x - bpp] : 0
      let value = line[x]
      if (filter === 1) value += a
      else if (filter === 2) value += b
      else if (filter === 3) value += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      out[x] = value & 255
    }
  }
  return { width, height, bpp, px }
}

let failed = 0
const namesA = readdirSync(dirA).filter(file => file.endsWith('.png')).sort()
// Nur-in-B-Dateien fallen sonst lautlos unter den Tisch (z. B. eine Breite, die im alten Stand fehlt)
for (const name of readdirSync(dirB).filter(file => file.endsWith('.png')).sort()) {
  if (!namesA.includes(name)) {
    console.log(`NUR IN B      ${name}`)
    failed++
  }
}
for (const name of namesA) {
  let a, b
  try {
    a = decodePng(join(dirA, name))
    b = decodePng(join(dirB, name))
  }
  catch (error) {
    console.log(`FEHLT/DEFEKT  ${name}  (${error.message})`)
    failed++
    continue
  }
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`GRÖSSE        ${name}  ${a.width}×${a.height} gegen ${b.width}×${b.height}`)
    failed++
    continue
  }
  let different = 0, firstRow = -1, lastRow = -1
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * a.bpp, j = (y * b.width + x) * b.bpp
      if (Math.abs(a.px[i] - b.px[j]) > 2 || Math.abs(a.px[i + 1] - b.px[j + 1]) > 2 || Math.abs(a.px[i + 2] - b.px[j + 2]) > 2) {
        different++
        if (firstRow < 0) firstRow = y
        lastRow = y
      }
    }
  }
  const ok = different <= tolerance
  if (!ok) failed++
  console.log(`${ok ? 'gleich       ' : 'ABWEICHUNG   '} ${name}  ${different} Pixel${different ? ` (Zeilen ${firstRow}–${lastRow})` : ''}`)
}
console.log(failed
  ? `\n${failed} Datei(en) weichen ab.`
  : '\nAlle Dateien deckungsgleich (kein Kanal weicht um mehr als 2 von 255 ab – nicht bytegleich).')
process.exit(failed ? 1 : 0)
