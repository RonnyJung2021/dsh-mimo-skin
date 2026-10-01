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
 * Height of the scrolling band, in pixels.
 *
 * The line renders at `clamp(20px, 2.2vw, 30px)`, so this leaves the mark a
 * little air above and below at every width. The page is pushed down by exactly
 * this much, which is why it is one value and not two.
 */
export const MARQUEE_HEIGHT = 52

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
