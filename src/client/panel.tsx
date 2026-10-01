/**
 * The card's own configuration panel.
 *
 * This is the only React in the plugin: the plugin page hands a slot entry a
 * component, so the panel is one small component and nothing else.
 *
 * Unlike the first cut of this card, edits do **not** write through on every
 * keystroke. A draft lives here, Save is what commits it, and Save is refused
 * while the draft holds a field the settings service could not accept — a colour
 * literal that does not parse, an ink strength outside 0…1, a blank mark. That
 * is also why the text inputs are controlled: with a local draft there is no
 * round trip to lose the caret to, so the value-keying the write-through version
 * needed is gone.
 *
 * The committed values still arrive from the Settings form, which is the only
 * durable store: a choice survives a reload, a new engine port, and a different
 * window.
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { contrast, parseColor, readableOn, type Rgb } from '../color.ts'
import { panelCopy, type ErrorField, type PanelCopy } from './copy.ts'
import { DARK_SHELL, LIGHT_SHELL } from './palette.ts'
import {
  invalidFields,
  sectionOps,
  SECTION_DEFAULTS,
  type ConfigFormLike,
  type ConfigFormView,
  type MimoSection,
} from './settings.ts'

/** Props the plugin page and the inject face put on the panel. */
export interface MimoPanelProps {
  /** Which view the page is drawing; the bundle card always asks for `page`. */
  readonly view?: 'page' | 'summary'
  /** The row's settings form. */
  readonly form: ConfigFormLike<MimoSection>
  /** Whether the boot global carried the knobs, i.e. the host half is current. */
  readonly hostPublished: boolean
}

/** One derived accent-text value and the contrast it reaches. */
interface AccentText {
  /** The literal the accent becomes where it is rendered as text. */
  readonly value: string
  /** Its contrast ratio against that shell's page. */
  readonly ratio: string
}

/** Both shells' derived accent-text values. */
interface AccentPreview {
  readonly light: AccentText
  readonly dark: AccentText
}

/**
 * Subscribe a component to one form.
 * @param form - the settings form.
 * @returns the latest state.
 */
function useFormView(form: ConfigFormLike<MimoSection>): ConfigFormView<MimoSection> {
  const [state, setState] = useState(() => form.getSnapshot())
  useEffect(() => form.subscribe(() => { setState(form.getSnapshot()) }), [form])
  return state
}

/**
 * Derive what one accent becomes where it is rendered as text.
 * @param accent - the draft's accent literal.
 * @returns one value per shell, or undefined when the literal does not parse.
 */
function accentPreview(accent: string): AccentPreview | undefined {
  const fill = parseColor(accent)
  if (fill === undefined) return undefined
  const lightPage = parseColor(LIGHT_SHELL.page)
  const darkPage = parseColor(DARK_SHELL.page)
  if (lightPage === undefined || darkPage === undefined) return undefined
  const derive = (page: Rgb, direction: 'darken' | 'lighten'): AccentText => {
    const value = readableOn(fill, page, direction)
    const ratio = contrast(parseColor(value) ?? fill, page)
    return { value, ratio: `${ratio.toFixed(1)}:1` }
  }
  return { light: derive(lightPage, 'darken'), dark: derive(darkPage, 'lighten') }
}

