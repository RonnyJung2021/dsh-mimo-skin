/**
 * What the configured accent becomes where it is rendered as text, per shell.
 *
 * The card shows this because a colour the user types is a fill: whether it can
 * also carry text is a question only the shell's own page can answer. It is the
 * same derivation the applier makes — `readableOn` against the shell's page, in
 * the direction that shell declares — so the card never promises a value the page
 * would not paint.
 */

import type { AccentPreview, AccentText } from '../types/panel.ts'
import type { MimoShell } from '../types/palette.ts'
import type { Rgb } from '../types/color.ts'
import { contrast, parseColor, readableOn } from '../utils/color.ts'
import { DARK_SHELL, LIGHT_SHELL } from './palette.ts'

/**
 * Derive one shell's accent-text value.
 * @param fill - the parsed accent.
 * @param shell - the shell the text would sit on.
 * @returns the literal and its contrast ratio, or undefined when the shell's own
 *          page colour does not parse — impossible for the two compiled shells,
 *          which is why the caller treats it as "no preview" rather than as data.
 */
function derive(fill: Rgb, shell: MimoShell): AccentText | undefined {
  const page = parseColor(shell.page)
  if (page === undefined) return undefined
  const value = readableOn(fill, page, shell.textDirection)
  const ratio = contrast(parseColor(value) ?? fill, page)
  return { value, ratio: `${ratio.toFixed(1)}:1` }
}

/**
 * Derive what one accent becomes where it is rendered as text.
 * @param accent - the draft's accent literal.
 * @returns one value per shell, or undefined when the literal does not parse.
 */
export function accentPreview(accent: string): AccentPreview | undefined {
  const fill = parseColor(accent)
  if (fill === undefined) return undefined
  const light = derive(fill, LIGHT_SHELL)
  const dark = derive(fill, DARK_SHELL)
  if (light === undefined || dark === undefined) return undefined
  return { light, dark }
}
