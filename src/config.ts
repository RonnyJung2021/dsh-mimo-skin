/**
 * Deployment-varying facts of the MiMo skin, shared by both halves.
 *
 * The Host half owns the values (a cordis.yml row can change every one of
 * them); the browser half only reads the copy the Host publishes into the
 * index page, so this module stays dependency-free and runs in either face.
 *
 * The Host publishes **only the fields a row actually configured**; everything
 * else falls back to the defaults compiled into the browser bundle, so a
 * visual default can change with a client rebuild the page hot-reloads.
 *
 * The three faces — prose, chrome, code — are **not** here. They are fixed
 * stacks the browser half compiles in, because the skin ships no font files and
 * a hand-typed stack would only re-point at families the machine may not have.
 */

import { isColor } from './color.ts'

/** Global the Host publishes for the browser half. */
export const DEFAULT_GLOBAL_NAME = '__DSH_MIMO_SKIN__'

/** Which MiMo shell the skin paints: the warm page, or its warm-dark counterpart. */
export type MimoTheme = 'light' | 'dark' | 'auto'

/** The reference site's own accent, `--accent` on `mimo.xiaomi.com`. */
export const DEFAULT_ACCENT = '#ff6700'

/** The scrolling mark's text; the site uses its own wordmark in the same slot. */
export const DEFAULT_PATTERN_TEXT = 'DEEPSEEK HARNESS'

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
  readonly enabled?: unknown
}

/**
 * Coerce one config field to a finite number inside a range.
 * @param value - raw config value.
 * @param fallback - value used when it is not a usable number.
 * @param min - inclusive lower bound.
 * @param max - inclusive upper bound.
 * @returns the accepted number.
 */
function numberIn(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

/**
 * Accept one config string only when it is non-blank.
 * @param value - raw config value.
 * @param fallback - value used when the field is blank or not a string.
 * @returns the trimmed string.
 */
function text(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed === '' ? fallback : trimmed
}

/**
 * Resolve a partial cordis.yml row config into the settings both halves use.
 * @param config - raw row config, possibly undefined.
 * @returns the resolved settings; invalid fields fall back instead of throwing,
 * because a bad skin must never keep the GUI from booting.
 */
export function resolveSettings(config: MimoConfig | undefined): MimoSettings {
  const raw = config ?? {}
  const theme = raw.theme === 'light' || raw.theme === 'dark' || raw.theme === 'auto'
    ? raw.theme
    : 'auto'
  return {
    theme,
    accent: isColor(raw.accent) ? (raw.accent as string).trim().toLowerCase() : DEFAULT_ACCENT,
    pattern: raw.pattern === undefined ? true : raw.pattern !== false,
    patternOpacity: numberIn(raw.patternOpacity, 0.05, 0, 1),
    patternText: text(raw.patternText, DEFAULT_PATTERN_TEXT),
    enabled: raw.enabled === undefined ? true : raw.enabled !== false,
  }
}
