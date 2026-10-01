/**
 * An independent WCAG contrast implementation for the tests.
 *
 * Deliberately not the plugin's own: `src/color.ts` is what derives the accent
 * values, so measuring them with the same code would only prove it agrees with
 * itself. This one is written straight from the WCAG definition.
 */

/**
 * Relative luminance of a `#rrggbb` literal.
 * @param hex - the literal.
 * @returns luminance, 0 (black) … 1 (white).
 */
export function luminance(hex) {
  const digits = Number.parseInt(hex.slice(1), 16)
  const channel = (shift) => {
    const value = ((digits >> shift) & 255) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

/**
 * Contrast ratio between two `#rrggbb` literals.
 * @param a - one literal.
 * @param b - the other literal.
 * @returns the ratio, 1 … 21, order-independent.
 */
export function contrast(a, b) {
  const first = luminance(a)
  const second = luminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}
