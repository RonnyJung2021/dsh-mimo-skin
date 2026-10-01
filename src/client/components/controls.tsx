/**
 * The card's presentational pieces.
 *
 * They hold no state: the panel owns the draft and hands each control its value
 * and its change handler, so this file stays a set of leaves and the panel stays
 * the one component with behaviour.
 */

import type { ReactNode } from 'react'
import type { AccentText } from '../../types/panel.ts'

/** One labelled control row. */
export function Field(props: { label: string; hint: string; error?: string; children: ReactNode }): ReactNode {
  return (
    <label className="dshMimoField">
      <span className="dshMimoFieldLabel">{props.label}</span>
      <span className="dshMimoFieldControl">{props.children}</span>
      <span className={props.error === undefined ? 'dshMimoFieldHint' : 'dshMimoError'}>
        {props.error ?? props.hint}
      </span>
    </label>
  )
}

/** One boolean switch row. */
export function Toggle(props: { label: string; hint: string; checked: boolean; disabled: boolean; onChange: (next: boolean) => void }): ReactNode {
  return (
    <label className="dshMimoToggle">
      <input
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={event => { props.onChange(event.target.checked) }}
      />
      <span>
        <span className="dshMimoFieldLabel">{props.label}</span>
        <span className="dshMimoFieldHint">{props.hint}</span>
      </span>
    </label>
  )
}

/** One derived accent-text value, its swatch and its ratio. */
export function AccentTextPair(props: { label: string; entry: AccentText }): ReactNode {
  return (
    <span className="dshMimoPreviewPair">
      <span className="dshMimoSwatchSmall" style={{ background: props.entry.value }} />
      {props.label}
      {' '}
      <code>{props.entry.value}</code>
      {` (${props.entry.ratio})`}
    </span>
  )
}
