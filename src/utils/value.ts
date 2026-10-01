/**
 * Coercions for the two kinds of untrusted input this plugin takes.
 *
 * A row config from `cordis.yml`, and a settings section that arrives from the
 * host as plain JSON, can both hold anything: a hand-edited patch, an older host
 * half, or a value the schema rejected. Neither may throw — a bad skin must never
 * keep the GUI from booting — so every field is narrowed here, and a caller that
 * needs to *report* rather than fall back asks for the `undefined`-returning form.
 */

/**
 * Whether a value is a plain object this module can read fields off.
 * @param value - candidate.
 * @returns true for a non-null object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Narrow one value to a finite number inside a range.
 * @param value - candidate.
 * @param min - inclusive lower bound.
 * @param max - inclusive upper bound.
 * @returns the clamped number, or undefined when the candidate is not a number.
 */
export function numberWithin(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(max, Math.max(min, value))
}

/**
 * The same narrowing, with a default for values that are not usable numbers.
 * @param value - candidate.
 * @param fallback - value used when the candidate is not a number.
 * @param min - inclusive lower bound.
 * @param max - inclusive upper bound.
 * @returns the accepted number.
 */
export function numberOr(value: unknown, fallback: number, min: number, max: number): number {
  return numberWithin(value, min, max) ?? fallback
}

/**
 * Accept one string only when it is non-blank.
 * @param value - candidate.
 * @param fallback - value used when the candidate is blank or not a string.
 * @returns the trimmed string.
 */
export function nonBlankText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed === '' ? fallback : trimmed
}
