/**
 * Browser half of the MiMo skin.
 *
 * There is no timeline and no session state to follow: this skin paints the
 * document once and leaves it. What it needs from the engine is only the
 * resolved settings, which the Host half publishes into the page — a loader
 * row's `config` never arrives in the browser, because the boot graph carries
 * only id/inject/external.
 *
 * The three pieces are the stylesheet (the token remap), the scrolling band
 * above the shell, and the palette on the document body. The shell is chosen
 * from the product's own light/dark state, so the skin follows a theme toggle
 * instead of imposing one.
 *
 * The half also owns the row's configuration card in 侧栏「插件」. The Host
 * publishes at activation only, so a saved section is applied here as well: the
 * subscription below re-applies to the page, and the profile patch stays the
 * single durable copy of every choice.
 */

import type { Context } from '@deepseek-ai/cordis'
import { PLUGIN_ID, SETTINGS_NAMESPACE } from '../constants/plugin.ts'
import type { ConfigFormLike, ConfigFormsLike, MimoSection, SlotRegistryLike } from '../types/settings.ts'
import { sectionOf } from '../utils/section.ts'
import { MimoSkinPanel } from './components/Panel.tsx'
import { createMarquee, type Marquee } from './marquee.ts'
import { hostPublished, readSettings } from './published.ts'
import { createSkin } from './skin.ts'
import { installPageStyles } from './styles/page.ts'
import { installPanelStyles } from './styles/panel.ts'

export { readSettings } from './published.ts'

/** Stable entry name; matches the package name the Host serves this bundle under. */
export const name = PLUGIN_ID

/** This half reads no engine services; the settings arrive through the page. */
export const inject: string[] = []

/**
 * Mount the MiMo skin for this page.
 * @param ctx - this plugin's client context.
 * @param doc - document to skin; the page by default.
 * @remarks One `input` object lives for the plugin's lifetime and is read on
 *          every paint, so a saved section re-applies without remounting the
 *          skin or its observer: `applySection` writes the new values into it and
 *          asks the skin for one more paint.
 */
export function apply(ctx: Context, doc: Document = document): void {
  const settings = readSettings()
  if (!settings.enabled) return

  installPageStyles(doc)
  const input = {
    theme: settings.theme,
    accent: settings.accent,
    pattern: settings.pattern,
    patternOpacity: settings.patternOpacity,
  }
  const skin = createSkin(input, doc)
  let marquee: Marquee | undefined = settings.pattern
    ? createMarquee(doc, settings.patternText)
    : undefined

  /**
   * Apply one narrowed settings section to the live page.
   * @param section - fields the card saved; missing ones keep their value.
   */
  const applySection = (section: Partial<MimoSection>): void => {
    Object.assign(input, section)
    skin.apply()
    if (typeof section.patternText === 'string') marquee?.setText(section.patternText)
    if (input.pattern && marquee === undefined) marquee = createMarquee(doc, settings.patternText)
    else if (!input.pattern && marquee !== undefined) {
      marquee.destroy()
      marquee = undefined
    }
  }

  ctx.effect(() => () => {
    marquee?.destroy()
    skin.destroy()
  }, 'dsh-mimo-skin: document skin')

  // Read once, like the settings: whether the engine's host half is the current
  // one is a fact about this page load, and the card's explanation depends on it.
  const knobsPublished = hostPublished()
  ctx.effect(() => installPanelStyles(doc), 'dsh-mimo-skin: the card stylesheet')

  // The row's knobs have a card of their own in 侧栏「插件」, and the Settings
  // form behind it is the only store: one write path, the profile patch, so a
  // choice survives the engine's next port.
  ctx.inject(['configForms', 'slots'], (child) => {
    const forms = child.get('configForms') as ConfigFormsLike | undefined
    if (forms === undefined) return
    const form = forms.get<MimoSection>(SETTINGS_NAMESPACE)
    child.effect(() => {
      const sync = (): void => { applySection(sectionOf(form.getSnapshot().value)) }
      const unsubscribe = form.subscribe(sync)
      sync()
      return unsubscribe
    }, 'dsh-mimo-skin: apply the saved card settings')

    const slots = child.get('slots') as SlotRegistryLike | undefined
    if (slots === undefined) return
    child.effect(() => {
      slots.inject('plugins.bundle.config', () => {
        slots.register(
          {
            name: 'plugins.bundle.config',
            // Keyed by the bundle's package name, which is also the namespace.
            key: SETTINGS_NAMESPACE,
            inject: () => ({ form: form as ConfigFormLike<MimoSection>, hostPublished: knobsPublished }),
          },
          MimoSkinPanel,
        )
      })
    }, 'dsh-mimo-skin: the knobs on the plugin card')
  })
}
