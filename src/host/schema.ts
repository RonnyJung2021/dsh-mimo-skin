/**
 * The row's schema, as the Loader resolves it before the plugin starts.
 *
 * Every field carries its default, so the published value is always complete and
 * the browser half never has to guess. The five page knobs are volatile — saving
 * them writes the profile patch — while `enabled` and `globalName` are deployment
 * configuration: both are read once, when the row activates, and stay out of the
 * card.
 */

import z from '@deepseek-ai/schemastery'
import {
  DEFAULT_ACCENT,
  DEFAULT_GLOBAL_NAME,
  DEFAULT_PATTERN_OPACITY,
  DEFAULT_PATTERN_TEXT,
  DEFAULT_THEME,
} from '../constants/plugin.ts'
import { THEMES, type MimoTheme } from '../enums/theme.ts'
import type { MimoConfig } from '../types/config.ts'

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

/** The row's schema, built from the one list of accepted theme choices. */
export const Config = z.object({
  theme: z.union([...THEMES]).default(DEFAULT_THEME)
    .description('整页用哪套 MiMo 外壳：auto 跟随产品自己的明暗设置（默认）。').volatile(),
  accent: z.string().default(DEFAULT_ACCENT)
    .description('强调色，写成 #rrggbb；当文字渲染时会自动加深或提亮到达标对比度。').volatile(),
  pattern: z.boolean().default(true)
    .description('是否在顶部画那条滚动的字标，默认开。').volatile(),
  patternOpacity: z.number().min(0).max(1).default(DEFAULT_PATTERN_OPACITY)
    .description('字标的墨色浓度，0–1，默认 0.05——参照站自己的值。').volatile(),
  patternText: z.string().default(DEFAULT_PATTERN_TEXT)
    .description('字标滚动的文字，默认 DEEPSEEK HARNESS。').volatile(),
  enabled: z.boolean().default(true)
    .description('是否发布这套皮肤配置；关掉等于本行不注入，页面回落到自带默认值。'),
  globalName: z.string().default(DEFAULT_GLOBAL_NAME)
    .description('宿主写进页面的全局名，一般不用改。'),
})
