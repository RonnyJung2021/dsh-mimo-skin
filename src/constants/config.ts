/**
 * The row's config section, as both halves and the card must agree on it.
 *
 * One list, because three places have to name the same fields in the same order:
 * the Host half publishes them into the page, the card lists them, and a save
 * writes them back as one revision. The Host used to keep its own copy of this
 * list under another name, which is exactly the drift this module removes.
 */

/** The knobs the card edits, in the order it lists them. */
export const SECTION_FIELDS = ['theme', 'accent', 'pattern', 'patternOpacity', 'patternText'] as const

/** One knob the card edits. */
export type SectionField = typeof SECTION_FIELDS[number]

/**
 * The knobs a draft can be rejected on.
 * @remarks `pattern` is a switch, so there is no value it could be refused on.
 */
export const ERROR_FIELDS = ['theme', 'accent', 'patternOpacity', 'patternText'] as const

/** One knob an edit can be rejected on. */
export type ErrorField = typeof ERROR_FIELDS[number]
