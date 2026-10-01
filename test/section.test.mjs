/**
 * The card's settings namespace: which fields travel, how a hostile or stale
 * section is narrowed, what the card refuses to save, and how it explains a
 * missing transport.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const {
  SECTION_DEFAULTS,
  invalidFields,
  sectionOf,
  sectionOps,
} = await loadModule('utils/section.ts')
const { hostPublished } = await loadModule('client/published.ts')
const { SECTION_FIELDS, PATTERN_HEIGHT_MAX, PATTERN_HEIGHT_MIN } = await loadModule('constants/config.ts')
const {
  SETTINGS_NAMESPACE,
  DEFAULT_ACCENT,
  DEFAULT_PATTERN_HEIGHT,
  DEFAULT_PATTERN_TEXT,
} = await loadModule('constants/plugin.ts')
const { resolveSettings } = await loadModule('utils/config.ts')

test('the namespace is the loader row id, which is the package name', () => {
  assert.equal(SETTINGS_NAMESPACE, 'dsh-mimo-skin')
})

test('the row section is the page knobs, in the order the card lists them', () => {
  // One list, read by the Host when it publishes and by the card when it edits.
  // The two used to be separate lists with separate names, which is exactly how
  // a published field and an editable one drift apart.
  assert.deepEqual(
    [...SECTION_FIELDS],
    ['theme', 'accent', 'pattern', 'patternOpacity', 'patternText', 'patternHeight'],
  )
})

test('the reset table is the plugin one default table', () => {
  const defaults = resolveSettings(undefined)
  assert.deepEqual(SECTION_DEFAULTS, {
    theme: defaults.theme,
    accent: defaults.accent,
    pattern: defaults.pattern,
    patternOpacity: defaults.patternOpacity,
    patternText: defaults.patternText,
    patternHeight: defaults.patternHeight,
  })
  assert.equal(SECTION_DEFAULTS.theme, 'auto')
  assert.equal(SECTION_DEFAULTS.accent, DEFAULT_ACCENT)
  assert.equal(SECTION_DEFAULTS.pattern, true)
  assert.equal(SECTION_DEFAULTS.patternOpacity, 0.05)
  assert.equal(SECTION_DEFAULTS.patternText, DEFAULT_PATTERN_TEXT)
  assert.equal(SECTION_DEFAULTS.patternHeight, DEFAULT_PATTERN_HEIGHT)
})

test('sectionOf keeps every usable field', () => {
  assert.deepEqual(sectionOf({
    theme: 'dark',
    accent: '  #0095FF  ',
    pattern: false,
    patternOpacity: 0.12,
    patternText: '  HARNESS  ',
    patternHeight: 40,
  }), {
    theme: 'dark',
    accent: '#0095ff',
    pattern: false,
    patternOpacity: 0.12,
    patternText: 'HARNESS',
    patternHeight: 40,
  })
})

test('sectionOf drops a field it cannot apply, leaving the boot value', () => {
  assert.deepEqual(sectionOf({ theme: 'sepia' }), {})
  assert.deepEqual(sectionOf({ pattern: 'yes' }), {})
  assert.deepEqual(sectionOf({ patternOpacity: Number.NaN }), {})
  assert.deepEqual(sectionOf({ accent: 'orange' }), {})
  assert.deepEqual(sectionOf({ patternText: '   ' }), {})
  assert.deepEqual(sectionOf({ patternHeight: '26' }), {})
})

test('sectionOf clamps the numeric knobs instead of refusing the write', () => {
  assert.equal(sectionOf({ patternOpacity: 4 }).patternOpacity, 1)
  assert.equal(sectionOf({ patternOpacity: -2 }).patternOpacity, 0)
  assert.equal(sectionOf({ patternHeight: 9999 }).patternHeight, PATTERN_HEIGHT_MAX)
  assert.equal(sectionOf({ patternHeight: 0 }).patternHeight, PATTERN_HEIGHT_MIN)
})

test('sectionOf takes nothing from a section that is not an object', () => {
  for (const value of [undefined, null, 'theme: dark', 7, ['dark']]) {
    assert.deepEqual(sectionOf(value), {}, String(value))
  }
})

test('hostPublished separates the current host half from an older one', () => {
  assert.equal(hostPublished({}), false)
  assert.equal(hostPublished({ __DSH_MIMO_SKIN__: undefined }), false)
  // The pre-schema host half published exactly this, and nothing else.
  assert.equal(hostPublished({ __DSH_MIMO_SKIN__: { enabled: true } }), false)
  assert.equal(hostPublished({ __DSH_MIMO_SKIN__: { theme: 'light', enabled: true } }), true)
  assert.equal(hostPublished({ __DSH_MIMO_SKIN__: { accent: '#ff6700', enabled: true } }), true)
})

test('a well-formed draft has nothing to complain about', () => {
  assert.deepEqual(invalidFields(SECTION_DEFAULTS), [])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, accent: '#0095ff', patternText: 'MIMO' }), [])
})

test('invalidFields names every knob the settings service would reject', () => {
  // Falling back silently is exactly what a form must not do: the user would
  // press Save and watch the field revert with no reason given.
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, theme: 'sepia' }), ['theme'])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, accent: 'orange' }), ['accent'])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, patternOpacity: 2 }), ['patternOpacity'])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, patternOpacity: Number.NaN }), ['patternOpacity'])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, patternText: '   ' }), ['patternText'])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, patternHeight: PATTERN_HEIGHT_MAX + 1 }), ['patternHeight'])
  assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, patternHeight: PATTERN_HEIGHT_MIN - 1 }), ['patternHeight'])
})

test('invalidFields reports the offenders in the order the card lists them', () => {
  assert.deepEqual(invalidFields({
    theme: 'sepia',
    accent: 'nope',
    pattern: true,
    patternOpacity: 9,
    patternText: '',
    patternHeight: 0,
  }), ['theme', 'accent', 'patternOpacity', 'patternText', 'patternHeight'])
})

test('sectionOps writes one set per knob, so the write is fenced as one revision', () => {
  const ops = sectionOps(SECTION_DEFAULTS)
  assert.deepEqual(ops.map(op => op.op), ['set', 'set', 'set', 'set', 'set', 'set'])
  assert.deepEqual(ops.map(op => op.path), [
    ['theme'], ['accent'], ['pattern'], ['patternOpacity'], ['patternText'], ['patternHeight'],
  ])
  assert.deepEqual(ops.map(op => op.value), [
    SECTION_DEFAULTS.theme,
    SECTION_DEFAULTS.accent,
    SECTION_DEFAULTS.pattern,
    SECTION_DEFAULTS.patternOpacity,
    SECTION_DEFAULTS.patternText,
    SECTION_DEFAULTS.patternHeight,
  ])
})
