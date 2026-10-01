/**
 * The colour shapes the palette and the card exchange.
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
