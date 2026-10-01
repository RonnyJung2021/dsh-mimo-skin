/**
 * The one place the Loader's two representations of a config field meet.
 *
 * Every page knob is declared `.volatile()`, so the Loader hands `apply` a
 * reference object (`{ get, set }`) rather than a value. Passing that reference on
 * to `resolveSettings` would fail every comparison and silently resolve the
 * compiled default, and serialising it into the page would produce `{}` — a
 * profile patch that pins `theme` or the accent would look like it changed
 * nothing.
 */

/**
 * Read one resolved config field as the plain value the page can use.
 * @param field - a config field; the volatile ones arrive as references.
 * @returns the referenced value, or the field itself when it is already plain.
 */
export function plainValue(field: unknown): unknown {
  const get = typeof field === 'object' && field !== null ? Reflect.get(field, 'get') : undefined
  return typeof get === 'function' ? get.call(field) as unknown : field
}
