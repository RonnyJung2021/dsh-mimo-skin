/**
 * The MiMo palette, read off the reference site's own stylesheet.
 *
 * Sources, so a future edit can be checked against the live site rather than
 * against taste. All of these are declared on `mimo.xiaomi.com`:
 *
 * - `:root` publishes the app tokens this skin is built from:
 *   `--bg-primary:#faf7f5`, `--bg-secondary:#f5f0eb`, `--text-primary:#1a1a1a`,
 *   `--text-secondary:#555`, `--text-tertiary:#888`, `--accent:#ff6700`,
 *   `--border:#0000001a`, `--font-serif`, `--font-title`, `--font-mono`.
 * - Its section shells are black hairlines on that warm page: rows are
 *   `background:#faf7f5; border-bottom:1px solid #000`, hovering to
 *   `background:#000` with `color:#fff`; index numerals are
 *   `color:#999; font-family:MiSans-Regular,monospace; font-size:24px;
 *   font-weight:600`; the content card is
 *   `background:#ffffff73; border:1px solid #00000012; border-radius:3px`.
 * - Its nav is a translucent page wash: `rgba(250,247,245,0.8)`.
 * - Its hero wordmark is 96px at weight 700 with `letter-spacing:1.92px`, and
 *   the mark behind it is `rgba(0,0,0,0.05)` at 52px with `letter-spacing:0.3em`.
 *
 * Two things here are **derived rather than transcribed**, and both are
 * deliberate:
 *
 * - **The accent's text variant.** The user picks one colour; the skin answers
 *   what that colour looks like as *text* on the shell's own page. The site's
 *   `#ff6700` is 2.74:1 on `#faf7f5` — a fine fill, an unreadable link.
 * - **The accent's wash.** The accent at the shell's own low alpha, so a
 *   custom accent carries through selected rows and inline code.
 */

import { parseColor, readableOn, toHex } from '../color.ts'

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

/** One MiMo shell: the warm paper, or its strict black-paper inversion. */
export interface MimoShell {
  /** Identifier this shell is published under. */
  readonly id: 'light' | 'dark'
  /** Page background. MiMo's `--bg-primary` / its dark `--rp-home-bg`. */
  readonly page: string
  /** Nested fill, one step off the page. MiMo's `--bg-secondary`. */
  readonly raised: string
  /** Body text. MiMo's `--text-primary`, inverted in dark. */
  readonly ink: string
  /** Secondary text. MiMo's `--text-secondary`, inverted in dark. */
  readonly muted: string
  /** Tertiary text. MiMo's `--text-tertiary`, inverted in dark. */
  readonly faint: string
  /** Hairline rules between page regions. MiMo's `1px solid #000`, inverted. */
  readonly rule: string
  /** The lighter rule inside cards. MiMo's `1px solid #00000012`, inverted. */
  readonly ruleSoft: string
  /**
   * The off track of a control that paints its own body from a rule token.
   *
   * DSH's switch paints its off track with `--dsw-alias-border-l3`, which this
   * skin points at `rule`. Left alone the inactive track would come out in the
   * same near-black ink as the active one, so the skin repaints it from this
   * wash: the weight the product's own light theme gives an off track, and in
   * dark the sixteen-percent step it uses behind a hairline.
   */
  readonly track: string
  /** Alpha suffix for the accent used as a wash on links' and selected rows' ground. */
  readonly washAlpha: string
  /**
   * Which way to move the accent until it can carry text on {@link page}.
   * @remarks A warm page is fixed by darkening, a black page by lightening; each
   *          is also the direction that raises contrast against its own page.
   */
  readonly textDirection: 'darken' | 'lighten'
  /** Ink wash for hover on quiet surfaces. */
  readonly hover: string
  /** Ink wash for the pressed/selected step above hover. */
  readonly active: string
  /** Push of the pointer: the inverse of the shell. */
  readonly shadow: string
}

/**
 * MiMo's light shell, the reference site's own page.
 *
 * The card and rule values are the reference's own translucent inks, so they
 * are recorded here as the literals the site declares rather than as a mix.
 */
export const LIGHT_SHELL: MimoShell = {
  id: 'light',
  page: '#faf7f5',
  raised: '#f5f0eb',
  ink: '#1a1a1a',
  muted: '#555555',
  faint: '#888888',
  rule: '#000000',
  ruleSoft: '#00000012',
  track: '#0000001f',
  washAlpha: '1a',
  textDirection: 'darken',
  hover: '#0000000a',
  active: '#00000014',
  shadow: '#00000014',
}

