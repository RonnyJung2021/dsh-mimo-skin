/**
 * Load one TypeScript source module for `node:test`.
 *
 * The sources are TypeScript and the browser half is not importable as a bundle
 * either (it registers itself through `window.__ModuleLoader__`), so each module
 * under test is transpiled on the fly by this plugin's own esbuild.
 *
 * Usage:
 *   const { loadModule } = await import('./load-module.mjs')
 *   const { shellFor } = await loadModule('client/palette.ts')
 */

import { createRequire } from 'node:module'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const root = dirname(dirname(fileURLToPath(import.meta.url)))

/**
 * Transpile and import one module under `src/`.
 *
 * `@deepseek-ai/cordis` stays external because the host half only names it in
 * types, and an engine — not this package — is what resolves it at runtime.
 * `@deepseek-ai/schemastery` is bundled, exactly as `build.mjs` bundles it.
 * @param relative - path relative to `src/`, e.g. `client/palette.ts`.
 * @returns the imported module namespace.
 */
export async function loadModule(relative) {
  const esbuild = await import(require.resolve('esbuild'))
  const built = await esbuild.build({
    entryPoints: [join(root, 'src', relative)],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'node22',
    write: false,
    external: ['@deepseek-ai/cordis'],
    absWorkingDir: root,
    logLevel: 'silent',
  })
  const dir = mkdtempSync(join(tmpdir(), 'dsh-mimo-skin-'))
  const file = join(dir, `${relative.replaceAll('/', '-')}.mjs`)
  writeFileSync(file, built.outputFiles[0].text)
  return import(pathToFileURL(file).href)
}
