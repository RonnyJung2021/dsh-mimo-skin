/**
 * Builds both halves of the MiMo skin.
 *
 * The host half is one ESM file the engine's loader imports directly. The
 * browser half must come out in the shell's module-table dialect — a classic
 * script that registers a CommonJS factory through `window.__ModuleLoader__` —
 * with the platform seed words left as `require(...)` calls, because the shell
 * hands the factory its own `require`.
 *
 * Usage:
 *   node build.mjs
 *   node build.mjs --watch
 *
 * Two things about the host bundle are deliberate:
 *
 * - **The config schema is inlined.** An install links this package into the
 *   profile while its files stay in this checkout, so the engine sees a *linked*
 *   row: its bare imports are only routed back to the installation when an
 *   ancestor manifest declares the name as a peer, which one here does not.
 *   Inlining is safe because the volatile-config protocol is keyed by
 *   `Symbol.for`, not by module identity.
 * - **Cordis is not.** One Cordis instance must serve the engine and the plugin
 *   alike, so `@deepseek-ai/cordis` stays a bare import the engine resolves.
 *
 * The skin carries no packaged assets: every colour, rule and mark is CSS
 * written from the palette module, so `lib/` is the whole payload.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const outDir = join(root, 'lib')

/** Package name; the page loads this bundle under the same id. */
const PLUGIN_ID = 'dsh-mimo-skin'

/** Platform seed words: the shell serves these from its own module table. */
const CLIENT_EXTERNALS = ['react', 'react-dom', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives']

/**
 * The MIT notices of the packages the host bundle inlines.
 *
 * MIT requires the notice to travel with copies of the software, and the
 * inlined sources carry no `@license` marker for esbuild to preserve, so the
 * notices are appended to the artifact by hand from one file. Reading it rather
 * than repeating it keeps the repository copy and the artifact copy the same
 * text.
 */
const NOTICES = join(root, 'THIRD_PARTY_NOTICES.md')

const require = createRequire(import.meta.url)

/**
 * The host bundle's trailing comment: the third-party notices.
 * @returns the notices as a block comment.
 * @throws when the notices file is missing, because shipping a bundle without
 * them would break the licence it is distributed under.
 */
function legalFooter() {
  let text
  try {
    text = readFileSync(NOTICES, 'utf8')
  } catch (error) {
    throw new Error(`build: ${NOTICES} is unreadable; the bundle must carry its third-party notices. (${String(error)})`)
  }
  // A comment terminator inside the text would end the block early.
  return `/*\n${text.trimEnd().replaceAll('*/', '*\\/')}\n*/\n`
}

/**
 * Load the esbuild this checkout declares.
 * @returns the esbuild module.
 */
async function loadEsbuild() {
  try {
    return await import(require.resolve('esbuild'))
  } catch (error) {
    throw new Error(
      `build: esbuild was not found. Install it here (cd ${root} && npm install). (${String(error)})`,
    )
  }
}

const { build, context } = await loadEsbuild()

/** esbuild options for the host half. */
function hostOptions() {
  return {
    entryPoints: [join(root, 'src', 'index.ts')],
    outfile: join(outDir, 'index.js'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    sourcemap: true,
    external: ['@deepseek-ai/cordis'],
    footer: { js: legalFooter() },
    logLevel: 'info',
  }
}

/** esbuild options for the browser half. */
function clientOptions() {
  return {
    entryPoints: [join(root, 'src', 'client', 'index.ts')],
    outfile: join(outDir, 'client.raw.js'),
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    external: CLIENT_EXTERNALS,
    logLevel: 'info',
  }
}

/**
 * Wrap a built CommonJS bundle in the module-table registration envelope.
 * @param raw - the CommonJS output.
 * @returns the classic script the shell loads.
 */
function wrapClient(raw) {
  return `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(PLUGIN_ID)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${raw}
\t\treturn module.exports;
\t}
});
`
}

/** Build once, writing the wrapped browser bundle. */
async function buildOnce() {
  mkdirSync(outDir, { recursive: true })
  await build(hostOptions())
  const client = await build({ ...clientOptions(), write: false })
  writeFileSync(join(outDir, 'client.js'), wrapClient(client.outputFiles[0].text))
  process.stdout.write(`${PLUGIN_ID}: built\n`)
}

/** Writes the wrapped browser bundle for watch mode. */
function wrapPlugin() {
  return {
    name: 'wrap-client',
    setup(build) {
      build.onEnd((result) => {
        const raw = result.outputFiles?.[0]?.text
        if (raw === undefined) return
        writeFileSync(join(outDir, 'client.js'), wrapClient(raw))
      })
    },
  }
}

/** Rebuild on change. */
async function watch() {
  mkdirSync(outDir, { recursive: true })
  const host = await context(hostOptions())
  const client = await context({ ...clientOptions(), write: false, plugins: [wrapPlugin()] })
  await Promise.all([host.watch(), client.watch()])
  process.stdout.write(`${PLUGIN_ID}: watching\n`)
}

if (process.argv.includes('--watch')) await watch()
else await buildOnce()
