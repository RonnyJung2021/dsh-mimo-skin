/**
 * The stylesheet's contract: the skin may only repaint through the product's own
 * `--dsw-*` aliases and the documented `data-` attributes. A selector against a
 * generated CSS-module class would break on the next product build and is
 * asserted against here.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'
import { createFakeDocument } from './fake-dom.mjs'

const { CSS, installStyles } = await loadModule('client/styles.ts')
const { SKIN_ATTRIBUTE, MARQUEE_CLASS, MARQUEE_TRACK_CLASS, STYLE_ID } = await loadModule('client/contract.ts')

test('the stylesheet hangs every override off the skin attribute', () => {
  // The one global it may touch is the shell root it has to lift over the band.
  assert.match(CSS, new RegExp(`body\\[${SKIN_ATTRIBUTE}\\] > #root`))
  assert.match(CSS, new RegExp(`body\\[${SKIN_ATTRIBUTE}\\]`))
  assert.match(CSS, new RegExp(`\\.${MARQUEE_CLASS}`))
  assert.match(CSS, new RegExp(`\\.${MARQUEE_TRACK_CLASS}`))
})

test('the stylesheet addresses documented attributes, never generated class names', () => {
  // DSH's CSS-module classes are hashed and change every build; the hooks the
  // product documents are the `data-` attributes, plus the ARIA state a switch
  // publishes for assistive technology.
  assert.match(CSS, /\[data-composer-card\]/)
  assert.match(CSS, /\[data-menu-material\]/)
  assert.match(CSS, /\[role='switch'\]\[aria-checked='false'\]/)
  const moduleClasses = CSS.match(/\.[A-Za-z][\w-]*_[A-Za-z0-9]{5,}/gu) ?? []
  assert.deepEqual(moduleClasses, [], `generated class names in the stylesheet: ${moduleClasses.join(', ')}`)
})

test('the band is a fixed strip across the top and the page is pushed below it', () => {
  const band = CSS.match(new RegExp(`\\.${MARQUEE_CLASS} \\{[^}]*\\}`))?.[0] ?? ''
  assert.match(band, /position: fixed;/u)
  assert.match(band, /top: 0;/u)
  assert.match(band, /left: 0;/u)
  assert.match(band, /right: 0;/u)
  assert.match(band, /height: var\(--dsh-mimo-marquee-height/u)
  assert.match(band, /overflow: hidden;/u)
  // A mark behind the page must not intercept clicks or be selectable.
  assert.match(band, /pointer-events: none;/u)
  assert.match(band, /user-select: none;/u)
  // The row it owns is reserved out of the page, by exactly the same value.
  assert.match(CSS, /body\[data-dsh-mimo\] \{\s*box-sizing: border-box;\s*padding-top: var\(--dsh-mimo-marquee-height/u)
})

test('the line scrolls by exactly one copy and loops', () => {
  const keyframes = CSS.match(/@keyframes [\w-]+ \{[^}]*\}[^}]*\}/u)?.[0] ?? ''
  assert.match(keyframes, /from \{ transform: translateX\(0\); \}/u)
  // -50% of a line whose content is the unit twice over is one whole copy.
  assert.match(keyframes, /to \{ transform: translateX\(-50%\); \}/u)
  const track = CSS.match(new RegExp(`\\.${MARQUEE_CLASS} > \\.${MARQUEE_TRACK_CLASS} \\{[^}]*\\}`))?.[0] ?? ''
  assert.match(track, /white-space|flex: none;/u)
  assert.match(track, /animation: [\w-]+ 70s linear infinite;/u)
})

test('the band respects a reduced-motion preference', () => {
  const reduced = CSS.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/u)?.[0] ?? ''
  assert.match(reduced, new RegExp(`\\.${MARQUEE_CLASS} > \\.${MARQUEE_TRACK_CLASS} \\{ animation: none; \\}`))
})

test('the band keeps a macOS desktop window draggable', () => {
  // ui-web's base.css subtracts every body child but #root from the window's
  // drag region, and the band now owns the top of the window.
  assert.match(
    CSS,
    new RegExp(`body\\[${SKIN_ATTRIBUTE}\\] > \\.${MARQUEE_CLASS} \\{\\s*-webkit-app-region: drag;`),
  )
})

test('the switch off track is repainted, not left on the hairline token', () => {
  // ui-primitives paints the off track with `--dsw-alias-border-l3`, which this
  // skin points at its black rule: unpainted, an off switch would render in the
  // same near-black as an on one.
  assert.match(CSS, /\[role='switch'\]\[aria-checked='false'\] \{\s*background: var\(--dsh-mimo-track\) !important;/u)
  // The on track stays the product's own brand fill.
  assert.doesNotMatch(CSS, /aria-checked='true'/u)
})

test('the remap covers each family of surface, ink, rule and accent token', () => {
  const expected = [
    '--dsw-alias-bg-base',
    '--dsw-alias-bg-layer-1',
    '--dsw-alias-bg-layer-2',
    '--dsw-alias-bg-layer-3',
    '--dsw-specific-sidebar-fill',
    '--dsw-specific-bubble',
    '--dsw-specific-input-major',
    '--dsw-alias-label-primary',
    '--dsw-alias-label-secondary',
    '--dsw-alias-label-tertiary',
    '--dsw-alias-border-l1',
    '--dsw-alias-border-l2',
    '--dsw-alias-border-l3',
    '--dsw-alias-border-l4',
    '--dsw-alias-link',
    '--dsw-alias-brand-text',
    '--dsw-alias-button-info-fill',
    '--dsw-alias-state-business-primary',
    '--dsw-alias-interactive-bg-hover',
    '--dsw-font-family',
    '--ds-font-family-code',
    '--dsw-radius-sm',
  ]
  for (const token of expected) {
    assert.match(CSS, new RegExp(`${token}:`), token)
  }
})

test('the shell divider is repainted through the token the sidebar already reads', () => {
  // ui-layout's sidebar column paints `border-right: 0.5px solid
  // var(--dsw-alias-border-l3)`, so this one token becomes the MiMo rule
  // without a selector that could go stale.
  assert.match(CSS, /--dsw-alias-border-l3: var\(--dsh-mimo-rule\)/u)
})

test('the accent stays an accent: primary fills are not repainted to it', () => {
  // The reference site's own primary button is black on the light page, so the
  // skin must not turn the product's primary fill into the accent.
  assert.doesNotMatch(CSS, /--dsw-alias-button-primary-fill: var\(--dsh-mimo-accent\)/u)
  assert.doesNotMatch(CSS, /--dsw-alias-brand-primary: var\(--dsh-mimo-accent\)/u)
})

test('every accent value the stylesheet spends is the one the applier derives', () => {
  // The stylesheet must never name an accent literal of its own: the fill, the
  // text variant and the wash all come from the palette module, so a custom
  // accent cannot be half-applied.
  for (const token of ['--dsw-alias-link', '--dsw-alias-brand-text']) {
    assert.match(CSS, new RegExp(`${token}: var\\(--dsh-mimo-accent-text\\) !important;`), token)
  }
  for (const token of ['--dsw-alias-brand-primary-new-colorprimary-new-color', '--dsw-alias-button-info-fill']) {
    assert.match(CSS, new RegExp(`${token}: var\\(--dsh-mimo-accent\\) !important;`), token)
  }
  assert.doesNotMatch(CSS, /#ff6700/u)
})

test('there is a dark shell block and it comes after the light one', () => {
  const dark = CSS.indexOf('body[data-dsh-mimo][data-dsh-mimo-dark]')
  assert.notEqual(dark, -1, 'the dark shell block is missing')
  // Both shell blocks match a body carrying the skin attribute, so source
  // order is the only thing that makes the dark values win.
  const lightBase = CSS.indexOf('--dsw-alias-bg-base: var(--dsh-mimo-page)')
  assert.ok(lightBase !== -1 && lightBase < dark, 'the dark block must follow the light block')
  // The dark block carries the page and ink declarations, not just a flag.
  const darkBlock = CSS.slice(dark, CSS.indexOf('\n}', dark))
  assert.match(darkBlock, /--dsw-alias-bg-base: var\(--dsh-mimo-page\)/u)
  assert.match(darkBlock, /--dsw-alias-label-primary: var\(--dsh-mimo-ink\)/u)
  assert.match(darkBlock, /color-scheme: dark/u)
})

test('the state, toast and diff colours are left to the product theme', () => {
  // DSH already switches these on body[data-ds-dark-theme]. Pinning them with
  // this skin's !important aliases would put an amber tuned for a white page on
  // the black one, so the skin must not declare them at all.
  for (const token of [
    '--dsw-alias-state-warn-primary',
    '--dsw-alias-state-warn-label',
    '--dsw-alias-state-success-primary',
    '--dsw-alias-state-error-primary',
    '--dsw-alias-state-idle-primary',
    '--dsw-alias-toast-bg',
    '--dsw-alias-toast-label',
    '--dsw-alias-tooltip-bg',
    '--dsw-alias-tooltip-key-bg',
    '--dsw-alias-file-diff-added-bg',
    '--dsw-alias-file-diff-deleted-bg',
    '--dsw-specific-bubble-highlight',
  ]) {
    assert.doesNotMatch(CSS, new RegExp(`${token}:`), token)
  }
})

test('the shell-independent remap is declared once, not per shell', () => {
  // Radii, faces and scrollbars do not change between shells; duplicating them
  // would let the two blocks drift.
  for (const token of ['--dsw-radius-sm', '--dsw-font-family', '--dsw-alias-scrollbar-bg-l1']) {
    const occurrences = CSS.split(`${token}:`).length - 1
    assert.equal(occurrences, 1, `${token} declared ${occurrences} times`)
  }
})

test('installStyles is idempotent and creates one element', () => {
  const doc = createFakeDocument()
  try {
    installStyles(doc)
    installStyles(doc)
    const styles = doc.head.children.filter(child => child.tagName === 'style')
    assert.equal(styles.length, 1)
    assert.equal(styles[0].id, STYLE_ID)
    assert.equal(styles[0].textContent, CSS)
  } finally {
    doc.restore()
  }
})
