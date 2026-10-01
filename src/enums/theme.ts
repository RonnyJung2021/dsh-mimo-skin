/**
 * The three theme choices a row may pin.
 *
 * A closed set rather than free text: the schema accepts exactly these, the card
 * lists them, and `resolveSettings` falls back to the default for anything else —
 * a bad skin must never keep the GUI from booting. The union type is derived from
 * the tuple, so the accepted values and the type cannot drift apart.
 */

/** Allowed theme choices: the warm page, its dark counterpart, or the product's own state. */
export const THEMES = ['light', 'dark', 'auto'] as const

/** Which MiMo shell the skin paints; `auto` follows the product's own light/dark state. */
export type MimoTheme = typeof THEMES[number]

/**
 * Whether a value is one of the accepted theme choices.
 * @param value - candidate.
 * @returns true when the value is a {@link MimoTheme}.
 */
export function isTheme(value: unknown): value is MimoTheme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}
