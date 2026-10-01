/**
 * The enumerations the settings-card bridge speaks.
 *
 * They are the values the Settings service and the slot registry exchange with
 * this plugin, so they are named once here rather than written out at each use.
 */

/** Where one namespace's form is in its lifecycle. */
export const FORM_STATUSES = ['loading', 'ready', 'unavailable'] as const

/** `loading` until the first accepted section, `unavailable` without a transport. */
export type FormStatus = typeof FORM_STATUSES[number]

/** What one path-addressed edit does. */
export const PATH_OPS = ['set', 'unset'] as const

/** `set` writes the value; `unset` restores the composition layer. */
export type PathOp = typeof PATH_OPS[number]

/** Which view the page is drawing. */
export const PANEL_VIEWS = ['page', 'summary'] as const

/** The bundle card always asks for `page`. */
export type PanelView = typeof PANEL_VIEWS[number]
