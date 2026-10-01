/**
 * The card's own shapes: what the page hands the panel, and what the panel
 * renders from the two locale dictionaries.
 */

import type { PanelView } from '../enums/settings.ts'
import type { MimoTheme } from '../enums/theme.ts'
import type { ErrorField, SectionField } from '../constants/config.ts'
import type { ConfigFormLike, MimoSection } from './settings.ts'

/** Props the plugin page and the inject face put on the panel. */
export interface MimoPanelProps {
  /** Which view the page is drawing; the bundle card always asks for `page`. */
  readonly view?: PanelView
  /** The row's settings form. */
  readonly form: ConfigFormLike<MimoSection>
  /** Whether the boot global carried the knobs, i.e. the host half is current. */
  readonly hostPublished: boolean
}

/** One derived accent-text value and the contrast it reaches. */
export interface AccentText {
  /** The literal the accent becomes where it is rendered as text. */
  readonly value: string
  /** Its contrast ratio against that shell's page. */
  readonly ratio: string
}

/** Both shells' derived accent-text values. */
export interface AccentPreview {
  readonly light: AccentText
  readonly dark: AccentText
}

/** Every string the card renders. */
export interface PanelCopy {
  readonly noteReady: string
  readonly noteLoading: string
  readonly noteUnavailable: string
  readonly noteStaleHost: string
  readonly save: string
  readonly reset: string
  readonly stateSaved: string
  readonly stateDirty: string
  readonly stateClean: string
  readonly stateLocked: string
  /** Labels for the two derived accent-text values. */
  readonly accentText: { readonly light: string, readonly dark: string }
  /** The shell choices, in the order the picker lists them. */
  readonly themeOptions: readonly { readonly value: MimoTheme, readonly label: string }[]
  /** Label and hint per knob. */
  readonly field: Readonly<Record<SectionField, { readonly label: string, readonly hint: string }>>
  /** Message per rejectable knob. */
  readonly error: Readonly<Record<ErrorField, string>>
}
