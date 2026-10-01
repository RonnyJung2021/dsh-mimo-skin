/**
 * The palette: the two shells, the accent derived from one user-chosen colour,
 * and the custom properties the stylesheet reads. The shell literals asserted
 * here are read off the reference site's own stylesheet, so a change to them is
 * a claim about the reference.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'
import { contrast } from './contrast.mjs'

const {
  DARK_SHELL,
  LIGHT_SHELL,
  MARQUEE_HEIGHT,
  MONO_STACK,
  PALETTE_VARIABLES,
  SANS_STACK,
  SERIF_STACK,
  shellFor,
  skinVariables,
} = await loadModule('client/palette.ts')

const INPUT = {
  theme: 'auto',
  accent: '#ff6700',
  pattern: true,
  patternOpacity: 0.05,
}

test('the light shell carries the reference site tokens verbatim', () => {
  // :root on mimo.xiaomi.com
  assert.equal(LIGHT_SHELL.page, '#faf7f5')
  assert.equal(LIGHT_SHELL.raised, '#f5f0eb')
  assert.equal(LIGHT_SHELL.ink, '#1a1a1a')
  assert.equal(LIGHT_SHELL.muted, '#555555')
  assert.equal(LIGHT_SHELL.faint, '#888888')
  // its card rule: 1px solid #00000012
  assert.equal(LIGHT_SHELL.ruleSoft, '#00000012')
  // its section rules: 1px solid #000
  assert.equal(LIGHT_SHELL.rule, '#000000')
})

test('the dark shell is a strict black-paper inversion', () => {
  // The rule the shell follows, in the reference's own vocabulary:
  // --paper:#000000, --ink:#FFFFFF, --rule:#FFFFFF, --rule-soft:rgba(255,255,255,.20)
  assert.equal(DARK_SHELL.id, 'dark')
  assert.equal(DARK_SHELL.page, '#000000')
  assert.equal(DARK_SHELL.ink, '#ffffff')
  assert.equal(DARK_SHELL.rule, '#ffffff')
  assert.equal(DARK_SHELL.ruleSoft, '#ffffff29')
  // The nested fill is one step off the black page, not a warm brown.
  assert.equal(DARK_SHELL.raised, '#111111')
})

test('the accent is not a shell literal: each shell only says how to fix it', () => {
  // The accent is a setting now, so a shell carries no accent value of its own;
  // it carries the direction its page needs text moved in.
  assert.equal(LIGHT_SHELL.textDirection, 'darken')
  assert.equal(DARK_SHELL.textDirection, 'lighten')
  for (const shell of [LIGHT_SHELL, DARK_SHELL]) {
    assert.equal('accent' in shell, false, shell.id)
    assert.equal('accentText' in shell, false, shell.id)
    assert.match(shell.washAlpha, /^[0-9a-f]{2}$/u, shell.id)
  }
})

test('the switch off track is a wash on both shells, never the rule ink', () => {
  // ui-primitives/Switch paints its off track from `--dsw-alias-border-l3`,
  // which this skin points at the rule: without its own value the inactive
  // state would come out as the near-black of the active one.
  for (const shell of [LIGHT_SHELL, DARK_SHELL]) {
    assert.notEqual(shell.track, shell.rule, shell.id)
    assert.notEqual(shell.track, shell.page, shell.id)
    // An eight-digit hex, so the wash itself is the alpha step.
    assert.match(shell.track, /^#(?:[0-9a-f]{2}){4}$/u)
    const alpha = Number.parseInt(shell.track.slice(7), 16) / 255
    assert.ok(alpha > 0.08 && alpha < 0.3, `${shell.id} track alpha ${alpha}`)
  }
})

test('both shells invert in step with each other', () => {
  // Same roles, opposite ends: a shell that only changed one of these would
  // leave, say, a black rule on a black page.
  for (const role of ['page', 'ink', 'muted', 'faint', 'rule', 'ruleSoft', 'track', 'hover', 'active', 'shadow']) {
    assert.notEqual(DARK_SHELL[role], LIGHT_SHELL[role], role)
  }
  assert.notEqual(DARK_SHELL.textDirection, LIGHT_SHELL.textDirection)
})

test('the three faces are fixed stacks, not settings', () => {
  // The skin ships no font files, so a hand-typed stack would only re-point at
  // families the machine may not have. Each names a family and lands on a
  // generic one.
  for (const stack of [SERIF_STACK, SANS_STACK, MONO_STACK]) {
    assert.match(stack, /[A-Za-z]/u)
    assert.match(stack, /serif$|sans-serif$|monospace$/u)
  }
  assert.match(SERIF_STACK, /serif$/u)
  assert.match(SANS_STACK, /sans-serif$/u)
  assert.match(MONO_STACK, /monospace$/u)
})

test('shellFor follows the setting and the document state', () => {
  assert.equal(shellFor('light', false), LIGHT_SHELL)
  // An explicit light choice wins over a dark document.
  assert.equal(shellFor('light', true), LIGHT_SHELL)
  assert.equal(shellFor('dark', false), DARK_SHELL)
  assert.equal(shellFor('dark', true), DARK_SHELL)
  // auto is the document's own state.
  assert.equal(shellFor('auto', false), LIGHT_SHELL)
  assert.equal(shellFor('auto', true), DARK_SHELL)
})

test('every declared variable is written, in order, and never empty', () => {
  const variables = skinVariables(INPUT, LIGHT_SHELL)
  assert.deepEqual(Object.keys(variables), [...PALETTE_VARIABLES])
  for (const name of PALETTE_VARIABLES) {
    assert.equal(typeof variables[name], 'string', name)
    assert.notEqual(variables[name], '', name)
  }
  assert.equal(variables['--dsh-mimo-page'], LIGHT_SHELL.page)
  assert.equal(variables['--dsh-mimo-accent'], '#ff6700')
})

test('the band height is the strip when on and zero when off', () => {
  assert.equal(skinVariables(INPUT, LIGHT_SHELL)['--dsh-mimo-marquee-height'], `${MARQUEE_HEIGHT}px`)
  assert.equal(
    skinVariables({ ...INPUT, pattern: false }, LIGHT_SHELL)['--dsh-mimo-marquee-height'],
    '0px',
  )
})

test('the pattern opacity is the configured value, or zero when off', () => {
  assert.equal(skinVariables(INPUT, LIGHT_SHELL)['--dsh-mimo-pattern-opacity'], '0.05')
  assert.equal(
    skinVariables({ ...INPUT, pattern: false }, LIGHT_SHELL)['--dsh-mimo-pattern-opacity'],
    '0',
  )
})

test('a chosen accent reaches the fill and the wash it is spent as', () => {
  const variables = skinVariables({ ...INPUT, accent: '#0095ff' }, LIGHT_SHELL)
  assert.equal(variables['--dsh-mimo-accent'], '#0095ff')
  assert.equal(variables['--dsh-mimo-accent-wash'], `#0095ff${LIGHT_SHELL.washAlpha}`)
  // ...and the text variant moves with it, which is the whole point of deriving.
  assert.notEqual(variables['--dsh-mimo-accent-text'], '#0095ff')
})

test('the accent used for text clears AA on either shell, whatever the accent', () => {
  for (const accent of ['#ff6700', '#0095ff', '#00a870', '#7b61ff', '#ffd400', '#111111', '#f5f0eb']) {
    const light = skinVariables({ ...INPUT, accent }, LIGHT_SHELL)['--dsh-mimo-accent-text']
    const dark = skinVariables({ ...INPUT, accent }, DARK_SHELL)['--dsh-mimo-accent-text']
    assert.ok(contrast(light, LIGHT_SHELL.page) >= 4.5, `${accent} on paper: ${contrast(light, LIGHT_SHELL.page)}`)
    assert.ok(contrast(dark, DARK_SHELL.page) >= 4.5, `${accent} on black: ${contrast(dark, DARK_SHELL.page)}`)
  }
})

test('the default accent survives as a fill and is only moved where it is text', () => {
  const light = skinVariables(INPUT, LIGHT_SHELL)
  // MiMo's own #ff6700 is 2.74:1 on its paper: fine for a filled dot, below AA
  // for a link. Pinned because the temptation is to collapse the two back into
  // one value.
  assert.equal(light['--dsh-mimo-accent'], '#ff6700')
  assert.notEqual(light['--dsh-mimo-accent-text'], '#ff6700')
  // On black it already reads at 7.2:1, so the dark shell leaves the fill alone
  // and there is nothing to fix.
  const dark = skinVariables(INPUT, DARK_SHELL)
  assert.equal(dark['--dsh-mimo-accent'], '#ff6700')
  assert.equal(dark['--dsh-mimo-accent-text'], '#ff6700')
})

test('an accent that cannot parse is passed through rather than erased', () => {
  // `resolveSettings` and the card both reject such a value before it gets
  // here; this is the last line, and it must not silently drop the accent.
  const variables = skinVariables({ ...INPUT, accent: 'not a colour' }, LIGHT_SHELL)
  assert.equal(variables['--dsh-mimo-accent'], 'not a colour')
  assert.equal(variables['--dsh-mimo-accent-text'], 'not a colour')
})

test('the dark shell reaches the same variable set with dark values', () => {
  const light = skinVariables(INPUT, LIGHT_SHELL)
  const dark = skinVariables(INPUT, DARK_SHELL)
  assert.deepEqual(Object.keys(light), Object.keys(dark))
  // Only the literal shell colours move. The faces are shared, the band's
  // height and ink are the configured values, and the accent fill is whatever
  // the user chose — its derived text variant and its wash both follow the
  // shell.
  const shared = new Set([
    '--dsh-mimo-marquee-height',
    '--dsh-mimo-pattern-opacity',
    '--dsh-mimo-accent',
  ])
  for (const name of PALETTE_VARIABLES) {
    if (shared.has(name)) {
      assert.equal(light[name], dark[name], name)
      continue
    }
    assert.notEqual(light[name], dark[name], name)
  }
})

test('the text ramps keep a readable contrast on their own paper', () => {
  for (const shell of [LIGHT_SHELL, DARK_SHELL]) {
    // Body copy clears the 4.5:1 AA floor with room to spare.
    assert.ok(contrast(shell.ink, shell.page) > 7, `${shell.id} ink ${contrast(shell.ink, shell.page)}`)
    // Secondary copy clears it too.
    assert.ok(contrast(shell.muted, shell.page) > 4.5, `${shell.id} muted ${contrast(shell.muted, shell.page)}`)
    // Tertiary copy is a caption tier; it must still beat the 3:1 large-text floor.
    assert.ok(contrast(shell.faint, shell.page) > 3, `${shell.id} faint ${contrast(shell.faint, shell.page)}`)
    // The rule has to be visible against the surface it divides.
    assert.ok(contrast(shell.rule, shell.page) > 3, `${shell.id} rule ${contrast(shell.rule, shell.page)}`)
  }
})
