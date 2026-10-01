/**
 * The card's copy, read from the package's own `locale/` dictionaries.
 *
 * The plugin page reads `locale/*.json` for the card's title and description;
 * the card's body — labels, hints, validation messages — comes from the very
 * same files, so the plugin's text lives in one place and neither language is
 * written into the component. English is the fallback a missing key lands on.
 */

import en from '../../locale/en.json'
import zh from '../../locale/zh.json'
import type { PanelCopy } from '../types/panel.ts'

/**
 * The keys this module reads, so a test can prove both dictionaries carry them.
 * @remarks Kept beside {@link panelCopy} rather than derived from it: the point
 *          is to fail when one of the two drifts apart, and a list derived from
 *          the reader would drift with it.
 */
export const COPY_KEYS = [
  'noteReady', 'noteLoading', 'noteUnavailable', 'noteStaleHost',
  'save', 'reset', 'stateSaved', 'stateDirty', 'stateClean', 'stateLocked',
  'fieldTheme', 'fieldThemeHint', 'fieldThemeAuto', 'fieldThemeLight', 'fieldThemeDark',
  'fieldAccent', 'fieldAccentHint', 'fieldAccentLight', 'fieldAccentDark',
  'fieldPattern', 'fieldPatternHint',
  'fieldPatternOpacity', 'fieldPatternOpacityHint',
  'fieldPatternText', 'fieldPatternTextHint',
  'errorTheme', 'errorAccent', 'errorPatternOpacity', 'errorPatternText',
] as const

/** The `panel` section of one dictionary, or an empty object. */
function panelOf(dictionary: unknown): Record<string, unknown> {
  const panel = typeof dictionary === 'object' && dictionary !== null
    ? Reflect.get(dictionary, 'panel')
    : undefined
  return typeof panel === 'object' && panel !== null ? panel as Record<string, unknown> : {}
}

/**
 * Read one string from one dictionary, falling back to the English one.
 * @param panel - the dictionary's `panel` section.
 * @param english - the English `panel` section.
 * @param key - key to read.
 * @returns the string, or the key itself when neither dictionary carries it.
 */
function text(panel: Record<string, unknown>, english: Record<string, unknown>, key: string): string {
  for (const source of [panel, english]) {
    const value = source[key]
    if (typeof value === 'string' && value !== '') return value
  }
  return key
}

/**
 * Pick a dictionary for a page language.
 * @param language - a BCP 47 tag, e.g. `zh-CN`; the page's own by default.
 * @returns the dictionary whose language matches, English otherwise.
 */
function dictionaryFor(language: string): unknown {
  return language.toLowerCase().startsWith('zh') ? zh : en
}

/**
 * Read the card's copy.
 * @param language - a BCP 47 tag; the browser's own language by default.
 * @returns every string the card renders.
 */
export function panelCopy(language?: string): PanelCopy {
  const tag = language ?? (typeof navigator === 'undefined' ? 'en' : navigator.language)
  const english = panelOf(en)
  const panel = panelOf(dictionaryFor(tag))
  const read = (key: string): string => text(panel, english, key)
  return {
    noteReady: read('noteReady'),
    noteLoading: read('noteLoading'),
    noteUnavailable: read('noteUnavailable'),
    noteStaleHost: read('noteStaleHost'),
    save: read('save'),
    reset: read('reset'),
    stateSaved: read('stateSaved'),
    stateDirty: read('stateDirty'),
    stateClean: read('stateClean'),
    stateLocked: read('stateLocked'),
    accentText: { light: read('fieldAccentLight'), dark: read('fieldAccentDark') },
    themeOptions: [
      { value: 'auto', label: read('fieldThemeAuto') },
      { value: 'light', label: read('fieldThemeLight') },
      { value: 'dark', label: read('fieldThemeDark') },
    ],
    // Keyed by the one field list the card edits and the Host publishes: a knob
    // added there is a type error here until it has copy.
    field: {
      theme: { label: read('fieldTheme'), hint: read('fieldThemeHint') },
      accent: { label: read('fieldAccent'), hint: read('fieldAccentHint') },
      pattern: { label: read('fieldPattern'), hint: read('fieldPatternHint') },
      patternOpacity: { label: read('fieldPatternOpacity'), hint: read('fieldPatternOpacityHint') },
      patternText: { label: read('fieldPatternText'), hint: read('fieldPatternTextHint') },
    },
    error: {
      theme: read('errorTheme'),
      accent: read('errorAccent'),
      patternOpacity: read('errorPatternOpacity'),
      patternText: read('errorPatternText'),
    },
  }
}
