/**
 * The skin's stylesheet, plus the one-time installer.
 *
 * Three layers, in order:
 *
 * 1. **The token remap.** The `--dsw-*` aliases the interface paints with are
 *    pointed at this palette. This is the whole skin for every surface the
 *    product already draws: DSH already expresses its chrome as
 *    `0.5px solid var(--dsw-alias-border-l3)`, so repainting one border token
 *    repaints the sidebar rule, the header rule and every menu edge at once,
 *    with no selector that could go stale against a renamed class.
 * 2. **The shell blocks.** One set of values per shell, selected by the
 *    attribute the applier writes. Both blocks have the same specificity, so
 *    **the dark block must stay after the light one**; they cannot be merged
 *    into the base block, because a single set of values cannot be both the
 *    black-paper inversion and the warm page.
 * 3. **The band.** A fixed strip across the top of the window holding one
 *    scrolling line, with `body` padded down by the strip's own height so the
 *    mark has a row of its own instead of crossing the application's chrome.
 *
 * Deliberately **not** remapped, because DSH already switches them for us on
 * `body[data-ds-dark-theme]` and pinning them would flatten both shells onto
 * one set of values: the state colours (warn/success/error), the toast and
 * tooltip surfaces, the coloured diff backgrounds, and the bubble highlight.
 * The skin's `!important` aliases would otherwise beat the product's own dark
 * palette and leave an amber "warning" tuned for a white page sitting on black.
 *
 * Nothing here targets a hashed CSS-module class. The only selectors are this
 * plugin's own classes and attributes, the product's documented `data-`
 * attributes, the switch's own `role`/`aria-checked`, `body`/`#root`, and one
 * rule on the composer's documented `data-composer-card` hook.
 *
 * The three non-obvious choices:
 *
 * - **Typography is set through the family tokens, not per element.** DSH
 *   composes every text style as `<weight> <size>/<line-height>
 *   var(--dsw-font-family)`, so pointing that variable at the serif re-faces
 *   the entire reading column — prose, headings, tables and lists — and leaves
 *   the `--ds-font-family-code` stacks that code already uses alone.
 * - **The reading surfaces stay opaque.** DSH's default shell is
 *   white-on-white, so pointing the card tokens at a wash would leave text
 *   floating on the band. The page and the card surface therefore stay solid;
 *   the nested fill is one step off the page, which is the reference site's own
 *   paper/card pair.
 * - **The band keeps the window draggable.** `body > :not(#root)` is subtracted
 *   from the desktop shell's drag region, and the band now owns the top of the
 *   window, so it declares itself draggable again. Without that rule the top
 *   strip of a macOS desktop window would stop moving the window.
 */

import { MARQUEE_CLASS, MARQUEE_TRACK_CLASS, SKIN_ATTRIBUTE, STYLE_ID } from './contract.ts'
import { MARQUEE_HEIGHT, MONO_STACK, SANS_STACK, SERIF_STACK } from './palette.ts'

/** Install the stylesheet once per page. */
export function installStyles(doc: Document = document): void {
  if (doc.getElementById(STYLE_ID) !== null) return
  const style = doc.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  doc.head.appendChild(style)
}

/**
 * The stylesheet. Exported for tests, which assert the contract the source
 * documents: which tokens are remapped, which are deliberately left to the
 * product, and that the layout rules address the product's documented
 * attributes rather than generated class names.
 */
