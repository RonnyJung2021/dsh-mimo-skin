/**
 * The skin's state on the document body.
 *
 * Two things live there: the custom properties the palette resolves to, and the
 * attribute every override in the stylesheet hangs off.
 *
 * The shell is a function of the product's own light/dark state, not a setting
 * this plugin imposes. In `auto` the skin therefore watches the theme
 * attribute the product toggles and re-paints the palette when it flips — the
 * user keeps control of light and dark, and MiMo has a shell for each.
 */

import { DARK_ATTRIBUTE, SKIN_ATTRIBUTE, THEME_DARK_ATTRIBUTE } from './contract.ts'
import { PALETTE_VARIABLES, shellFor, skinVariables, type MimoSkinInput } from './palette.ts'

/** The document-level half of the skin. */
export interface SkinApplier {
  /** Paint the document with one palette and enable the skin. */
  apply(): void
  /** Release the observer and return the document to the application's theme. */
  destroy(): void
}

/**
 * Create the document-level skin state.
 * @param input - the resolved shell, accent and mark settings.
 * @param doc - document whose body carries the skin.
 * @returns the applier owned by the caller's plugin fiber.
 */
export function createSkin(input: MimoSkinInput, doc: Document = document): SkinApplier {
  let observer: MutationObserver | undefined

  /** Whether the product currently asks for its dark palette. */
  function documentIsDark(): boolean {
    return doc.body?.hasAttribute(THEME_DARK_ATTRIBUTE) === true
  }

  /**
   * Write one attribute only when it is not already in the state asked for.
   *
   * This is not a micro-optimization. A `MutationObserver` records a write of
   * the value an attribute already holds, so an unconditional re-assert inside
   * the observer's own callback would re-arm the observer on every pass and
   * starve the page's event loop — the document stops responding entirely.
   * @param body - the document body.
   * @param name - attribute to set.
   * @param wanted - whether the attribute should be present.
   */
  function setFlag(body: HTMLElement, name: string, wanted: boolean): void {
    if (body.hasAttribute(name) === wanted) return
    if (wanted) body.setAttribute(name, '')
    else body.removeAttribute(name)
  }

  /** Write the palette for the document's current theme state. */
  function paint(): void {
    const body = doc.body
    if (body === null) return
    const shell = shellFor(input.theme, documentIsDark())
    const variables = skinVariables(input, shell)
    for (const [name, value] of Object.entries(variables)) body.style.setProperty(name, value)
    setFlag(body, SKIN_ATTRIBUTE, true)
    setFlag(body, DARK_ATTRIBUTE, shell.id === 'dark')
  }

  paint()
  observer = new MutationObserver(() => { paint() })
  // Only the product's own theme attribute is watched. The skin's own two
  // attributes are written by the callback above, so observing them would make
  // the observer re-arm itself; the theme attribute is the one fact that can
  // change without this module asking.
  if (doc.body !== null) {
    observer.observe(doc.body, { attributes: true, attributeFilter: [THEME_DARK_ATTRIBUTE] })
  }

  return {
    apply: paint,
    destroy(): void {
      observer?.disconnect()
      observer = undefined
      const body = doc.body
      if (body === null) return
      body.removeAttribute(SKIN_ATTRIBUTE)
      body.removeAttribute(DARK_ATTRIBUTE)
      for (const name of PALETTE_VARIABLES) body.style.removeProperty(name)
    },
  }
}
