/**
 * What a row may configure, and what both halves resolve it to.
 *
 * These live in one module because the Host half and the browser half must agree
 * on the shape field by field: the Host resolves a row into {@link MimoSettings}
 * and publishes it, the browser half reads the very same shape back.
 */

import type { MimoTheme } from '../enums/theme.ts'

/** Resolved settings both halves agree on. */
export interface MimoSettings {
  /** Which shell to paint; `auto` follows the document's own dark attribute. */
  readonly theme: MimoTheme
  /** Accent as a fill, `#rrggbb`. The text-safe variant is derived from it. */
  readonly accent: string
  /** Whether the scrolling mark is painted at the top of the page. */
  readonly pattern: boolean
  /** Ink strength of that mark, 0…1. MiMo's own watermark sits at 0.05. */
  readonly patternOpacity: number
  /** What the mark scrolls. */
  readonly patternText: string
  /** Height of the strip the mark scrolls in, in pixels. */
  readonly patternHeight: number
  /** Whether the skin renders at all. */
  readonly enabled: boolean
}

/** Every field optional: omitted values fall back to the module defaults. */
export interface MimoConfig {
  readonly theme?: unknown
  readonly accent?: unknown
  readonly pattern?: unknown
  readonly patternOpacity?: unknown
  readonly patternText?: unknown
  readonly patternHeight?: unknown
  readonly enabled?: unknown
}
