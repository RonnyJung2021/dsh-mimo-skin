/**
 * The scrolling band: the one place the plugin writes nodes of its own into the
 * page. What matters is that the line loops without a seam, that the band comes
 * back if something removes it, and that disposal leaves nothing behind.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'
import { createFakeDocument } from './fake-dom.mjs'

const { createMarquee, marqueeContent } = await loadModule('client/marquee.ts')
const { MARQUEE_CLASS, MARQUEE_TRACK_CLASS } = await loadModule('client/contract.ts')

/** The band's one child, from a document the module has already painted. */
function bandOf(doc) {
  return doc.body.children.find(child => child.className === MARQUEE_CLASS)
}

test('the line is the unit an even number of times, so -50% is exactly one copy', () => {
  // `translateX(-50%)` is what makes the loop seamless: at the end of the
  // animation the second half sits where the first one started.
  const content = marqueeContent('DEEPSEEK HARNESS')
  const half = content.length / 2
  assert.equal(content.slice(0, half), content.slice(half))
  assert.ok(content.startsWith('DEEPSEEK HARNESS '), content.slice(0, 40))
})

test('one copy is long enough to overrun a wide window', () => {
  const content = marqueeContent('MIMO')
  assert.ok(content.length / 2 >= 140, String(content.length))
})

test('a long mark still gets the two copies the animation needs', () => {
  const long = 'X'.repeat(400)
  const content = marqueeContent(long)
  // Copies are whole, and there is always an even number of them.
  assert.equal(content.length % ((long.length + 1) * 2), 0)
  assert.ok(content.length >= (long.length + 1) * 2)
  assert.equal(content.slice(0, content.length / 2), content.slice(content.length / 2))
})

test('the mark is trimmed and given one separating space per copy', () => {
  assert.ok(marqueeContent('  MIMO  ').startsWith('MIMO '))
  assert.doesNotMatch(marqueeContent('MIMO'), /MIMOMIMO/u)
})

test('mounting appends one hidden band holding one line', () => {
  const doc = createFakeDocument()
  try {
    const marquee = createMarquee(doc, 'MIMO')
    const band = bandOf(doc)
    assert.ok(band !== undefined)
    assert.equal(band.getAttribute('aria-hidden'), 'true')
    assert.equal(band.children.length, 1)
    const track = band.children[0]
    assert.equal(track.className, MARQUEE_TRACK_CLASS)
    assert.equal(track.textContent, marqueeContent('MIMO'))
    marquee.destroy()
  } finally {
    doc.restore()
  }
})

test('the band watches the body for removals, and only for those', () => {
  const doc = createFakeDocument()
  try {
    const marquee = createMarquee(doc, 'MIMO')
    assert.equal(doc.bodyObservers().length, 1)
    const observer = doc.bodyObservers()[0]
    assert.equal(observer.target, doc.body)
    assert.equal(observer.childList, true)
    assert.equal(observer.attributes, false)
    marquee.destroy()
    assert.equal(doc.bodyObservers().length, 0)
  } finally {
    doc.restore()
  }
})

test('a band something removed is re-attached by itself', () => {
  const doc = createFakeDocument()
  try {
    const marquee = createMarquee(doc, 'MIMO')
    const band = bandOf(doc)
    band.remove()
    assert.equal(bandOf(doc), undefined)
    // `flush` runs the recorded mutations to quiescence; the observer's own
    // re-append must settle rather than keep producing records.
    doc.flush()
    assert.equal(bandOf(doc), band)
    marquee.destroy()
  } finally {
    doc.restore()
  }
})

test('setText replaces the line without rebuilding the band', () => {
  const doc = createFakeDocument()
  try {
    const marquee = createMarquee(doc, 'MIMO')
    const band = bandOf(doc)
    marquee.setText('HARNESS')
    assert.equal(bandOf(doc), band)
    assert.equal(band.children[0].textContent, marqueeContent('HARNESS'))
    marquee.destroy()
  } finally {
    doc.restore()
  }
})

test('destroy removes the band and stops watching', () => {
  const doc = createFakeDocument()
  try {
    const marquee = createMarquee(doc, 'MIMO')
    marquee.destroy()
    assert.equal(bandOf(doc), undefined)
    assert.equal(doc.bodyObservers().length, 0)
    // A later mutation must not bring it back.
    doc.record(doc.body, '', 'childList')
    doc.flush()
    assert.equal(bandOf(doc), undefined)
  } finally {
    doc.restore()
  }
})

test('destroying twice is safe', () => {
  const doc = createFakeDocument()
  try {
    const marquee = createMarquee(doc, 'MIMO')
    marquee.destroy()
    marquee.destroy()
    assert.equal(doc.bodyObservers().length, 0)
  } finally {
    doc.restore()
  }
})
