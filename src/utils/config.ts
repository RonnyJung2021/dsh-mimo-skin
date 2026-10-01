/**
 * Resolving a row's config into the settings both halves use.
 *
 * The Host half owns the values (a cordis.yml row can change every one of them);
 * the browser half only reads the copy the Host publishes into the index page, so
 * this module stays dependency-free and runs in either face.
 *
 * Nothing here throws: a row config is deployment-varying input, and an invalid
 * field falls back to the documented default instead of leaving the GUI unpainted
 * or unreadable.
 */

import { PATTERN_HEIGHT_MAX, PATTERN_HEIGHT_MIN } from '../constants/config.ts'
import {
  DEFAULT_ACCENT,
  DEFAULT_ENABLED,
  DEFAULT_PATTERN,
  DEFAULT_PATTERN_HEIGHT,
  DEFAULT_PATTERN_OPACITY,
  DEFAULT_PATTERN_TEXT,
  DEFAULT_THEME,
} from '../constants/plugin.ts'
import { isTheme } from '../enums/theme.ts'
import type { MimoConfig, MimoSettings } from '../types/config.ts'
import { isColor } from './color.ts'
import { nonBlankText, numberOr } from './value.ts'

/**
 * Resolve a partial cordis.yml row config into the settings both halves use.
 * @param config - raw row config, possibly undefined.
 * @returns the resolved settings; invalid fields fall back instead of throwing,
 * because a bad skin must never keep the GUI from booting.
 */
export function resolveSettings(config: MimoConfig | undefined): MimoSettings {
  const raw = config ?? {}
  return {
    theme: isTheme(raw.theme) ? raw.theme : DEFAULT_THEME,
    accent: isColor(raw.accent) ? (raw.accent as string).trim().toLowerCase() : DEFAULT_ACCENT,
    pattern: raw.pattern === undefined ? DEFAULT_PATTERN : raw.pattern !== false,
    patternOpacity: numberOr(raw.patternOpacity, DEFAULT_PATTERN_OPACITY, 0, 1),
    patternText: nonBlankText(raw.patternText, DEFAULT_PATTERN_TEXT),
    patternHeight: numberOr(raw.patternHeight, DEFAULT_PATTERN_HEIGHT, PATTERN_HEIGHT_MIN, PATTERN_HEIGHT_MAX),
    enabled: raw.enabled === undefined ? DEFAULT_ENABLED : raw.enabled !== false,
  }
}
