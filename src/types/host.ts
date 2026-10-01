/**
 * The engine surfaces the Host half touches.
 *
 * Narrowed to the two calls it makes, for the same reason the browser half
 * narrows `configForms`: a wider service is not this row's business.
 */

/** One index-injection row, narrowed to the kind this plugin pushes. */
export interface SettingsInjection {
  kind: 'global'
  name: string
  value: unknown
}

/** The settings service surface this half uses. */
export interface SettingsFormsLike {
  /** Keep this plugin instance off any generated settings page. */
  configure(presentation: { auto?: boolean }, owner?: unknown): () => void
}
