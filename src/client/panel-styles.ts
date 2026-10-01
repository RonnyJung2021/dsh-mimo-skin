/**
 * The card's stylesheet.
 *
 * Separate from `styles.ts`, which is scoped to the skinned page: this sheet is
 * for the plugin's own card in 侧栏「插件」, whose surrounding layout the skin does
 * not own. Tokens only, so it follows whatever theme is live.
 */

/** Stylesheet text for the plugin card. */
export const PANEL_STYLES = `
.dshMimoPanel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #101114);
}

.dshMimoNote {
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
  color: var(--dsw-alias-label-secondary, #4b5058);
  font-size: 12px;
  line-height: 18px;
}

.dshMimoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 14px 20px;
}

.dshMimoField {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 3px 10px;
  align-items: center;
}

.dshMimoFieldLabel {
  font-weight: 500;
}

.dshMimoFieldControl {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dshMimoFieldHint {
  grid-column: 1 / -1;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}

.dshMimoError {
  grid-column: 1 / -1;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-state-error-primary, #d92d20);
}

.dshMimoField select,
.dshMimoField input {
  width: 100%;
  min-width: 128px;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
}

.dshMimoSwatch {
  flex: none;
  width: 20px;
  height: 20px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 4px;
}

.dshMimoSwatchSmall {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 2px;
}

.dshMimoPreview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin: 0;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}

.dshMimoPreviewPair code {
  font-family: var(--ds-font-family-code, monospace);
  color: var(--dsw-alias-label-secondary, #4b5058);
}

.dshMimoToggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dshMimoToggle {
  display: flex;
  gap: 9px;
  align-items: flex-start;
}

.dshMimoToggle > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dshMimoToggle input[type="checkbox"] {
  margin: 2px 0 0;
}

.dshMimoFoot {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dshMimoFoot button {
  padding: 5px 12px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.dshMimoFoot button:disabled {
  opacity: 0.55;
  cursor: default;
}

.dshMimoStatus {
  font-size: 11.5px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}
`

/**
 * Install the card's stylesheet into a document.
 * @param doc - the document to style.
 * @returns a disposer that removes the style element.
 */
export function installPanelStyles(doc: Document): () => void {
  const element = doc.createElement('style')
  element.setAttribute('data-dsh-mimo-panel-styles', '')
  element.textContent = PANEL_STYLES
  doc.head.append(element)
  return () => { element.remove() }
}
