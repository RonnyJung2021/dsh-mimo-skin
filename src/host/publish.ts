/**
 * Turning the row's resolved config into what the page receives.
 *
 * Two steps, kept apart because they answer different questions: {@link plainConfig}
 * unwraps the Loader's volatile references, and {@link publishedSettings} decides
 * which fields travel. Both are pure, so the apply path is only wiring.
 */

import { SECTION_FIELDS } from '../constants/config.ts'
import type { MimoConfig, MimoSettings } from '../types/config.ts'
import { plainValue } from '../utils/volatile.ts'
import type { Config } from './schema.ts'

/**
 * Unwrap the row's volatile fields into the plain config both halves agree on.
 * @param config - the row's validated config.
 * @returns the config with every page knob as a plain value.
 */
export function plainConfig(config: Config): MimoConfig {
  return {
    theme: plainValue(config.theme),
    accent: plainValue(config.accent),
    pattern: plainValue(config.pattern),
    patternOpacity: plainValue(config.patternOpacity),
    patternText: plainValue(config.patternText),
    patternHeight: plainValue(config.patternHeight),
    enabled: plainValue(config.enabled),
  }
}

/**
 * The settings row this half publishes into every rendered index page.
 *
 * The five knobs travel at their resolved value, so the page always receives the
 * effective settings rather than a half-filled object: an unedited row publishes
 * the same values the browser bundle compiles in, and an edited one publishes
 * the edit. `enabled` is not a knob; it is always published as `true`, because a
 * row that is disabled does not publish at all.
 * @param settings - resolved values.
 * @returns the value the browser half reads.
 */
export function publishedSettings(settings: MimoSettings): Record<string, unknown> {
  const published: Record<string, unknown> = {}
  for (const key of SECTION_FIELDS) published[key] = settings[key]
  return published
}
