/**
 * Identity and compiled defaults of the plugin.
 *
 * One table, read by both halves: the Host half publishes {@link DEFAULT_GLOBAL_NAME}
 * and falls back to these values when a row configures nothing, and the browser
 * half compiles the very same values in — an unedited row therefore paints exactly
 * what the page would paint on its own.
 */

import type { MimoTheme } from '../enums/theme.ts'

/** Stable loader row id; matches the package name the page is served under. */
export const PLUGIN_ID = 'dsh-mimo-skin'

/**
 * Settings namespace owned by this plugin's loader row.
 * @remarks The engine names a row's settings namespace after the row itself, so
 *          this is the package name. Writes through it land in the profile patch,
 *          which is the only durable store this plugin has: page `localStorage` is
 *          keyed by the engine's port, and the port changes on every launch.
 */
export const SETTINGS_NAMESPACE = PLUGIN_ID

/** Global the Host publishes for the browser half. */
export const DEFAULT_GLOBAL_NAME = '__DSH_MIMO_SKIN__'

/** The reference site's own accent, `--accent` on `mimo.xiaomi.com`. */
export const DEFAULT_ACCENT = '#ff6700'

/** The scrolling mark's text; the site uses its own wordmark in the same slot. */
export const DEFAULT_PATTERN_TEXT = 'DEEPSEEK HARNESS'

/** Ink strength of that mark, 0…1. MiMo's own watermark sits at 0.05. */
export const DEFAULT_PATTERN_OPACITY = 0.05

/**
 * Height of the strip the mark scrolls in, in pixels.
 *
 * Half of the 52 the skin first shipped: the strip is a hairline-ruled header,
 * not a banner. The mark's face is derived from this value, so the two cannot
 * drift apart, and the card can move it anywhere inside
 * {@link PATTERN_HEIGHT_MIN}…{@link PATTERN_HEIGHT_MAX}.
 */
export const DEFAULT_PATTERN_HEIGHT = 26

/** Shell painted when the row configures none. */
export const DEFAULT_THEME: MimoTheme = 'auto'

/**
 * Whether the mark is painted when the row configures nothing.
 * @remarks Only an explicit `false` turns it off: any other value is not the
 *          documented opt-out.
 */
export const DEFAULT_PATTERN = true

/** Whether the skin publishes at all when the row configures nothing. */
export const DEFAULT_ENABLED = true
