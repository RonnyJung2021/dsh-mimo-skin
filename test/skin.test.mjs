/**
 * The document-level skin: what it writes onto the body, how it follows the
 * product's own light/dark setting, and that disposal leaves no trace.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'
import { createFakeDocument } from './fake-dom.mjs'

const { createSkin } = await loadModule('client/skin.ts')
const { SKIN_ATTRIBUTE, DARK_ATTRIBUTE, THEME_DARK_ATTRIBUTE } = await loadModule('constants/dom.ts')
const { LIGHT_SHELL, DARK_SHELL } = await loadModule('client/palette.ts')
const { PALETTE_VARIABLES } = await loadModule('constants/palette.ts')

const INPUT = {
  theme: 'auto',
  accent: '#ff6700',
  pattern: true,
  patternOpacity: 0.05,
}

test('applying paints the light shell and marks the body', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    assert.ok(doc.body.hasAttribute(SKIN_ATTRIBUTE))
    assert.equal(doc.body.hasAttribute(DARK_ATTRIBUTE), false)
    assert.equal(doc.body.style.get('--dsh-mimo-page'), LIGHT_SHELL.page)
    assert.equal(doc.body.style.get('--dsh-mimo-ink'), LIGHT_SHELL.ink)
    assert.equal(doc.body.style.get('--dsh-mimo-accent'), '#ff6700')
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('every palette variable is written', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    for (const name of PALETTE_VARIABLES) {
      assert.notEqual(doc.body.style.get(name), undefined, name)
    }
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('a chosen accent reaches the document, not just the card', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin({ ...INPUT, accent: '#0095ff' }, doc)
    assert.equal(doc.body.style.get('--dsh-mimo-accent'), '#0095ff')
    assert.equal(doc.body.style.get('--dsh-mimo-accent-wash'), `#0095ff${LIGHT_SHELL.washAlpha}`)
    assert.notEqual(doc.body.style.get('--dsh-mimo-accent-text'), '#0095ff')
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('re-painting after a saved change moves the page without remounting', () => {
  const doc = createFakeDocument()
  try {
    const input = { ...INPUT }
    const skin = createSkin(input, doc)
    // What the browser half does when the card saves: write the section into
    // the one live input object, then ask for one more paint.
    input.pattern = false
    input.accent = '#00a870'
    skin.apply()
    assert.equal(doc.body.style.get('--dsh-mimo-accent'), '#00a870')
    assert.equal(doc.body.style.get('--dsh-mimo-marquee-height'), '0px')
    assert.equal(doc.body.style.get('--dsh-mimo-pattern-opacity'), '0')
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('auto follows the product theme attribute in both directions', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    assert.equal(doc.body.style.get('--dsh-mimo-page'), LIGHT_SHELL.page)

    doc.body.setAttribute(THEME_DARK_ATTRIBUTE, '')
    doc.flush()
    assert.equal(doc.body.style.get('--dsh-mimo-page'), DARK_SHELL.page)
    assert.equal(doc.body.style.get('--dsh-mimo-ink'), DARK_SHELL.ink)
    assert.ok(doc.body.hasAttribute(DARK_ATTRIBUTE))

    doc.body.removeAttribute(THEME_DARK_ATTRIBUTE)
    doc.flush()
    assert.equal(doc.body.style.get('--dsh-mimo-page'), LIGHT_SHELL.page)
    assert.equal(doc.body.hasAttribute(DARK_ATTRIBUTE), false)
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('an explicit theme ignores the product setting', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin({ ...INPUT, theme: 'dark' }, doc)
    doc.body.setAttribute(THEME_DARK_ATTRIBUTE, '')
    doc.flush()
    assert.equal(doc.body.style.get('--dsh-mimo-page'), DARK_SHELL.page)
    // ...and stays dark once the product leaves dark.
    doc.body.removeAttribute(THEME_DARK_ATTRIBUTE)
    doc.flush()
    assert.equal(doc.body.style.get('--dsh-mimo-page'), DARK_SHELL.page)
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('the applier watches the product theme attribute and nothing else', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    assert.equal(doc.bodyObservers().length, 1)
    const observer = doc.bodyObservers()[0]
    assert.equal(observer.target, doc.body)
    // Watching the skin's own attributes would make its callback re-arm it: a
    // `MutationObserver` records a write of the value an attribute already
    // holds, so the callback's own `setAttribute` would deliver a new record.
    assert.deepEqual(observer.attributeFilter, [THEME_DARK_ATTRIBUTE])
    assert.equal(observer.attributes, true)
    assert.equal(observer.childList, false)
    skin.destroy()
    assert.equal(doc.bodyObservers().length, 0)
  } finally {
    doc.restore()
  }
})

test('a theme flip settles instead of re-arming its own observer', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    doc.body.setAttribute(THEME_DARK_ATTRIBUTE, '')
    // `flush` runs records to quiescence and throws if the callback never
    // stops producing them; the skin must reach dark and then go quiet.
    doc.flush()
    assert.equal(doc.body.style.get('--dsh-mimo-page'), DARK_SHELL.page)
    assert.ok(doc.callbacks <= 2, `expected at most two passes, saw ${doc.callbacks}`)
    // Nothing is left pending once it settles.
    assert.deepEqual(doc.records, [])
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('re-painting an already-painted body writes no watched attribute', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    // Applying again is the same work the observer does; it must be a no-op for
    // the attributes, because a write there is what starts the loop.
    doc.records = []
    doc.recording = true
    skin.apply()
    assert.deepEqual(doc.records.filter(record => record.name === THEME_DARK_ATTRIBUTE), [])
    skin.destroy()
  } finally {
    doc.restore()
  }
})

test('destroy removes the attributes and every property it wrote', () => {
  const doc = createFakeDocument()
  try {
    const skin = createSkin(INPUT, doc)
    doc.body.setAttribute(THEME_DARK_ATTRIBUTE, '')
    doc.flush()
    skin.destroy()
    assert.equal(doc.body.hasAttribute(SKIN_ATTRIBUTE), false)
    assert.equal(doc.body.hasAttribute(DARK_ATTRIBUTE), false)
    for (const name of PALETTE_VARIABLES) {
      assert.equal(doc.body.style.get(name), undefined, name)
    }
    // The product's own theme attribute is not the plugin's to remove.
    assert.ok(doc.body.hasAttribute(THEME_DARK_ATTRIBUTE))
  } finally {
    doc.restore()
  }
})
