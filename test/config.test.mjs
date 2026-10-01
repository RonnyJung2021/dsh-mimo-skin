/**
 * Settings resolution: a row config is deployment-varying input, so every
 * invalid field must fall back to the documented default instead of leaving the
 * GUI unpainted or unreadable.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { resolveSettings } = await loadModule('utils/config.ts')
const { PATTERN_HEIGHT_MAX, PATTERN_HEIGHT_MIN } = await loadModule('constants/config.ts')
const {
  DEFAULT_ACCENT,
  DEFAULT_GLOBAL_NAME,
  DEFAULT_PATTERN_HEIGHT,
  DEFAULT_PATTERN_TEXT,
} = await loadModule('constants/plugin.ts')

test('resolveSettings returns the documented defaults', () => {
  assert.deepEqual(resolveSettings(undefined), {
    theme: 'auto',
    accent: DEFAULT_ACCENT,
    pattern: true,
    patternOpacity: 0.05,
    patternText: DEFAULT_PATTERN_TEXT,
    patternHeight: DEFAULT_PATTERN_HEIGHT,
    enabled: true,
  })
})

test('the published defaults are the ones the plugin documents', () => {
  assert.equal(DEFAULT_GLOBAL_NAME, '__DSH_MIMO_SKIN__')
  // The reference site's own accent, and its own watermark strength.
  assert.equal(DEFAULT_ACCENT, '#ff6700')
  assert.equal(DEFAULT_PATTERN_TEXT, 'DEEPSEEK HARNESS')
  // Half the strip the skin first shipped: the mark's face follows this value,
  // so the default has to be the one the CSS falls back to as well.
  assert.equal(DEFAULT_PATTERN_HEIGHT, 26)
})

test('resolveSettings accepts a well-formed row config', () => {
  assert.deepEqual(resolveSettings({
    theme: 'dark',
    accent: '#0095ff',
    pattern: false,
    patternOpacity: 0.12,
    patternText: 'HARNESS',
    patternHeight: 40,
    enabled: true,
  }), {
    theme: 'dark',
    accent: '#0095ff',
    pattern: false,
    patternOpacity: 0.12,
    patternText: 'HARNESS',
    patternHeight: 40,
    enabled: true,
  })
})

test('an unknown theme falls back to auto rather than failing the boot', () => {
  for (const theme of ['sepia', '', 3, null, {}]) {
    assert.equal(resolveSettings({ theme }).theme, 'auto', String(theme))
  }
  for (const theme of ['light', 'dark', 'auto']) {
    assert.equal(resolveSettings({ theme }).theme, theme)
  }
})

test('the accent is accepted only as a colour literal, and is normalised', () => {
  assert.equal(resolveSettings({ accent: '#FF6700' }).accent, '#ff6700')
  assert.equal(resolveSettings({ accent: '  #0095ff  ' }).accent, '#0095ff')
  assert.equal(resolveSettings({ accent: '#0af' }).accent, '#0af')
  for (const accent of ['ff6700', 'orange', '#12345', '', 42, null, {}]) {
    assert.equal(resolveSettings({ accent }).accent, DEFAULT_ACCENT, String(accent))
  }
})

test('patternOpacity is clamped and rejects non-numbers', () => {
  assert.equal(resolveSettings({ patternOpacity: 0.5 }).patternOpacity, 0.5)
  assert.equal(resolveSettings({ patternOpacity: 0 }).patternOpacity, 0)
  assert.equal(resolveSettings({ patternOpacity: 2 }).patternOpacity, 1)
  assert.equal(resolveSettings({ patternOpacity: -3 }).patternOpacity, 0)
  for (const value of ['0.5', Number.NaN, Infinity, null]) {
    assert.equal(resolveSettings({ patternOpacity: value }).patternOpacity, 0.05, String(value))
  }
})

test('pattern is on unless explicitly disabled', () => {
  assert.equal(resolveSettings({}).pattern, true)
  assert.equal(resolveSettings({ pattern: true }).pattern, true)
  assert.equal(resolveSettings({ pattern: false }).pattern, false)
  // Any other value is not the documented opt-out; the default stands.
  assert.equal(resolveSettings({ pattern: 0 }).pattern, true)
  assert.equal(resolveSettings({ pattern: 'no' }).pattern, true)
})

test('enabled is on unless explicitly disabled', () => {
  assert.equal(resolveSettings({}).enabled, true)
  assert.equal(resolveSettings({ enabled: false }).enabled, false)
  assert.equal(resolveSettings({ enabled: 0 }).enabled, true)
})

test('the mark text is trimmed, and a blank one falls back', () => {
  // A blank mark would render an empty band and look like a broken skin rather
  // than like a choice.
  for (const value of ['', '   ', '\n', 42, null, {}]) {
    assert.equal(resolveSettings({ patternText: value }).patternText, DEFAULT_PATTERN_TEXT, String(value))
  }
  assert.equal(resolveSettings({ patternText: '  MIMO  ' }).patternText, 'MIMO')
})

test('patternHeight is clamped to the accepted range and rejects non-numbers', () => {
  assert.equal(resolveSettings({ patternHeight: 26 }).patternHeight, 26)
  assert.equal(resolveSettings({ patternHeight: PATTERN_HEIGHT_MIN }).patternHeight, PATTERN_HEIGHT_MIN)
  assert.equal(resolveSettings({ patternHeight: PATTERN_HEIGHT_MAX }).patternHeight, PATTERN_HEIGHT_MAX)
  assert.equal(resolveSettings({ patternHeight: PATTERN_HEIGHT_MAX + 100 }).patternHeight, PATTERN_HEIGHT_MAX)
  assert.equal(resolveSettings({ patternHeight: 0 }).patternHeight, PATTERN_HEIGHT_MIN)
  for (const value of ['26', Number.NaN, Infinity, null]) {
    assert.equal(resolveSettings({ patternHeight: value }).patternHeight, DEFAULT_PATTERN_HEIGHT, String(value))
  }
})
