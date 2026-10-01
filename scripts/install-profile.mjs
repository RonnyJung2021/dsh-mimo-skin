/**
 * Install (or remove) this plugin as a bundle of one DSH profile.
 *
 * A bundle, not a `file://` row in the profile patch: the Plugins page manages
 * bundles, and its list is the only place the Host renders its own on/off
 * switch on a card. Installing this way writes the three things the Plugins
 * page itself writes for a local package —
 *
 * 1. `package.json`: a `link:` dependency plus the name in `dsh.profile.bundles`;
 * 2. `node_modules/<name>`: the symlink that resolves the bundle's module name;
 * 3. `pnpm-lock.yaml`: the same dependency in the importer section.
 *
 * — and takes the older `file://` insert row out, which would otherwise load
 * the plugin a second time: `insert` appends rows, and two rows carrying one id
 * collapse only when the loader mounts them, where the later layer wins. The
 * values that row carried are this machine's, not the install method's, so its
 * `config:` block becomes a plain `- id: <name>` override instead of going with
 * it.
 *
 * Usage:
 *   node scripts/install-profile.mjs [--home <dir>] [--profile <name>]
 *                                    [--uninstall] [--dry-run]
 *
 * Defaults: home `$DSH_HOME` or `~/.dsh`, profile `web`. Every path is printed
 * before it is touched, and each edited file is backed up first.
 */

