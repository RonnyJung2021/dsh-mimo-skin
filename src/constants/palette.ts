/**
 * The palette's fixed half: the three faces, the band's height, and the custom
 * properties the stylesheet reads.
 *
 * None of this is configurable, and that is deliberate: the skin ships no font
 * files, so a hand-typed stack would only re-point at families the machine may
 * not have. The variable names are a contract between `client/palette.ts`, which
 * writes them, and `client/styles/page.ts`, which spends them.
 */

/** Prose face, set on `body` so the reading column itself changes. */
export const SERIF_STACK = "'PT Serif', 'Noto Serif SC', 'Songti SC', Georgia, 'Times New Roman', serif"

/** Chrome face: navigation, controls, labels, numbers. MiMo's `--font-title` role. */
export const SANS_STACK = "'MiSans', 'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"

/** Code face. MiMo's `--font-mono`, kept off the prose face. */
export const MONO_STACK = "'SF Mono', 'Fira Code', 'JetBrains Mono', Consolas, 'Liberation Mono', Menlo, monospace"

/**
 * The mark's face as a fraction of the strip's height.
 *
 * The strip is a setting, so the face has to follow it or a shorter strip would
 * crop the glyphs. 0.58 is the ratio the skin's first fixed strip had (30px of
 * type in 52px), so a strip set back to 52 looks exactly as it did.
 */
export const MARK_FACE_RATIO = 0.58

/** Custom-property names the skin writes, in the order the stylesheet reads them. */
export const PALETTE_VARIABLES = [
  '--dsh-mimo-page',
  '--dsh-mimo-raised',
  '--dsh-mimo-ink',
  '--dsh-mimo-muted',
  '--dsh-mimo-faint',
  '--dsh-mimo-rule',
  '--dsh-mimo-rule-soft',
  '--dsh-mimo-track',
  '--dsh-mimo-accent',
  '--dsh-mimo-accent-text',
  '--dsh-mimo-accent-wash',
  '--dsh-mimo-hover',
  '--dsh-mimo-active',
  '--dsh-mimo-shadow',
  '--dsh-mimo-marquee-height',
  '--dsh-mimo-pattern-opacity',
] as const