/**
 * The dark shell: the same syntax flipped to black paper and white ink.
 *
 * The inversion rule is: 浅色是米白纸 `#FAF7F5` + 纯黑墨 `#000`，深色整体翻转成黑纸白墨
 * —— plus the reference's own dark page colour (`--rp-home-bg:#000`), not the cool Rspress
 * grays that page leaves untouched.
 *
 * The page is pure black and the nested fill one step off it, so the paper and
 * the cards keep a visible edge without a shadow.
 */
export const DARK_SHELL: MimoShell = {
  id: 'dark',
  page: '#000000',
  raised: '#111111',
  ink: '#ffffff',
  muted: '#b3b3b3',
  faint: '#8a8a8a',
  rule: '#ffffff',
  ruleSoft: '#ffffff29',
  track: '#ffffff29',
  washAlpha: '26',
  textDirection: 'lighten',
  hover: '#ffffff12',
  active: '#ffffff1f',
  shadow: '#00000080',
}

/** Which shell is live, plus the mark the skin installs. */
export interface MimoSkinInput {
  /** Configured theme choice; `auto` follows the document's own dark attribute. */
  readonly theme: 'light' | 'dark' | 'auto'
  /** Accent as a fill, a `#rrggbb` literal. */
  readonly accent: string
  /** Whether the scrolling band is painted. */
  readonly pattern: boolean
  /** Ink strength of the band, 0…1. */
  readonly patternOpacity: number
}

/** The palette rendered as the custom properties the stylesheet consumes. */
export type MimoVariables = Readonly<Record<string, string>>

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

/**
 * The accent as the three values the stylesheet spends it as.
 * @param accent - the configured `#rrggbb` fill.
 * @param shell - the shell the text will sit on.
 * @returns the fill, the text variant, and the wash.
 */
function accents(accent: string, shell: MimoShell): { fill: string, text: string, wash: string } {
  const fill = parseColor(accent)
  const page = parseColor(shell.page)
  // A literal that does not parse cannot get here — `resolveSettings` and the
  // card both reject it — but a fallback keeps one bad value from erasing the
  // accent rather than merely spoiling it.
  if (fill === undefined || page === undefined) {
    return { fill: accent, text: accent, wash: accent }
  }
  const normalized = toHex(fill)
  return {
    fill: normalized,
    text: readableOn(fill, page, shell.textDirection),
    wash: `${normalized}${shell.washAlpha}`,
  }
}

/**
 * Render the palette as the custom properties the stylesheet consumes.
 * @param input - the resolved shell, accent and mark.
 * @param shell - the shell to render.
 * @returns variable name to value, in stylesheet order.
 */
export function skinVariables(input: MimoSkinInput, shell: MimoShell): MimoVariables {
  const accent = accents(input.accent, shell)
  return {
    '--dsh-mimo-page': shell.page,
    '--dsh-mimo-raised': shell.raised,
    '--dsh-mimo-ink': shell.ink,
    '--dsh-mimo-muted': shell.muted,
    '--dsh-mimo-faint': shell.faint,
    '--dsh-mimo-rule': shell.rule,
    '--dsh-mimo-rule-soft': shell.ruleSoft,
    '--dsh-mimo-track': shell.track,
    '--dsh-mimo-accent': accent.fill,
    '--dsh-mimo-accent-text': accent.text,
    '--dsh-mimo-accent-wash': accent.wash,
    '--dsh-mimo-hover': shell.hover,
    '--dsh-mimo-active': shell.active,
    '--dsh-mimo-shadow': shell.shadow,
    // Zero when the band is off, so the page it would have pushed down closes up.
    '--dsh-mimo-marquee-height': input.pattern ? `${MARQUEE_HEIGHT}px` : '0px',
    '--dsh-mimo-pattern-opacity': String(input.pattern ? input.patternOpacity : 0),
  }
}

/**
 * Resolve the variables for a document's current theme state.
 * @param input - the resolved shell, accent and mark.
 * @param documentIsDark - whether the document currently carries the dark attribute.
 * @returns variable name to value, in stylesheet order.
 */
export function variablesFor(input: MimoSkinInput, documentIsDark: boolean): MimoVariables {
  return skinVariables(input, shellFor(input.theme, documentIsDark))
}

/**
 * Pick the shell for the document's current theme state.
 * @param setting - the configured theme choice.
 * @param documentIsDark - whether the document currently carries the dark attribute.
 * @returns the shell to paint.
 */
export function shellFor(setting: 'light' | 'dark' | 'auto', documentIsDark: boolean): MimoShell {
  if (setting === 'light') return LIGHT_SHELL
  if (setting === 'dark') return DARK_SHELL
  return documentIsDark ? DARK_SHELL : LIGHT_SHELL
}
