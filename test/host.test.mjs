/**
 * Host-half tests: what the row publishes, and what it keeps off generated
 * Settings pages.
 *
 * The browser cannot see a loader row's config, so every knob has to ride an
 * index injection. These tests run the host half through the real `Config`
 * schema the Loader uses, which is the only way to catch the volatile
 * reference: `Config` marks each knob `.volatile()`, so `apply` receives a
 * reference object and not a value. A reference passed on to `resolveSettings`
 * resolves the compiled default for every field, and one serialised into the
 * page yields `{}` — the two failure modes this file exists to pin down.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { apply, Config } = await loadModule('index.ts')
const { DEFAULT_ACCENT, DEFAULT_GLOBAL_NAME, DEFAULT_PATTERN_TEXT } = await loadModule('config.ts')

/** Every knob at its schema default, as an empty patch resolves. */
const DEFAULT_PUBLISHED = {
  theme: 'auto',
  accent: DEFAULT_ACCENT,
  pattern: true,
  patternOpacity: 0.05,
  patternText: DEFAULT_PATTERN_TEXT,
}

/**
 * Build a fake host context.
 * @param options - whether the settings service exists.
 * @returns the context plus what it recorded.
 */
function fakeContext(options = {}) {
  const table = []
  const record = { table, listeners: [], labels: [], presentations: [], injected: [], debug: [] }
  const settings = {
    configure: (presentation, owner) => {
      record.presentations.push({ presentation, owner })
      return () => {}
    },
  }
  const child = {
    get: (service) => (service === 'settings' ? settings : undefined),
    effect: (callback) => {
      callback()
      return { dispose() {} }
    },
  }
  const ctx = {
    fiber: { uid: 7 },
    logger: { debug: (message) => { record.debug.push(message) }, warn: () => {} },
    inject: (services, callback) => {
      record.injected.push(services)
      if (options.inject !== false) callback(child)
      return { dispose() {} }
    },
    on: (event, listener) => {
      record.listeners.push({ event, listener })
      return () => {}
    },
  }
  return { ctx, record }
}

test('an empty patch publishes the schema defaults as plain values', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({}))
  assert.equal(record.listeners.length, 1)
  assert.equal(record.listeners[0].event, 'webserver/index-inject')
  record.listeners[0].listener(record.table)
  assert.deepEqual(record.table, [{
    kind: 'global',
    name: DEFAULT_GLOBAL_NAME,
    value: { ...DEFAULT_PUBLISHED, enabled: true },
  }])
  // A serialised volatile reference is `{}`: none may survive into the page, or
  // the browser half would quietly fall back to its own copy of every field.
  assert.doesNotMatch(JSON.stringify(record.table[0].value), /\{\}/u)
})

test('pinned values are published as configured', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({
    theme: 'dark',
    accent: '#0095ff',
    pattern: false,
    patternOpacity: 0.2,
    patternText: 'HARNESS',
  }))
  record.listeners[0].listener(record.table)
  assert.deepEqual(record.table[0].value, {
    ...DEFAULT_PUBLISHED,
    theme: 'dark',
    accent: '#0095ff',
    pattern: false,
    patternOpacity: 0.2,
    patternText: 'HARNESS',
    enabled: true,
  })
})

test('the schema rejects values the browser half could not paint', () => {
  assert.throws(() => Config({ theme: 'sepia' }), /theme/u)
  assert.throws(() => Config({ patternOpacity: 2 }), /patternOpacity/u)
  assert.throws(() => Config({ pattern: 'yes' }), /pattern/u)
})

test('an unusable accent falls back to the reference colour', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({ accent: 'orange' }))
  record.listeners[0].listener(record.table)
  assert.equal(record.table[0].value.accent, DEFAULT_ACCENT)
})

test('a blank mark falls back to the documented text', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({ patternText: '   ' }))
  record.listeners[0].listener(record.table)
  assert.equal(record.table[0].value.patternText, DEFAULT_PATTERN_TEXT)
})

test('a disabled row publishes nothing', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({ enabled: false }))
  assert.deepEqual(record.listeners, [])
})

test('the global name can be replaced when two engines disagree', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({ globalName: '__MY_MIMO__' }))
  record.listeners[0].listener(record.table)
  assert.equal(record.table[0].name, '__MY_MIMO__')
})

test('the row declares itself off any generated settings page', () => {
  const { ctx, record } = fakeContext()
  apply(ctx, Config({}))
  assert.deepEqual(record.injected, [['settings']])
  assert.deepEqual(record.presentations, [{ presentation: { auto: false }, owner: ctx.fiber }])
})
