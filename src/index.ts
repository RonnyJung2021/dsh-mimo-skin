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

import z from '@deepseek-ai/schemastery'
import type { Context } from '@deepseek-ai/cordis'
import {
  DEFAULT_ACCENT,
  DEFAULT_GLOBAL_NAME,
  DEFAULT_PATTERN_TEXT,
  resolveSettings,
  type MimoConfig,
  type MimoSettings,
  type MimoTheme,
} from './config.ts'

export type { MimoConfig, MimoSettings } from './config.ts'

/** Stable loader row id; matches the package name the page is served under. */
export const name = 'dsh-mimo-skin'

/** One index-injection row, narrowed to the kind this plugin pushes. */
interface SettingsInjection {
  kind: 'global'
  name: string
  value: unknown
}

/** The settings service surface this half uses. */
interface SettingsFormsLike {
  /** Keep this plugin instance off any generated settings page. */
  configure(presentation: { auto?: boolean }, owner?: unknown): () => void
}

/** Row config, as the Loader resolves it before the plugin starts. */
export interface Config extends MimoConfig {
  /** Which shell to paint; `auto` follows the product's own light/dark state. */
  readonly theme: MimoTheme
  /** Accent as a fill, `#rrggbb`. */
  readonly accent: string
  /** Whether the scrolling mark is painted. */
  readonly pattern: boolean
  /** Ink strength of that mark, 0…1. */
  readonly patternOpacity: number
  /** What the mark scrolls. */
  readonly patternText: string
  /** Whether the skin publishes at all. */
  readonly enabled: boolean
  /** Global name the browser half reads; defaults to {@link DEFAULT_GLOBAL_NAME}. */
  readonly globalName?: string
}

/**
 * The appearance half of the classes: every knob the card edits.
 * @remarks One list, because the publisher and the browser half must agree on
 *          exactly which fields travel to the page.
 */
export const PAGE_FIELDS = [
  'theme', 'accent', 'pattern', 'patternOpacity', 'patternText',
] as const

/**
 * The row's schema, as the Loader resolves it before the plugin starts.
 * @remarks Every field carries its default, so the published value is always
 *          complete and the browser half never has to guess. The five page knobs
 *          are volatile — saving them writes the profile patch — while `enabled`
 *          and `globalName` are deployment configuration: both are read once,
 *          when the row activates, and stay out of the card.
 */
export const Config = z.object({
  theme: z.union(['light', 'dark', 'auto']).default('auto')
    .description('整页用哪套 MiMo 外壳：auto 跟随产品自己的明暗设置（默认）。').volatile(),
  accent: z.string().default(DEFAULT_ACCENT)
    .description('强调色，写成 #rrggbb；当文字渲染时会自动加深或提亮到达标对比度。').volatile(),
  pattern: z.boolean().default(true)
    .description('是否在顶部画那条滚动的字标，默认开。').volatile(),
  patternOpacity: z.number().min(0).max(1).default(0.05)
    .description('字标的墨色浓度，0–1，默认 0.05——参照站自己的值。').volatile(),
  patternText: z.string().default(DEFAULT_PATTERN_TEXT)
    .description('字标滚动的文字，默认 DEEPSEEK HARNESS。').volatile(),
  enabled: z.boolean().default(true)
    .description('是否发布这套皮肤配置；关掉等于本行不注入，页面回落到自带默认值。'),
  globalName: z.string().default(DEFAULT_GLOBAL_NAME)
    .description('宿主写进页面的全局名，一般不用改。'),
})

/**
 * Read one resolved config field as the plain value the page can use.
 * @param field - a config field; the volatile ones arrive as references.
 * @returns the referenced value, or the field itself when it is already plain.
 * @remarks Every page knob is declared `.volatile()`, so the Loader hands `apply`
 *          a reference object (`{ get, set }`) rather than a value. Passing that
 *          reference on to `resolveSettings` would fail every comparison and
 *          silently resolve the compiled default, and serialising it into the
 *          page would produce `{}` — a profile patch that pins `theme` or the
 *          accent would look like it changed nothing. This is the one place the
 *          two representations meet.
 */
function plainValue(field: unknown): unknown {
  const get = typeof field === 'object' && field !== null ? Reflect.get(field, 'get') : undefined
  return typeof get === 'function' ? get.call(field) as unknown : field
}

/**
 * Unwrap the row's volatile fields into the plain config both halves agree on.
 * @param config - the row's validated config.
 * @returns the config with every page knob as a plain value.
 */
function plainConfig(config: Config): MimoConfig {
  return {
    theme: plainValue(config.theme),
    accent: plainValue(config.accent),
    pattern: plainValue(config.pattern),
    patternOpacity: plainValue(config.patternOpacity),
    patternText: plainValue(config.patternText),
    enabled: plainValue(config.enabled),
  }
}

/**
 * The settings row this half publishes into every rendered index page.
 *
 * The five knobs travel at their resolved value, so the page always receives the
 * effective settings rather than a half-filled object: an unedited row publishes
 * the same values the browser bundle compiles in, and an edited one publishes
 * the edit. `enabled` is not a knob; it is always published as `true`, because a
 * row that is disabled does not publish at all.
 * @param settings - resolved values.
 * @returns the value the browser half reads.
 */
function publishedSettings(settings: MimoSettings): Record<string, unknown> {
  const published: Record<string, unknown> = {}
  for (const key of PAGE_FIELDS) published[key] = settings[key]
  return published
}

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
