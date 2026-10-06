/**
 * The card's own configuration panel.
 *
 * This is the only React in the plugin: the plugin page hands a slot entry a
 * component, so the panel is one small component — plus the leaf controls it
 * renders — and nothing else.
 *
 * There is no Save button: a draft lives here and writes itself. Every edit
 * restarts one timer, so a burst of adjustments lands as a single write once the
 * user has been still — after {@link SAVE_DEBOUNCE_PICK} for a picker or a
 * switch, which is one decision, and after {@link SAVE_DEBOUNCE_ADJUST} for a
 * knob that is typed or stepped, so that a write never lands in the middle of an
 * adjustment and fights the hand making it. A draft holding a field the settings
 * service could not accept — a colour literal that does not parse, an ink
 * strength outside 0…1, a blank mark — is never written, and the message under
 * that field is the reason it is still sitting here. That is also why the text
 * inputs are controlled: with a local draft there is no round trip to lose the
 * caret to, so the value-keying the write-through version needed is gone.
 *
 * The committed values still arrive from the Settings form, which is the only
 * durable store: a choice survives a reload, a new engine port, and a different
 * window.
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CONTINUOUS_FIELDS,
  PATTERN_HEIGHT_MAX,
  PATTERN_HEIGHT_MIN,
  SAVE_DEBOUNCE_ADJUST,
  SAVE_DEBOUNCE_PICK,
  type ErrorField,
} from '../../constants/config.ts'
import type { MimoPanelProps, PanelCopy } from '../../types/panel.ts'
import type { ConfigFormLike, ConfigFormView, MimoSection } from '../../types/settings.ts'
import { invalidFields, sectionOps, SECTION_DEFAULTS } from '../../utils/section.ts'
import { accentPreview } from '../accent-preview.ts'
import { panelCopy } from '../copy.ts'
import { AccentTextPair, Field, Toggle } from './controls.tsx'

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

  // A knob the user is still moving waits longer than one they have finished
  // picking, and the pending draft is classified as a whole: a mark typed a
  // moment ago is still settling even when the pick after it was a single click.
  const stillAdjusting = CONTINUOUS_FIELDS.some(field => draft[field] !== committed[field])
  const delay = stillAdjusting ? SAVE_DEBOUNCE_ADJUST : SAVE_DEBOUNCE_PICK

  /**
   * Write one field of the draft.
   * @param field - field name inside the row's config section.
   * @param next - value to place in the draft.
   */
  const edit = <K extends keyof MimoSection>(field: K, next: MimoSection[K]): void => {
    setDraft(current => ({ ...current, [field]: next }))
  }

  // The draft writes itself: every edit restarts this timer, and the values are
  // applied and stored once the user has been still for `delay`. A draft the
  // settings service would refuse is left unwritten on purpose.
  useEffect(() => {
    if (!writable || !dirty || invalid.length > 0) return
    const timer = setTimeout(() => { void form.mutate(sectionOps(draft)) }, delay)
    return () => { clearTimeout(timer) }
  }, [draft, dirty, delay, writable, invalid.length, form])

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

        <Field label={copy.field.patternHeight.label} hint={copy.field.patternHeight.hint} error={errorOf('patternHeight')}>
          <input
            type="number"
            min={PATTERN_HEIGHT_MIN}
            max={PATTERN_HEIGHT_MAX}
            step={1}
            value={draft.patternHeight}
            disabled={!writable}
            onChange={event => { edit('patternHeight', Number(event.target.value)) }}
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
          disabled={!writable || committedKey === JSON.stringify(SECTION_DEFAULTS)}
          onClick={() => { setDraft(SECTION_DEFAULTS) }}
        >
          {copy.reset}
        </button>
        <span className="dshMimoStatus">{status}</span>
      </div>
    </div>
  )
}
