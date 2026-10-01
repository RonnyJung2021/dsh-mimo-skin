/**
 * Colour arithmetic for the one appearance field a user types by hand.
 *
 * Both halves need it, so the module stays dependency-free and runs in either
 * face: the Host uses {@link isColor} to decide whether a configured accent is
 * usable, and the browser half uses {@link readableOn} to answer the question
 * the accent alone cannot — what the same hue looks like as *text*.
 *
 * The reference site's own accent, `#ff6700`, is 2.74:1 on its `#faf7f5` page.
 * That is fine for a filled dot and below the 4.5:1 AA floor for a link, so the
 * skin always derives a second value rather than trusting the one the user
 * picked.
 */

/** One 8-bit-per-channel colour. */
export interface Rgb {
  /** Red, 0…255. */
  readonly r: number
  /** Green, 0…255. */
  readonly g: number
  /** Blue, 0…255. */
  readonly b: number
}

/** Accepted literal forms: `#rgb`, `#rrggbb`. */
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu

/** Contrast floor a colour must reach before it may be rendered as text. */
export const AA_TEXT_CONTRAST = 4.5

/**
 * Read a colour literal.
 * @param value - candidate literal.
 * @returns the colour, or undefined when the literal is not one this module writes.
 */
export function parseColor(value: unknown): Rgb | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  if (!HEX.test(text)) return undefined
  const digits = text.slice(1)
  const full = digits.length === 3
    ? digits.split('').map(digit => `${digit}${digit}`).join('')
    : digits
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

/**
 * Whether a value is a colour literal this module can use.
 * @param value - candidate literal.
 * @returns true when {@link parseColor} accepts it.
 */
export function isColor(value: unknown): boolean {
  return parseColor(value) !== undefined
}

/**
 * Write a colour as `#rrggbb`.
 * @param color - colour to write.
 * @returns the lowercase literal.
 */
export function toHex(color: Rgb): string {
  const channel = (value: number): string => Math.round(value).toString(16).padStart(2, '0')
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`
}

/**
 * Mix a colour toward another one.
 * @param from - colour to start at.
 * @param to - colour to move toward.
 * @param amount - 0 keeps `from`, 1 arrives at `to`.
 * @returns the mixed colour.
 */
export function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  const at = Math.min(1, Math.max(0, amount))
  return {
    r: from.r + (to.r - from.r) * at,
    g: from.g + (to.g - from.g) * at,
    b: from.b + (to.b - from.b) * at,
  }
}

/**
 * WCAG relative luminance.
 * @param color - colour to measure.
 * @returns luminance, 0 (black) … 1 (white).
 */
export function luminance(color: Rgb): number {
  const channel = (value: number): number => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

/**
 * WCAG contrast ratio between two colours.
 * @param a - one colour.
 * @param b - the other colour.
 * @returns the ratio, 1 … 21, order-independent.
 */
export function contrast(a: Rgb, b: Rgb): number {
  const first = luminance(a)
  const second = luminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * The same hue, moved far enough from the page to be legible as text.
 *
 * The direction is the shell's, not a preference: a warm page is fixed by
 * darkening and a black page by lightening, which is also the direction that
 * raises contrast in each. A colour that already clears {@link AA_TEXT_CONTRAST}
 * is returned unchanged, so the accent stays the site's own value wherever it
 * can.
 * @param color - the accent as a fill.
 * @param page - the shell's page colour, i.e. what the text will sit on.
 * @param direction - which way to move: `darken` on a light page, `lighten` on a dark one.
 * @param floor - contrast ratio to reach; defaults to the AA text floor.
 * @returns the literal to use where the accent is rendered as text.
 */
export function readableOn(
  color: Rgb,
  page: Rgb,
  direction: 'darken' | 'lighten',
  floor: number = AA_TEXT_CONTRAST,
): string {
  if (contrast(color, page) >= floor) return toHex(color)
  const target: Rgb = direction === 'darken' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
  // A fixed step count rather than a search: the ramp is monotonic in contrast,
  // so walking it once and stopping at the first passing step always lands on
  // the closest value that clears the floor.
  const steps = 100
  for (let step = 1; step <= steps; step += 1) {
    const candidate = mix(color, target, step / steps)
    if (contrast(candidate, page) >= floor) return toHex(candidate)
  }
  return toHex(target)
}
