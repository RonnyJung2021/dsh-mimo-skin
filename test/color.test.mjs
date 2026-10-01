/**
 * Colour arithmetic: the accent is the one appearance value a user types, so
 * both the literal it may be and the text-safe variant derived from it have to
 * be pinned.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'
import { contrast } from './contrast.mjs'

const {
  AA_TEXT_CONTRAST,
  isColor,
  parseColor,
  toHex,
  mix,
  luminance,
  contrast: ratio,
  readableOn,
} = await loadModule('color.ts')

test('parseColor reads the two accepted literal forms', () => {
  assert.deepEqual(parseColor('#ff6700'), { r: 255, g: 103, b: 0 })
  assert.deepEqual(parseColor('#f70'), { r: 255, g: 119, b: 0 })
  assert.deepEqual(parseColor('#FFF'), { r: 255, g: 255, b: 255 })
  assert.deepEqual(parseColor('  #000000  '), { r: 0, g: 0, b: 0 })
})

test('parseColor refuses everything that is not one of them', () => {
  for (const value of ['', '  ', '#', '#12', '#12345', '#gggggg', 'red', 'rgb(1,2,3)', 42, null, undefined, {}]) {
    assert.equal(parseColor(value), undefined, JSON.stringify(value))
  }
})

test('isColor is parseColor as a predicate', () => {
  assert.equal(isColor('#ff6700'), true)
  assert.equal(isColor('#f70'), true)
  assert.equal(isColor('ff6700'), false)
})

test('toHex always writes six digits, lower case', () => {
  assert.equal(toHex({ r: 255, g: 103, b: 0 }), '#ff6700')
  assert.equal(toHex({ r: 0, g: 0, b: 0 }), '#000000')
  assert.equal(toHex(parseColor('#ABC')), '#aabbcc')
  // Round-tripping is what lets the card show a canonical value back.
  for (const literal of ['#ff6700', '#faf7f5', '#000000', '#ffffff']) {
    assert.equal(toHex(parseColor(literal)), literal)
  }
})

test('mix walks from one colour to the other and clamps', () => {
  const from = { r: 255, g: 103, b: 0 }
  const to = { r: 0, g: 0, b: 0 }
  assert.deepEqual(mix(from, to, 0), from)
  assert.deepEqual(mix(from, to, 1), to)
  assert.deepEqual(mix(from, to, 2), to)
  assert.deepEqual(mix(from, to, -1), from)
  assert.deepEqual(mix(from, to, 0.5), { r: 127.5, g: 51.5, b: 0 })
})

test('luminance and contrast match the WCAG definition', () => {
  assert.equal(luminance({ r: 0, g: 0, b: 0 }), 0)
  assert.equal(luminance({ r: 255, g: 255, b: 255 }), 1)
  assert.equal(ratio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21)
  assert.equal(ratio({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }), 1)
  // Order-independent, and the same number the independent implementation gets.
  assert.equal(
    ratio(parseColor('#ff6700'), parseColor('#faf7f5')),
    contrast('#ff6700', '#faf7f5'),
  )
})

test('the reference accent really is below AA on its own page', () => {
  // The whole reason the skin keeps a fill and a text value apart.
  const measured = contrast('#ff6700', '#faf7f5')
  assert.ok(measured > 2.5 && measured < 4.5, String(measured))
})

test('readableOn leaves a colour that already clears the floor alone', () => {
  // #ff6700 on black is 7.2:1, so the dark shell has nothing to fix.
  assert.equal(readableOn(parseColor('#ff6700'), parseColor('#000000'), 'lighten'), '#ff6700')
  assert.ok(contrast('#ff6700', '#000000') >= AA_TEXT_CONTRAST)
})

test('readableOn darkens on a warm page until the floor is met', () => {
  const value = readableOn(parseColor('#ff6700'), parseColor('#faf7f5'), 'darken')
  assert.match(value, /^#[0-9a-f]{6}$/u)
  assert.notEqual(value, '#ff6700')
  assert.ok(contrast(value, '#faf7f5') >= AA_TEXT_CONTRAST, String(contrast(value, '#faf7f5')))
  // The step search stops at the first passing colour, so it must not overshoot
  // into black.
  assert.notEqual(value, '#000000')
})

test('the derived text value keeps the accent hue rather than turning grey', () => {
  const value = parseColor(readableOn(parseColor('#ff6700'), parseColor('#faf7f5'), 'darken'))
  // Still warm: red above green above blue, the way the site's accent is.
  assert.ok(value.r > value.g && value.g > value.b, JSON.stringify(value))
})

test('every accent gets a text value that clears AA on both shells', () => {
  const accents = ['#ff6700', '#0095ff', '#00a870', '#7b61ff', '#ffd400', '#111111', '#f5f0eb', '#8a2be2']
  for (const literal of accents) {
    const fill = parseColor(literal)
    const light = readableOn(fill, parseColor('#faf7f5'), 'darken')
    const dark = readableOn(fill, parseColor('#000000'), 'lighten')
    assert.ok(contrast(light, '#faf7f5') >= AA_TEXT_CONTRAST, `${literal} on the warm page: ${contrast(light, '#faf7f5')}`)
    assert.ok(contrast(dark, '#000000') >= AA_TEXT_CONTRAST, `${literal} on black: ${contrast(dark, '#000000')}`)
  }
})

test('an impossible floor falls through to the extreme, never to nothing', () => {
  // Above 21 no colour can pass; the walk must still return a usable literal.
  assert.equal(readableOn(parseColor('#ff6700'), parseColor('#faf7f5'), 'darken', 30), '#000000')
  assert.equal(readableOn(parseColor('#ff6700'), parseColor('#000000'), 'lighten', 30), '#ffffff')
})
