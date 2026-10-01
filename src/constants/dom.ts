/**
 * The names the skin's DOM, stylesheet, and modules agree on.
 *
 * They live in one module because a rename here has to reach a CSS selector, an
 * attribute the applier toggles, and the tests at once.
 */

/** Id of the injected `<style>`; a second install reuses the same element. */
export const STYLE_ID = 'dsh-mimo-styles'

/** Body attribute marking the skin as active; every override hangs off it. */
export const SKIN_ATTRIBUTE = 'data-dsh-mimo'

/** Body attribute marking the dark shell. */
export const DARK_ATTRIBUTE = 'data-dsh-mimo-dark'

/** Body attribute the theme runtime owns to select the product's dark palette. */
export const THEME_DARK_ATTRIBUTE = 'data-ds-dark-theme'

/** Class of the scrolling band pinned across the top of the page. */
export const MARQUEE_CLASS = 'dsh-mimo-marquee'

/** Class of the one line inside that band, the element the animation moves. */
export const MARQUEE_TRACK_CLASS = 'dsh-mimo-marquee-track'

/** Attribute marking the card's own stylesheet, so one install can be disposed. */
export const PANEL_STYLE_ATTRIBUTE = 'data-dsh-mimo-panel-styles'
