/**
 * The settings namespace this plugin's card edits.
 *
 * The namespace name is the row id, which is also the package name — the same
 * identity the engine uses when it turns a row whose `Config` has volatile
 * fields into a Settings namespace. Writes go through that namespace, land in
 * the profile patch, and are the only durable store this plugin has: page
 * `localStorage` is keyed by the engine's port, and the port changes on every
 * launch.
 */

import { isColor } from '../color.ts'
import { resolveSettings, type MimoTheme } from '../config.ts'
import { FIELD_IDS, type ErrorField, type SectionField } from './copy.ts'

/** Settings namespace owned by this plugin's loader row. */
export const SETTINGS_NAMESPACE = 'dsh-mimo-skin'

/**
 * Boot-global fields whose presence proves the current host half published.
 * @remarks A host half from before the row had a schema publishes only
 *          `{ enabled: true }`, which is exactly the difference the card's
 *          unavailable note has to report.
 */
export const PUBLISHED_KEYS = FIELD_IDS

/** The volatile section of this row's config — exactly what the card edits. */
export interface MimoSection {
  /** Which shell to paint; `auto` follows the document's own dark attribute. */
  theme: MimoTheme
  /** Accent as a fill, `#rrggbb`. */
  accent: string
  /** Whether the scrolling mark is painted. */
  pattern: boolean
  /** Ink strength of that mark, 0…1. */
  patternOpacity: number
  /** What the mark scrolls. */
  patternText: string
}

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
}

/** The current form state for one namespace, as the client half reads it. */
export interface ConfigFormView<T> {
  /** `loading` until the first accepted section, `unavailable` without a transport. */
  status: 'loading' | 'ready' | 'unavailable'
  /** Last accepted section, undefined before the first acceptance. */
  value: T | undefined
  /** Whether the host document accepts writes. */
  writable: boolean
}

/** One path-addressed edit, as the Settings service takes it. */
export interface SettingsPathOp {
  /** `set` writes the value; `unset` restores the composition layer. */
  op: 'set' | 'unset'
  /** Field path inside the row's config section. */
  path: readonly string[]
  /** Value for `set`. */
  value?: unknown
}

/** The Settings-form surface this plugin uses, narrowed to what it calls. */
export interface ConfigFormLike<T> {
  /** @returns the current form state. */
  getSnapshot(): ConfigFormView<T>
  /** Observe state changes. */
  subscribe(listener: () => void): () => void
  /** Queue edits, all fenced by one revision. */
  mutate(ops: readonly SettingsPathOp[]): Promise<boolean>
}

/** The `configForms` service, narrowed to the one method this plugin calls. */
export interface ConfigFormsLike {
  /** @returns the form for one settings namespace. */
  get<T>(namespace: string): ConfigFormLike<T>
}

/** The slots registry, narrowed to the calls this plugin makes. */
export interface SlotRegistryLike {
  /** Wait for a slot declaration, then contribute. */
  inject(name: string, contribute: () => void): void
  /** Contribute one entry to a declared slot. */
  register(options: Record<string, unknown>, component: unknown): unknown
}

const THEMES: readonly string[] = ['light', 'dark', 'auto']

/**
 * Whether the page's boot global came from the current host half.
 * @param scope - global scope to read; the page by default.
 * @returns true when the global carries at least one of the row's knobs.
 */
export function hostPublished(scope: Record<string, unknown> = globalThis as unknown as Record<string, unknown>): boolean {
  const raw = scope.__DSH_MIMO_SKIN__
  if (typeof raw !== 'object' || raw === null) return false
  const source = raw as Record<string, unknown>
  return PUBLISHED_KEYS.some(key => key in source)
}

/**
 * Narrow one unknown value to a finite number inside a range.
 * @param value - candidate.
 * @param min - range floor.
 * @param max - range ceiling.
 * @returns the candidate, or undefined when it is unusable.
 */
function bounded(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(max, Math.max(min, value))
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
  if (typeof value !== 'object' || value === null) return {}
  const source = value as Record<string, unknown>
  const section: Partial<MimoSection> = {}
  if (THEMES.includes(source.theme as string)) section.theme = source.theme as MimoTheme
  if (isColor(source.accent)) section.accent = (source.accent as string).trim().toLowerCase()
  if (typeof source.pattern === 'boolean') section.pattern = source.pattern
  const patternOpacity = bounded(source.patternOpacity, 0, 1)
  if (patternOpacity !== undefined) section.patternOpacity = patternOpacity
  if (typeof source.patternText === 'string' && source.patternText.trim() !== '') {
    section.patternText = source.patternText.trim()
  }
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
  if (!THEMES.includes(section.theme)) invalid.push('theme')
  if (!isColor(section.accent)) invalid.push('accent')
  if (typeof section.patternOpacity !== 'number'
    || !Number.isFinite(section.patternOpacity)
    || section.patternOpacity < 0
    || section.patternOpacity > 1) {
    invalid.push('patternOpacity')
  }
  if (section.patternText.trim() === '') invalid.push('patternText')
  return invalid
}

/**
 * The edits that write one whole section.
 * @param section - the values to write.
 * @returns one `set` per knob, so the Settings service fences them as one revision.
 */
export function sectionOps(section: MimoSection): SettingsPathOp[] {
  return FIELD_IDS.map(field => ({
    op: 'set' as const,
    path: [field] as readonly string[],
    value: section[field as SectionField] as unknown,
  }))
}
