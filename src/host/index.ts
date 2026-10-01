/**
 * Host half of the MiMo skin.
 *
 * Two jobs:
 *
 * 1. **Publish.** A loader row's `config` never reaches the page (the boot graph
 *    carries only id/inject/external), so the resolved values ride the index
 *    injection table instead, ahead of the boot scripts.
 * 2. **Serve the form.** `Config` declares the page's knobs `.volatile()`, which
 *    makes this row a Settings namespace: the page's own card writes them
 *    through it, and the engine lands each write in the profile patch. That is
 *    the only durable store this plugin has — page `localStorage` is keyed by
 *    the engine's port, which changes on every launch.
 *
 * The skin carries no packaged assets — every colour, rule and mark is CSS
 * written in the browser half — so this half registers no route and needs no
 * web server. An absent or unreadable injection table therefore costs the page
 * nothing: the browser half falls back to its own compiled defaults.
 */

import type { Context } from '@deepseek-ai/cordis'
import { DEFAULT_GLOBAL_NAME, PLUGIN_ID } from '../constants/plugin.ts'
import type { SettingsFormsLike, SettingsInjection } from '../types/host.ts'
import { resolveSettings } from '../utils/config.ts'
import { plainConfig, publishedSettings } from './publish.ts'
import type { Config } from './schema.ts'

export { Config } from './schema.ts'
export type { MimoConfig, MimoSettings } from '../types/config.ts'

/** Stable loader row id; matches the package name the page is served under. */
export const name = PLUGIN_ID

/**
 * Publish the settings into every rendered index page.
 *
 * The event is also the moment a page learns the skin exists at all, so the row
 * is pushed even when it configured nothing: the knobs then travel at their
 * resolved defaults, and the global still says the Host half is present.
 * @param ctx - this plugin's host context.
 * @param config - the loader row's resolved config, if any.
 */
export function apply(ctx: Context, config?: Config): void {
  const settings = resolveSettings(config === undefined || config === null ? undefined : plainConfig(config))
  if (!settings.enabled) {
    ctx.logger.debug('dsh-mimo-skin: disabled by config')
    return
  }
  const configured = config?.globalName
  const globalName = typeof configured === 'string' && configured !== ''
    ? configured
    : DEFAULT_GLOBAL_NAME
  const published = publishedSettings(settings)
  ctx.on('webserver/index-inject' as never, ((table: SettingsInjection[]) => {
    table.push({ kind: 'global', name: globalName, value: { ...published, enabled: true } })
  }) as never)
  ctx.logger.debug(`dsh-mimo-skin: published ${Object.keys(published).length} settings`)

  // The knobs have a page of their own (侧栏「插件」→ dsh-mimo-skin), so this row
  // must never also be projected onto a generated Settings page.
  ctx.inject(['settings'], (child) => {
    child.effect(() => {
      const settings = child.get('settings') as SettingsFormsLike | undefined
      if (settings === undefined) return
      return settings.configure({ auto: false }, ctx.fiber)
    }, 'dsh-mimo-skin: keep the knobs on the plugin card only')
  })
}
