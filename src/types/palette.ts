/**
 * The palette's shapes: one shell, the input the skin is painted from, and the
 * custom properties that come out.
 */

import type { ShellId, TextDirection } from '../enums/shell.ts'
import type { MimoTheme } from '../enums/theme.ts'

/** One MiMo shell: the warm paper, or its strict black-paper inversion. */
export interface MimoShell {
  /** Identifier this shell is published under. */
  readonly id: ShellId
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
  /** Which way to move the accent until it can carry text on {@link page}. */
  readonly textDirection: TextDirection
  /** Ink wash for hover on quiet surfaces. */
  readonly hover: string
  /** Ink wash for the pressed/selected step above hover. */
  readonly active: string
  /** Push of the pointer: the inverse of the shell. */
  readonly shadow: string
}

/** Which shell is live, plus the mark the skin installs. */
export interface MimoSkinInput {
  /** Configured theme choice; `auto` follows the document's own dark attribute. */
  readonly theme: MimoTheme
  /** Accent as a fill, a `#rrggbb` literal. */
  readonly accent: string
  /** Whether the scrolling band is painted. */
  readonly pattern: boolean
  /** Ink strength of the band, 0…1. */
  readonly patternOpacity: number
}

/** The palette rendered as the custom properties the stylesheet consumes. */
export type MimoVariables = Readonly<Record<string, string>>
