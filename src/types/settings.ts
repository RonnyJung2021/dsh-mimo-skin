/**
 * The settings-card contract, narrowed to the calls this plugin makes.
 *
 * The engine's own services are wider than a skin needs; these interfaces are the
 * slice the card and the apply path actually touch, so a service change shows up
 * as one type to fix rather than as an untyped call site.
 */

import type { FormStatus, PathOp } from '../enums/settings.ts'
import type { MimoTheme } from '../enums/theme.ts'

/** The volatile section of this row's config — exactly what the card edits. */
export interface MimoSection {
  /** Which shell to paint; `auto` follows the document's own dark attribute. */
  theme: MimoTheme
  /** Accent as a fill, `#rrggbb`. */
  accent: string
  /** Whether the scrolling mark is painted. */
  pattern: boolean
  /** Ink strength of that mark, 0…1. */
  patternOpacity: number
  /** What the mark scrolls. */
  patternText: string
  /** Height of the strip the mark scrolls in, in pixels. */
  patternHeight: number
}

/** The current form state for one namespace, as the client half reads it. */
export interface ConfigFormView<T> {
  /** `loading` until the first accepted section, `unavailable` without a transport. */
  status: FormStatus
  /** Last accepted section, undefined before the first acceptance. */
  value: T | undefined
  /** Whether the host document accepts writes. */
  writable: boolean
}

/** One path-addressed edit, as the Settings service takes it. */
export interface SettingsPathOp {
  /** `set` writes the value; `unset` restores the composition layer. */
  op: PathOp
  /** Field path inside the row's config section. */
  path: readonly string[]
  /** Value for `set`. */
  value?: unknown
}

/** The Settings-form surface this plugin uses, narrowed to what it calls. */
export interface ConfigFormLike<T> {
  /** @returns the current form state. */
  getSnapshot(): ConfigFormView<T>
  /** Observe state changes. */
  subscribe(listener: () => void): () => void
  /** Queue edits, all fenced by one revision. */
  mutate(ops: readonly SettingsPathOp[]): Promise<boolean>
}

/** The `configForms` service, narrowed to the one method this plugin calls. */
export interface ConfigFormsLike {
  /** @returns the form for one settings namespace. */
  get<T>(namespace: string): ConfigFormLike<T>
}

/** The slots registry, narrowed to the calls this plugin makes. */
export interface SlotRegistryLike {
  /** Wait for a slot declaration, then contribute. */
  inject(name: string, contribute: () => void): void
  /** Contribute one entry to a declared slot. */
  register(options: Record<string, unknown>, component: unknown): unknown
}
