/**
 * The card's settings section, as values rather than as a form.
 *
 * Everything here is what the card and the apply path do with one section: narrow
 * a hostile or stale one, refuse a draft the settings service would reject, and
 * turn an accepted draft into the edits that store it. The namespace and the field
 * lists live in `constants/`, the form surface in `types/settings.ts`.
 */

import { PATTERN_HEIGHT_MAX, PATTERN_HEIGHT_MIN, SECTION_FIELDS, type ErrorField, type SectionField } from '../constants/config.ts'
import { isTheme } from '../enums/theme.ts'
import type { MimoSection, SettingsPathOp } from '../types/settings.ts'
import { isColor } from './color.ts'
import { resolveSettings } from './config.ts'
import { isRecord, isNumberWithin, nonBlankText, numberWithin } from './value.ts'

/**
 * Defaults for the card's reset control, taken from the plugin's one default
 * table: `resolveSettings` is what the browser half applies when the page
 * carries no published value, so the reset button lands on exactly that state.
 */
const DEFAULTS = resolveSettings(undefined)

/** Everything the 恢复默认 button writes back. */
export const SECTION_DEFAULTS: MimoSection = {
  theme: DEFAULTS.theme,
  accent: DEFAULTS.accent,
  pattern: DEFAULTS.pattern,
  patternOpacity: DEFAULTS.patternOpacity,
  patternText: DEFAULTS.patternText,
  patternHeight: DEFAULTS.patternHeight,
}

/**
 * Narrow one form section to the config fields this plugin applies.
 *
 * The section arrives from the host as plain JSON: an older host half, a
 * hand-edited patch, or a value the schema rejected can all put something
 * unexpected here, and every caller treats a missing field as "keep what the
 * boot global said".
 * @param value - the raw section, when the form has one.
 * @returns the fields that are usable, possibly none.
 */
export function sectionOf(value: unknown): Partial<MimoSection> {
  if (!isRecord(value)) return {}
  const section: Partial<MimoSection> = {}
  if (isTheme(value.theme)) section.theme = value.theme
  if (isColor(value.accent)) section.accent = (value.accent as string).trim().toLowerCase()
  if (typeof value.pattern === 'boolean') section.pattern = value.pattern
  const patternOpacity = numberWithin(value.patternOpacity, 0, 1)
  if (patternOpacity !== undefined) section.patternOpacity = patternOpacity
  if (typeof value.patternText === 'string' && value.patternText.trim() !== '') {
    section.patternText = value.patternText.trim()
  }
  const patternHeight = numberWithin(value.patternHeight, PATTERN_HEIGHT_MIN, PATTERN_HEIGHT_MAX)
  if (patternHeight !== undefined) section.patternHeight = patternHeight
  return section
}

/**
 * Which knobs of one draft the settings service would have to reject.
 *
 * The checks are the ones the card can actually produce: a colour literal, a
 * bounded number, and a mark that is not blank. `resolveSettings` would fall
 * back on all three, but falling back silently is exactly what a form must not
 * do — the user would press Save and watch the field revert with no reason
 * given.
 * @param section - the draft the card is holding.
 * @returns the offending fields, in the order the card lists them.
 */
export function invalidFields(section: MimoSection): ErrorField[] {
  const invalid: ErrorField[] = []
  if (!isTheme(section.theme)) invalid.push('theme')
  if (!isColor(section.accent)) invalid.push('accent')
  if (!isNumberWithin(section.patternOpacity, 0, 1)) invalid.push('patternOpacity')
  if (nonBlankText(section.patternText, '') === '') invalid.push('patternText')
  if (!isNumberWithin(section.patternHeight, PATTERN_HEIGHT_MIN, PATTERN_HEIGHT_MAX)) {
    invalid.push('patternHeight')
  }
  return invalid
}

/**
 * The edits that write one whole section.
 * @param section - the values to write.
 * @returns one `set` per knob, so the Settings service fences them as one revision.
 */
export function sectionOps(section: MimoSection): SettingsPathOp[] {
  return SECTION_FIELDS.map(field => ({
    op: 'set' as const,
    path: [field] as readonly string[],
    value: section[field as SectionField] as unknown,
  }))
}
