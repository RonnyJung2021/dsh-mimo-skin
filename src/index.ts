/**
 * The plugin's host entry: the surface the engine's Loader imports.
 *
 * The two halves of the package are what the Loader and the page each load, so
 * their entries stay where the manifest says they are — `src/index.ts` here and
 * `src/client/index.ts` for the browser. This file only picks what a loader row
 * may see; the implementation sits in `host/`, so moving code inside that half
 * never moves the package's entry point.
 */

export { SECTION_FIELDS, type SectionField } from './constants/config.ts'
export { apply, name } from './host/index.ts'
export { Config } from './host/schema.ts'
export type { MimoConfig, MimoSettings } from './types/config.ts'
