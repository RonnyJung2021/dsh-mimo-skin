/**
 * The card's copy: it lives in `locale/`, so this file is what keeps the two
 * dictionaries from drifting apart or losing a key the card asks for.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadModule } from './load-module.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = name => JSON.parse(readFileSync(join(root, 'locale', `${name}.json`), 'utf8'))
const zh = read('zh')
const en = read('en')

const { COPY_KEYS, panelCopy } = await loadModule('client/copy.ts')
const { SECTION_FIELDS } = await loadModule('constants/config.ts')

test('the card shows the package name, not a translated title', () => {
  // 5.6: the plugin page reads `meta.title` from here, and the card must not
  // read as a marketing name in one language and a package name in the other.
  assert.equal(zh.meta.title, 'dsh-mimo-skin')
  assert.equal(en.meta.title, 'dsh-mimo-skin')
  for (const dictionary of [zh, en]) {
    assert.equal(typeof dictionary.meta.description, 'string')
    assert.ok(dictionary.meta.description.length > 40, 'the description explains what the skin does')
  }
})

test('both dictionaries carry every key the card reads', () => {
  for (const key of COPY_KEYS) {
    assert.equal(typeof zh.panel[key], 'string', `zh.${key}`)
    assert.notEqual(zh.panel[key], '', `zh.${key}`)
    assert.equal(typeof en.panel[key], 'string', `en.${key}`)
    assert.notEqual(en.panel[key], '', `en.${key}`)
  }
})

test('the two dictionaries hold the same key set, and nothing else', () => {
  const zhKeys = Object.keys(zh.panel).sort()
  const enKeys = Object.keys(en.panel).sort()
  assert.deepEqual(zhKeys, enKeys)
  assert.deepEqual(zhKeys.filter(key => !COPY_KEYS.includes(key)), [])
})

test('every string is actually translated', () => {
  for (const key of COPY_KEYS) {
    assert.notEqual(zh.panel[key], en.panel[key], key)
  }
})

test('a Chinese page gets the Chinese card, anything else the English one', () => {
  assert.equal(panelCopy('zh-CN').save, zh.panel.save)
  assert.equal(panelCopy('zh').noteReady, zh.panel.noteReady)
  assert.equal(panelCopy('en-US').save, en.panel.save)
  // An unlisted language falls back rather than rendering nothing.
  assert.equal(panelCopy('de').save, en.panel.save)
  assert.equal(panelCopy('').save, en.panel.save)
})

test('the card reads the page language when it is not told one', () => {
  const real = globalThis.navigator
  try {
    Object.defineProperty(globalThis, 'navigator', { value: { language: 'zh-CN' }, configurable: true })
    assert.equal(panelCopy().save, zh.panel.save)
    Object.defineProperty(globalThis, 'navigator', { value: { language: 'fr' }, configurable: true })
    assert.equal(panelCopy().save, en.panel.save)
  } finally {
    if (real === undefined) delete globalThis.navigator
    else Object.defineProperty(globalThis, 'navigator', { value: real, configurable: true })
  }
})

test('every knob has a label, a hint and, where it can be refused, a message', () => {
  const copy = panelCopy('en')
  assert.deepEqual(Object.keys(copy.field), [...SECTION_FIELDS])
  for (const field of SECTION_FIELDS) {
    assert.ok(copy.field[field].label.length > 0, field)
    assert.ok(copy.field[field].hint.length > 0, field)
  }
  // `pattern` is a switch: there is no value it could be refused on.
  assert.deepEqual(
    Object.keys(copy.error),
    ['theme', 'accent', 'patternOpacity', 'patternText', 'patternHeight'],
  )
})

test('the shell picker lists the three choices in the documented order', () => {
  assert.deepEqual(panelCopy('en').themeOptions.map(option => option.value), ['auto', 'light', 'dark'])
})

test('the derived accent values are labelled separately per shell', () => {
  const copy = panelCopy('en')
  assert.notEqual(copy.accentText.light, copy.accentText.dark)
  assert.match(copy.accentText.light, /light/u)
  assert.match(copy.accentText.dark, /dark/u)
})