import {
  copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, renameSync, symlinkSync, unlinkSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

/** Bundle package name; also the loader row id and the settings namespace. */
const PACKAGE_NAME = 'dsh-mimo-skin'

/** What every backup of an edited profile file ends in. */
const BACKUP_SUFFIX = `.bak-${PACKAGE_NAME}`

/**
 * Read one `--flag value` option.
 * @param name - flag name without dashes.
 * @param fallback - value when the flag is absent.
 * @returns the flag value.
 */
function option(name, fallback) {
  const at = process.argv.indexOf(`--${name}`)
  return at === -1 ? fallback : process.argv[at + 1]
}

const home = resolve(option('home', process.env.DSH_HOME ?? join(homedir(), '.dsh')))
const profile = option('profile', 'web')
const uninstall = process.argv.includes('--uninstall')
const dryRun = process.argv.includes('--dry-run')

const profileDir = join(home, 'profiles', profile)
const manifestPath = join(profileDir, 'package.json')
const lockPath = join(profileDir, 'pnpm-lock.yaml')
const patchPath = join(profileDir, 'cordis.patch.yml')
const linkPath = join(profileDir, 'node_modules', PACKAGE_NAME)
const specifier = `link:${root}`

/** Files this run changed, so the summary can name them. */
const changed = []

/**
 * Write one file atomically, backing up what was there.
 * @param path - file to write.
 * @param text - new contents.
 * @param before - previous contents, for the backup.
 */
function write(path, text, before) {
  if (text === before) return
  process.stdout.write(`${dryRun ? 'would write' : 'writing'} ${path}\n`)
  changed.push(path)
  if (dryRun) return
  if (existsSync(path)) copyFileSync(path, `${path}${BACKUP_SUFFIX}`)
  const temporary = `${path}.tmp-${PACKAGE_NAME}`
  writeFileSync(temporary, text)
  renameSync(temporary, path)
}

if (!existsSync(manifestPath)) {
  process.stderr.write(`${manifestPath} does not exist: run the engine once for profile "${profile}" first\n`)
  process.exit(1)
}

const manifestBefore = readFileSync(manifestPath, 'utf8')
const manifest = JSON.parse(manifestBefore)
manifest.dependencies = manifest.dependencies ?? {}
manifest.dsh = manifest.dsh ?? {}
manifest.dsh.profile = manifest.dsh.profile ?? {}
const bundles = manifest.dsh.profile.bundles ?? []

if (uninstall) {
  delete manifest.dependencies[PACKAGE_NAME]
  manifest.dsh.profile.bundles = bundles.filter(name => name !== PACKAGE_NAME)
} else {
  manifest.dependencies[PACKAGE_NAME] = specifier
  if (!bundles.includes(PACKAGE_NAME)) manifest.dsh.profile.bundles = [...bundles, PACKAGE_NAME]
}
const manifestAfter = `${JSON.stringify(manifest, null, 2)}\n`
write(manifestPath, manifestAfter, manifestBefore)

if (uninstall) {
  if (existsSync(linkPath)) {
    process.stdout.write(`${dryRun ? 'would remove' : 'removing'} ${linkPath}\n`)
    if (!dryRun) unlinkSync(linkPath)
  }
} else {
  const current = existsSync(linkPath) && lstatSync(linkPath).isSymbolicLink() ? readlinkSync(linkPath) : undefined
  if (current === undefined) {
    process.stdout.write(`${dryRun ? 'would link' : 'linking'} ${linkPath} -> ${root}\n`)
    changed.push(linkPath)
    if (!dryRun) {
      mkdirSync(dirname(linkPath), { recursive: true })
      symlinkSync(root, linkPath, 'dir')
    }
  }
}

// pnpm records each importer dependency under the profile's own entry; keep the
// lock in step so a later `pnpm install --frozen-lockfile` does not report a
// mismatch. The specifier keeps the absolute path pnpm itself writes for a
// `link:` dependency, while `version` is the path relative to the profile.
if (existsSync(lockPath)) {
  const lockBefore = readFileSync(lockPath, 'utf8')
  const entry = [
    `      ${PACKAGE_NAME}:`,
    `        specifier: ${specifier}`,
    `        version: link:${relative(profileDir, root)}`,
  ].join('\n')
  const hasEntry = lockBefore.includes(`      ${PACKAGE_NAME}:`)
  let lockAfter = lockBefore
  if (uninstall && hasEntry) {
    lockAfter = lockBefore.replace(new RegExp(`\\n {6}${PACKAGE_NAME}:\\n(?: {8}.*\\n)+`, 'u'), '\n')
  } else if (!uninstall && !hasEntry) {
    const anchor = /(importers:\n\n {2}\.:\n(?: {4}[^\n]*\n)* {4}dependencies:\n)/
    lockAfter = anchor.test(lockBefore)
      ? lockBefore.replace(anchor, `$1${entry}\n`)
      : lockBefore
    if (!anchor.test(lockBefore)) {
      process.stderr.write(`warning: ${lockPath} has no "importers: .: dependencies:" section; left unchanged\n`)
    }
  }
  write(lockPath, lockAfter, lockBefore)
}

/**
 * Find the `- insert:` entry an indented row belongs to.
 * @param lines - the patch file's lines.
 * @param rowAt - index of the row's `- id:` line.
 * @returns the index of its own `- insert:` line, or -1 when the row is not an
 *          inserted row.
 * @remarks Walking backwards to the nearest `- insert:` is not enough: a plain
 *          top-level `- id:` override that happens to sit below somebody else's
 *          insert block would be read as part of it. The row's container is the
 *          nearest line above it at column 0 — indented and blank lines belong
 *          to the block, the first unindented line is either that block's own
 *          `- insert:` or a different entry, and only the former counts.
 */
function insertBlockOf(lines, rowAt) {
  if (!/^\s/u.test(lines[rowAt] ?? '')) return -1
  let at = rowAt
  while (at > 0) {
    const previous = lines[at - 1]
    if (previous.trim() === '' || /^\s/u.test(previous)) {
      at -= 1
      continue
    }
    return /^- insert:/u.test(previous) ? at - 1 : -1
  }
  return -1
}

/**
 * Take the legacy `file://` insert row for this package out of a profile patch,
 * keeping the values the row carried.
 * @param text - the patch file.
 * @param name - the package name the row declares.
 * @returns the patch without that row, how many rows went, and whether an
 *          override kept its config.
 * @remarks Only the row whose own `- id: <name>` sits inside an `insert:` list
 *          goes: the file's comments above it mention the package by name, so a
 *          mention is not evidence, and a plain `- id: <name>` override — the
 *          form the settings page writes — is a different entry that must stay.
 *          A block that held other rows keeps them. The row's `config:` block
 *          names this machine's values — a webhook, a path — which a committed
 *          bundle patch must not carry, so it is re-emitted as the plain
 *          override the settings form writes, unless the file already has one.
 */
function migrateLegacyInsert(text, name) {
  const lines = text.split('\n')
  const declaration = new RegExp(`^- id: ${name}\\s*$`, 'u')
  const rowDeclaration = new RegExp(`^\\s*- id: ${name}\\s*$`, 'u')
  const rowAt = lines.findIndex(line => rowDeclaration.test(line))
  if (rowAt === -1) return { text, removed: 0, keptConfig: false }
  const containerAt = insertBlockOf(lines, rowAt)
  if (containerAt === -1) return { text, removed: 0, keptConfig: false }
  // The row's own extent: the block may carry several rows, and a following
  // row's `config:` is that row's, not this one's.
  let blockEnd = containerAt + 1
  while (blockEnd < lines.length && !/^- /u.test(lines[blockEnd])) blockEnd += 1
  let rowEnd = rowAt + 1
  while (rowEnd < blockEnd && !/^\s{4}- /u.test(lines[rowEnd])) rowEnd += 1
  const configAt = lines.findIndex((line, index) => index > rowAt && index < rowEnd && /^\s{4,}config:\s*$/u.test(line))
  const config = configAt === -1
    ? []
    : lines.slice(configAt + 1, rowEnd).filter(line => line.trim() !== '')
  const hasOverride = lines.some(line => declaration.test(line))
  // A block that carries other rows keeps its container and its comments: only
  // this row goes.
  const alone = !lines.slice(containerAt + 1, blockEnd).some((line, offset) => {
    const index = containerAt + 1 + offset
    return index !== rowAt && /^\s{4}- /u.test(line)
  })
  let startAt = rowAt
  let endAt = rowEnd
  if (alone) {
    startAt = containerAt
    while (startAt > 0 && /^#/u.test(lines[startAt - 1])) startAt -= 1
    endAt = blockEnd
  }
  const kept = [...lines.slice(0, startAt), ...lines.slice(endAt)]
  let after = kept.join('\n').replace(/\n{3,}/gu, '\n\n')
  let keptConfig = false
  if (config.length > 0 && !hasOverride) {
    const override = [`- id: ${name}`, '  config:', ...config.map(line => line.replace(/^ {4}/u, ''))].join('\n')
    after = `${after.trimEnd()}\n\n${override}\n`
    keptConfig = true
  }
  return { text: after, removed: 1, keptConfig }
}

// The older install method: a `file://` insert row in the profile patch. It
// would load this package a second time, so take that one block out — the plain
// `- id: <name>` override the settings form writes is left alone.
if (existsSync(patchPath)) {
  const patchBefore = readFileSync(patchPath, 'utf8')
  const migrated = migrateLegacyInsert(patchBefore, PACKAGE_NAME)
  if (migrated.removed > 0) {
    process.stdout.write(`${dryRun ? 'would drop' : 'dropping'} the legacy insert row from ${patchPath}${migrated.keptConfig ? ' (its config becomes a plain override)' : ''}\n`)
    write(patchPath, migrated.text, patchBefore)
  }
}

if (changed.length === 0) process.stdout.write(`${PACKAGE_NAME}: profile already up to date\n`)
else process.stdout.write(`${PACKAGE_NAME}: ${uninstall ? 'uninstalled from' : 'installed into'} ${profileDir}\n`)