/** One labelled control row. */
function Field(props: { label: string; hint: string; error?: string; children: ReactNode }): ReactNode {
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
function Toggle(props: { label: string; hint: string; checked: boolean; disabled: boolean; onChange: (next: boolean) => void }): ReactNode {
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
function AccentTextPair(props: { label: string; entry: AccentText }): ReactNode {
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

/**
 * The MiMo skin card: every knob this row has, saved to the profile patch.
 * @param props - the page's view and this row's settings form.
 * @returns the panel.
 */
export function MimoSkinPanel(props: MimoPanelProps): ReactNode {
  const copy: PanelCopy = panelCopy()
  const { form, hostPublished } = props
  const state = useFormView(form)
  const committed: MimoSection = { ...SECTION_DEFAULTS, ...(state.value ?? {}) }
  const committedKey = JSON.stringify(committed)
  const [draft, setDraft] = useState<MimoSection>(committed)
  // One dependency, and it is the committed values as a value: the section is a
  // fresh object on every render, so depending on the object would reset the
  // draft continuously and no edit would ever survive a keystroke.
  useEffect(() => { setDraft(committed) }, [committedKey])

  const writable = state.status === 'ready' && state.writable
  const invalid = invalidFields(draft)
  const dirty = JSON.stringify(draft) !== committedKey

  /**
   * Write one field of the draft.
   * @param field - field name inside the row's config section.
   * @param next - value to place in the draft.
   */
  const edit = <K extends keyof MimoSection>(field: K, next: MimoSection[K]): void => {
    setDraft(current => ({ ...current, [field]: next }))
  }

  /**
   * Commit one whole section.
   * @param next - the values to write.
   */
  const save = (next: MimoSection): void => {
    void form.mutate(sectionOps(next))
  }

  const note = state.status === 'unavailable'
    ? hostPublished ? copy.noteUnavailable : copy.noteStaleHost
    : state.status === 'loading' ? copy.noteLoading : copy.noteReady

  const status = !writable
    ? copy.stateLocked
    : invalid.length > 0
      ? copy.error[invalid[0] as ErrorField]
      : dirty ? copy.stateDirty : copy.stateClean

  const errorOf = (field: ErrorField): string | undefined =>
    invalid.includes(field) ? copy.error[field] : undefined

  const preview = accentPreview(draft.accent)

  return (
    <div className="dshMimoPanel" data-plugin-config="dsh-mimo-skin">
      <p className="dshMimoNote">{note}</p>

      <div className="dshMimoGrid">
        <Field label={copy.field.theme.label} hint={copy.field.theme.hint} error={errorOf('theme')}>
          <select
            value={draft.theme}
            disabled={!writable}
            onChange={event => { edit('theme', event.target.value as MimoSection['theme']) }}
          >
            {copy.themeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>

        <Field label={copy.field.accent.label} hint={copy.field.accent.hint} error={errorOf('accent')}>
          <span className="dshMimoSwatch" style={{ background: draft.accent }} />
          <input
            type="text"
            spellCheck={false}
            value={draft.accent}
            disabled={!writable}
            onChange={event => { edit('accent', event.target.value) }}
          />
        </Field>

        <Field label={copy.field.patternText.label} hint={copy.field.patternText.hint} error={errorOf('patternText')}>
          <input
            type="text"
            spellCheck={false}
            value={draft.patternText}
            disabled={!writable}
            onChange={event => { edit('patternText', event.target.value) }}
          />
        </Field>

        <Field label={copy.field.patternOpacity.label} hint={copy.field.patternOpacity.hint} error={errorOf('patternOpacity')}>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={draft.patternOpacity}
            disabled={!writable}
            onChange={event => { edit('patternOpacity', Number(event.target.value)) }}
          />
        </Field>
      </div>

      {preview === undefined ? null : (
        <p className="dshMimoPreview">
          <AccentTextPair label={copy.accentText.light} entry={preview.light} />
          <AccentTextPair label={copy.accentText.dark} entry={preview.dark} />
        </p>
      )}

      <div className="dshMimoToggles">
        <Toggle
          label={copy.field.pattern.label}
          hint={copy.field.pattern.hint}
          checked={draft.pattern}
          disabled={!writable}
          onChange={next => { edit('pattern', next) }}
        />
      </div>

      <div className="dshMimoFoot">
        <button
          type="button"
          disabled={!writable || invalid.length > 0 || !dirty}
          onClick={() => { save(draft) }}
        >
          {copy.save}
        </button>
        <button
          type="button"
          disabled={!writable || committedKey === JSON.stringify(SECTION_DEFAULTS)}
          onClick={() => {
            setDraft(SECTION_DEFAULTS)
            save(SECTION_DEFAULTS)
          }}
        >
          {copy.reset}
        </button>
        <span className="dshMimoStatus">{status}</span>
      </div>
    </div>
  )
}
