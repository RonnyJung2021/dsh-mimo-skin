/**
 * The shells a palette can describe, and the direction the accent travels when it
 * has to carry text.
 *
 * Both are closed sets the palette, the applier and the card share.
 */

/** One shell's identifier. */
export const SHELL_IDS = ['light', 'dark'] as const

/** Which shell a palette describes. */
export type ShellId = typeof SHELL_IDS[number]

/**
 * Which way to move an accent until it can carry text.
 * @remarks The direction is the shell's, not a preference: a warm page is fixed by
 *          darkening and a black page by lightening, which is also the direction
 *          that raises contrast in each.
 */
export const TEXT_DIRECTIONS = ['darken', 'lighten'] as const

/** Direction a shell's accent-text derivation moves in. */
export type TextDirection = typeof TEXT_DIRECTIONS[number]
