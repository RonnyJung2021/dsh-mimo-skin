/**
 * The values the Host half published into this page.
 *
 * A loader row's `config` never reaches the browser (the boot graph carries only
 * id/inject/external), so everything the Host resolved arrives as one global,
 * written into the index page ahead of the boot scripts. Both reads take the
 * scope as an argument, so a caller — or a test — can hand them a page of its own.
 */

import { SECTION_FIELDS } from '../constants/config.ts'
import { DEFAULT_GLOBAL_NAME } from '../constants/plugin.ts'
import type { MimoConfig, MimoSettings } from '../types/config.ts'
import { resolveSettings } from '../utils/config.ts'
import { isRecord } from '../utils/value.ts'

/** A page's globals, as this module reads them. */
type GlobalScope = Record<string, unknown>

/**
 * Read the settings the Host published into this page.
 * @param scope - global scope to read; the page by default.
 * @returns resolved settings; defaults when the Host half is absent.
 */
export function readSettings(scope: GlobalScope = globalThis as unknown as GlobalScope): MimoSettings {
  const raw = scope[DEFAULT_GLOBAL_NAME]
  return resolveSettings(isRecord(raw) ? raw as MimoConfig : undefined)
}

/**
 * Whether the page's boot global came from the current host half.
 *
 * A host half from before the row had a schema publishes only `{ enabled: true }`,
 * which is exactly the difference the card's unavailable note has to report.
 * @param scope - global scope to read; the page by default.
 * @returns true when the global carries at least one of the row's knobs.
 */
export function hostPublished(scope: GlobalScope = globalThis as unknown as GlobalScope): boolean {
  const raw = scope[DEFAULT_GLOBAL_NAME]
  if (!isRecord(raw)) return false
  return SECTION_FIELDS.some(key => key in raw)
}
