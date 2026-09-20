import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseThemeStore, pickStyle } from '../../app/styles/storage.ts'

const ids = ['kursbuch', 'plakat']

test('leerer oder kaputter Eintrag ergibt den Standard', () => {
  assert.deepEqual(parseThemeStore(null, ids, 'kursbuch'), { style: 'kursbuch', overrides: {} })
  assert.deepEqual(parseThemeStore('{kaputt', ids, 'kursbuch'), { style: 'kursbuch', overrides: {} })
})

test('altes flaches Format wird als Anpassung von Kursbuch übernommen', () => {
  const store = parseThemeStore(JSON.stringify({ brand: '#0b5d3b', signal: '#ff7a00', card: '', radius: 0.75 }), ids, 'kursbuch')
  assert.deepEqual(store, { style: 'kursbuch', overrides: { kursbuch: { brand: '#0b5d3b', signal: '#ff7a00', radius: 0.75 } } })
})

test('unbekannter Stil fällt zurück, unbekannte Presets und ungültige Werte fliegen raus', () => {
  const raw = JSON.stringify({
    style: 'gibtsnicht',
    overrides: { plakat: { brand: '#ABCDEF', signal: 'rot', radius: 9 }, fremd: { brand: '#000000' } },
  })
  assert.deepEqual(parseThemeStore(raw, ids, 'kursbuch'), { style: 'kursbuch', overrides: { plakat: { brand: '#ABCDEF' } } })
})

test('?style= hat Vorrang vor dem gespeicherten Stil, aber nur wenn bekannt', () => {
  const store = { style: 'plakat', overrides: {} }
  assert.equal(pickStyle('kursbuch', store, ids), 'kursbuch')
  assert.equal(pickStyle('quatsch', store, ids), 'plakat')
  assert.equal(pickStyle(undefined, store, ids), 'plakat')
})