export const CSS = `
/* ---------- the band ---------- */

.${MARQUEE_CLASS} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--dsh-mimo-marquee-height, ${MARQUEE_HEIGHT}px);
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  display: flex;
  align-items: center;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 400ms ease;
}

body[${SKIN_ATTRIBUTE}] .${MARQUEE_CLASS} {
  opacity: var(--dsh-mimo-pattern-opacity, 0);
}

/* The one line the animation moves. Its content is the unit twice over, so
   \`translateX(-50%)\` travels exactly one copy and the loop has no seam. It must
   not be allowed to shrink: a flex item would, and the line would compress to
   the window instead of overrunning it. */
.${MARQUEE_CLASS} > .${MARQUEE_TRACK_CLASS} {
  flex: none;
  font-family: ${SANS_STACK};
  font-size: clamp(20px, 2.2vw, 30px);
  font-weight: 700;
  letter-spacing: 0.3em;
  line-height: 1;
  color: var(--dsh-mimo-ink);
  animation: dsh-mimo-drift 70s linear infinite;
}

@keyframes dsh-mimo-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .${MARQUEE_CLASS} > .${MARQUEE_TRACK_CLASS} { animation: none; }
  .${MARQUEE_CLASS} { transition: none; }
}

/* The band owns a row of its own at the top, so the page moves down by exactly
   its height. \`border-box\` keeps the padding inside the \`height: 100%\` the
   shell's base sheet gives \`body\`, and \`#root\`'s own \`height: 100%\` therefore
   resolves to the space that is left. */
body[${SKIN_ATTRIBUTE}] {
  box-sizing: border-box;
  padding-top: var(--dsh-mimo-marquee-height, 0px);
}

/* The desktop shell subtracts every body child but \`#root\` from the window's
   drag region, and the band is now the element at the top of the window. */
body[${SKIN_ATTRIBUTE}] > .${MARQUEE_CLASS} {
  -webkit-app-region: drag;
}

/* The shell paints its own background, so it has to be lifted over the band. */
body[${SKIN_ATTRIBUTE}] > #root {
  position: relative;
  z-index: 1;
}

/* ---------- shell-independent remap ---------- */

body[${SKIN_ATTRIBUTE}] {
  /* The site's content card is a 3px square with a hairline. DSH owns the
     corner radii as tokens, so the shell reads as MiMo geometry everywhere. */
  --dsw-radius-xs: 2px !important;
  --dsw-radius-sm: 3px !important;
  --dsw-radius-md: 3px !important;
  --dsw-radius-lg: 3px !important;
  --dsw-radius-xl: 3px !important;
  --dsw-radius-panel: 3px !important;

  /* See the module doc: one family variable re-faces every composed text
     style; code keeps its own stack. */
  --dsw-font-family: ${SERIF_STACK} !important;
  --dsw-font-family-brand: ${SANS_STACK} !important;
  --ds-font-family-code: ${MONO_STACK} !important;

  /* Scrollbars track the shell's own resting ink (#999 on the light page). */
  --dsw-alias-scrollbar-bg-l1: var(--dsh-mimo-faint) !important;
  --dsw-alias-scrollbar-bg-l2: var(--dsh-mimo-faint) !important;
  --dsw-alias-scrollbar-hover-l1: var(--dsh-mimo-ink) !important;
  --dsw-alias-scrollbar-hover-l2: var(--dsh-mimo-ink) !important;
}

/* ---------- light shell ---------- */

body[${SKIN_ATTRIBUTE}] {
  /* Surfaces: the reference site's own paper/parchment pair, both opaque so
     the band never softens body text. */
  --dsw-alias-bg-base: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-1: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-2: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-layer-3: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-overlay: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-module-platform: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-multi-select: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-skeleton: var(--dsh-mimo-hover) !important;
  --dsw-alias-bg-document-preview: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-fill: var(--dsh-mimo-page) !important;
  --dsw-specific-input-major: var(--dsh-mimo-page) !important;
  --dsw-specific-bubble: var(--dsh-mimo-raised) !important;
  --dsw-specific-selector: var(--dsh-mimo-raised) !important;
  --dsw-specific-tip: var(--dsh-mimo-page) !important;
  --dsw-specific-login-input: var(--dsh-mimo-page) !important;
  --dsw-menu-surface-fill: var(--dsh-mimo-raised) !important;

  /* Text: MiMo's own three-step ink ramp, nothing invented. */
  --dsw-alias-label-primary: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-primary-dimmed: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-secondary: var(--dsh-mimo-muted) !important;
  --dsw-alias-label-tertiary: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-caption: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-dimmed: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-document-preview: var(--dsh-mimo-muted) !important;
  --dsw-alias-menu-icon: var(--dsh-mimo-muted) !important;

  /* Rules: the reference's section rules are 1px solid #000 and its card rules
     #00000012. DSH draws its own hairlines off these four tokens, so the
     sidebar edge, header edge and menu edges all become MiMo rules. */
  --dsw-alias-border-l1: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2-darkmode-thin: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l3: var(--dsh-mimo-rule) !important;
  --dsw-alias-border-l4: var(--dsh-mimo-rule) !important;
  --dsw-elevation-stroke-color: var(--dsh-mimo-rule-soft) !important;

  /* The accent is the configured fill, used the way the site uses it: links,
     the brand mark, informational fills, business/selected states. Primary
     fills are NOT the accent — the site's own primary button is black on the
     light page and white on the dark one, so the accent stays an accent. */
  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--dsh-mimo-accent) !important;
  --dsw-alias-link: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-brand-text: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-button-info-fill: var(--dsh-mimo-accent) !important;
  --dsw-alias-button-info-hover: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-primary: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-tertiary: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active-accent: var(--dsh-mimo-accent-text) !important;

  /* Interaction: hover is an ink wash, the way a MiMo row answers the pointer. */
  --dsw-alias-interactive-bg-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-interactive-bg-active: var(--dsh-mimo-active) !important;
  --dsw-alias-interactive-bg-hover-solid: var(--dsh-mimo-raised) !important;
  --dsw-alias-interactive-bg-hover-accent: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-nav-item-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-elevated-fill: var(--dsh-mimo-page) !important;
  --dsw-alias-button-floating-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-floating-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-ghost-active-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-ghost-active-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-primary-dimmed: var(--dsh-mimo-hover) !important;

  /* Code sits on the nested fill; inline code on the mono wash. */
  --dsw-alias-markdown-code-block: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-block-banner: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-inline-code: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-citation: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-selected: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-unselected: var(--dsh-mimo-page) !important;
  --dsw-alias-markdown-placeholder: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-tag: var(--dsh-mimo-hover) !important;

  /* Depth: MiMo separates surfaces with a rule and a very light shadow. */
  --dsw-shadow-lv1: 0 2px 4px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv1-blur: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv2: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv3: 0 12px 32px 0 var(--dsh-mimo-shadow) !important;
}

/* ---------- dark shell ----------
   Same declarations, black paper and white ink. MUST stay after the light
   block: both selectors match a body carrying the skin attribute, so source
   order is what makes the dark values win when the applier sets the dark flag. */

body[${SKIN_ATTRIBUTE}][data-dsh-mimo-dark] {
  color-scheme: dark;

  --dsw-alias-bg-base: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-1: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-2: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-layer-3: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-overlay: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-module-platform: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-multi-select: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-skeleton: var(--dsh-mimo-hover) !important;
  --dsw-alias-bg-document-preview: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-fill: var(--dsh-mimo-page) !important;
  --dsw-specific-input-major: var(--dsh-mimo-page) !important;
  --dsw-specific-bubble: var(--dsh-mimo-raised) !important;
  --dsw-specific-selector: var(--dsh-mimo-raised) !important;
  --dsw-specific-tip: var(--dsh-mimo-page) !important;
  --dsw-specific-login-input: var(--dsh-mimo-page) !important;
  --dsw-menu-surface-fill: var(--dsh-mimo-raised) !important;

  --dsw-alias-label-primary: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-primary-dimmed: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-secondary: var(--dsh-mimo-muted) !important;
  --dsw-alias-label-tertiary: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-caption: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-dimmed: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-document-preview: var(--dsh-mimo-muted) !important;
  --dsw-alias-menu-icon: var(--dsh-mimo-muted) !important;

  --dsw-alias-border-l1: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2-darkmode-thin: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l3: var(--dsh-mimo-rule) !important;
  --dsw-alias-border-l4: var(--dsh-mimo-rule) !important;
  --dsw-elevation-stroke-color: var(--dsh-mimo-rule-soft) !important;

  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--dsh-mimo-accent) !important;
  --dsw-alias-link: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-brand-text: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-button-info-fill: var(--dsh-mimo-accent) !important;
  --dsw-alias-button-info-hover: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-primary: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-tertiary: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active-accent: var(--dsh-mimo-accent-text) !important;

  --dsw-alias-interactive-bg-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-interactive-bg-active: var(--dsh-mimo-active) !important;
  --dsw-alias-interactive-bg-hover-solid: var(--dsh-mimo-raised) !important;
  --dsw-alias-interactive-bg-hover-accent: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-nav-item-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-elevated-fill: var(--dsh-mimo-page) !important;
  --dsw-alias-button-floating-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-floating-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-ghost-active-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-ghost-active-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-primary-dimmed: var(--dsh-mimo-hover) !important;

  --dsw-alias-markdown-code-block: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-block-banner: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-inline-code: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-citation: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-selected: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-unselected: var(--dsh-mimo-page) !important;
  --dsw-alias-markdown-placeholder: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-tag: var(--dsh-mimo-hover) !important;

  --dsw-shadow-lv1: 0 2px 4px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv1-blur: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv2: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv3: 0 12px 32px 0 var(--dsh-mimo-shadow) !important;
}

/* Form controls do not inherit a font from the document, so the reading face
   has to be named on them explicitly. */
body[${SKIN_ATTRIBUTE}] input,
body[${SKIN_ATTRIBUTE}] textarea,
body[${SKIN_ATTRIBUTE}] select,
body[${SKIN_ATTRIBUTE}] button {
  font-family: inherit;
}

/* The product's one documented composer hook: an opaque card with a hairline,
   which is the reference site's content card. */
body[${SKIN_ATTRIBUTE}] [data-composer-card] {
  background: var(--dsh-mimo-page) !important;
  border: 1px solid var(--dsh-mimo-rule-soft) !important;
}

/* A switch paints its off track with the same token this skin spends on
   hairlines, so an untouched off track would come out the near-black of the on
   track. The state is repainted from the wash family. The role and aria-checked
   attributes are the control's own contract — the state it already publishes to
   assistive technology — not a generated class name. */
body[${SKIN_ATTRIBUTE}] [role='switch'][aria-checked='false'] {
  background: var(--dsh-mimo-track) !important;
}

/* A menu is the one surface that should read as floating paper. */
body[${SKIN_ATTRIBUTE}] [data-menu-material] {
  border: 1px solid var(--dsh-mimo-rule-soft) !important;
}

body[${SKIN_ATTRIBUTE}] :focus-visible {
  outline: 1px solid var(--dsh-mimo-accent);
  outline-offset: 1px;
}
`
