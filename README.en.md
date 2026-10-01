# dsh-mimo-skin

[中文](README.md) | **English**

![version](https://img.shields.io/badge/version-0.1.1-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![DSH](https://img.shields.io/badge/DSH-%3E%3D0.1.5--rc.2-8b5cf6)
![tests](https://img.shields.io/badge/tests-101%20passing-brightgreen)
![node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933)

> A **skin-only plugin** for the DSH Web GUI — warm off-white paper, black hairline rules,
> a serif reading face and an orange accent.

[Install](#install) · [First run](#first-run) · [中文](README.md)

<!-- Images use the repository's absolute URL: npm cannot resolve a relative path when it renders
     this README, and `docs/…` would show up as a broken-image box. -->
![Before and after](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-compare.png)

Same engine, same page: **top** is the product's own shell, **bottom** is the same page with the skin
on. Both are screenshots of a real engine in a real browser, not mock-ups.

## What it is

It turns the DSH Web GUI into the look of [`mimo.xiaomi.com`](https://mimo.xiaomi.com/). It adds **no
features and changes nothing but the look**: sidebar, message column, composer card, menus and code
blocks change together, in both a light and a dark shell. It is for anyone who wants DSH in that
warm-paper, hairline-rule, serif-prose editorial style.

### What it costs

| Item | Value |
| --- | --- |
| Payload | `lib/index.js` 42.1 KB / `lib/client.js` 47.5 KB |
| Product tokens remapped | 74 `--dsw-*` aliases |
| The skin's own variables | 16 `--dsh-mimo-*` |
| Bundled assets / runtime deps | **0** (no font files, no images; only the engine's own `@deepseek-ai/cordis` stays external) |
| Tests | 101 cases in 9 files, about 0.3 s |

## What it does

### Whole-page reskin

Recoloured only through the product's documented `--dsw-*` aliases; the page structure is untouched.

| Part | Becomes | Taken from the reference site |
| --- | --- | --- |
| Page ground | `#faf7f5` warm white | `:root{--bg-primary}` |
| Raised surfaces (bubbles, menus, composer) | `#f5f0eb` nested surface | `--bg-secondary` |
| Body text | `#1a1a1a` ink | `--text-primary` |
| Secondary / tertiary text | `#555` / `#888` | `--text-secondary` / `--text-tertiary` |
| Rules | pure black hairline | section rows `border-bottom:1px solid #000`, cards `#00000012` |
| Accent | `#ff6700` by default, editable | `--accent` |
| Three faces | PT Serif for prose / MiSans for chrome / SF Mono for code | `--font-serif`, `--font-title`, `--font-mono` |
| Corners | 3px | content cards `border-radius:3px` |
| Shadows | the site's own very shallow set | `.grid-btn`, content cards |

### Two shells, light and dark

The dark shell **is the same rules flipped over**, not "the background turned down":

| | Light | Dark |
| --- | --- | --- |
| Paper | `#faf7f5` off-white (the site's `--bg-primary`) | `#000000` pure black (its dark `--rp-home-bg`) |
| Nested surface | `#f5f0eb` | `#111111` |
| Ink | `#1a1a1a` | `#ffffff` |
| Secondary / tertiary text | `#555` / `#888` | `#b3b3b3` / `#8a8a8a` |
| Rules | `#000` black hairline | `#ffffff` white hairline |
| Hover / pressed | black 4% / 8% wash | white 7% / 12% wash |
| Shadow | black 8% | black 50% |

![Dark shell](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-dark.png)

**The shell setting** defaults to `auto`: it follows the product's own light/dark setting — you switch
the product, the skin repaints.

### The accent: fill and text are computed apart

The reference site's `#ff6700` is only **2.74:1** on its own `#faf7f5` paper: fine as a fill, below the
4.5:1 AA floor as link text. So the skin asks you for **one colour** (the fill) and **derives the
variant it renders as text** — darkened on the warm page, lightened on the black one, until it clears
the floor. The default `#ff6700` therefore yields `#bf4d00` in light (4.60:1) and `#ff6700` in dark
(7.19:1). Pick another colour and both are recomputed; the AA floor does not move.

![The plugin card](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-card.png)

The card shows both derived values, with their contrast ratios.

### The scrolling mark

![The mark at the top](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-light.png)

A bar fixed to the top of the window, carrying one line of faint text that scrolls sideways:

- **The scroll**: the line's content is the text **twice over**, animated `translateX(0 → -50%)` on a
  linear infinite loop, so the seam is invisible.
- **The place**: full width, and `body` is pushed down by the bar's own height (52px by default), so
  it owns its **own row** and never covers the sidebar or the title row.
- **Adjustable**: ink strength 0–1 (0.05 by default, the site's own value), editable text
  (`DEEPSEEK HARNESS` by default), and it can be **switched off entirely** — the row goes with it.
- **Out of the way**: no pointer events, not selectable, `aria-hidden`, and it re-attaches itself if
  something moves or removes it. In the macOS desktop shell it declares `-webkit-app-region: drag`,
  or the product's "no-drag on body children outside `#root`" rule would make that strip undraggable.

### Tokens it deliberately leaves alone

- **State colours / toast / tooltip / diff backgrounds / bubble highlight**: the product already
  switches a dark set on `body[data-ds-dark-theme]`; pinning them would carry a white-paper amber onto
  black paper, so the skin declares none of them.
- **Primary buttons**: the reference site's own primary button is **black** on the light page and
  **white** on the dark one, with orange only as trim — so `--dsw-alias-button-primary-fill` is left
  alone, and only the **info fill** (the send button at the composer's bottom right) takes the accent.
- **The switch's off state**: the product uses `--dsw-alias-border-l3` as the off state's **background**
  (not an outline), and that token is a black hairline in the skin; the skin repaints the off state with
  `--dsh-mimo-track` instead, and leaves the on state on the product's own brand fill.

![The plugins page](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-plugins.png)

Above: the eight official plugins' off switches are a light grey wash, and `dsh-mimo-skin`'s own on
switch keeps the product's brand fill.

## Install

### Requirements

| Item | Requirement |
| --- | --- |
| DSH | `dsh-v0.1.5-rc.2` or newer; backward compatible from there |
| Node.js | `^22.19.0 \|\| >=24.0.0` (only needed if you build it yourself) |
| OS | Whatever the DSH Web GUI runs on: macOS, Windows, Linux |

### Option 1: the command line

```bash
# From npm
dsh plugin --profile web add dsh-mimo-skin

# Or straight from GitHub: the repo carries the built lib/, so the installer builds nothing
dsh plugin --profile web add https://github.com/RonnyJung2021/dsh-mimo-skin
```

> **A GitHub install relies on the `lib/` in the repo; do not turn it back into "build after install".**
> pnpm refuses to run a git dependency's build scripts (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`) unless
> the machine lists the package under `onlyBuiltDependencies` in the profile's `pnpm-workspace.yaml`,
> and that key has to be copied character for character from what pnpm printed. So the payload is
> committed and the build moved to `prepack`: a git install has nothing to build and nothing to allow.

### Option 2: the Plugins page

Sidebar **Plugins** → **Add plugin** → enter `dsh-mimo-skin` (or the GitHub URL above) → **Install** →
**Enable now** when it finishes.

### Installing from the working directory, while developing

```bash
node scripts/install-profile.mjs --home /path/to/home              # install
node scripts/install-profile.mjs --home /path/to/home --dry-run    # print what would change
node scripts/install-profile.mjs --home /path/to/home --uninstall  # remove
```

It writes the three things the Plugins page itself writes: the `link:` dependency and the name in
`dsh.profile.bundles` in the profile's `package.json`, the `node_modules/<name>` symlink, and the
importer entry in `pnpm-lock.yaml`. It also takes an older `file://` insert row out, which would
otherwise load the plugin twice, and backs up every file it edits as `*.bak-dsh-mimo-skin`.

### First run

1. Install and **enable** it by either route above.
2. Open the GUI and go to the sidebar's **Plugins → Installed → dsh-mimo-skin**; the plugin's **own
   settings page** sits under the card.
3. Change what you want and press **Save**; the page repaints at once.

### Uninstall

```bash
dsh plugin --profile web remove dsh-mimo-skin
```

Or press uninstall on the package's page (it asks first). The stylesheet, the scrolling mark and the
injected palette all go with it and the page returns to the product's own shell, **leaving nothing
behind**.

## Configuration

Five appearance fields plus one master switch. Every field is optional: omit it and the default
applies, and an invalid value falls back per field — a broken skin must never keep the GUI from
booting.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `theme` | `light` \| `dark` \| `auto` | `auto` | Which shell to paint; `auto` follows the product's own light/dark setting |
| `accent` | `#rgb` / `#rrggbb` | `#ff6700` | Accent as a fill; the variant used as text is derived |
| `pattern` | boolean | `true` | Whether to paint the scrolling mark across the top |
| `patternOpacity` | number 0–1 | `0.05` | The mark's ink strength; the site's own value is 0.05 |
| `patternText` | string | `DEEPSEEK HARNESS` | What the mark scrolls; must not be blank |
| `enabled` | boolean | `true` | Whether the skin renders |

In the profile's patch (`profiles/web/cordis.patch.yml`):

```yaml
- insert:
    - id: dsh-mimo-skin
      name: dsh-mimo-skin
      config:
        theme: auto                 # light | dark | auto
        accent: '#ff6700'           # any #rrggbb; the text-safe variant is derived
        pattern: true               # paint the scrolling mark across the top
        patternOpacity: 0.05        # its ink strength, 0…1
        patternText: DEEPSEEK HARNESS
        enabled: true
```

You can also skip the YAML and use the plugin's own card instead:

- **Only Save applies a change** (fields do not repaint as you type), and **Restore defaults** writes
  every appearance field back.
- **Save validates first**: the colour must be a legal literal, the strength must sit inside 0–1, and
  the mark's text must not be blank. While something is wrong, Save is greyed out and the field says
  what is wrong underneath.
- **Changes persist**: values are written into the profile's configuration, so they survive a port
  change, a restart and a switch between the panel and the desktop window; the page keeps no copy.
- **The three faces are not in the card**: the skin ships no font files, so a hand-typed stack would
  only point at families this machine may not have; the stacks are the ones compiled into the plugin.

## Layout

```
dsh-mimo-skin/
├── lib/{index.js,client.js}  # both halves: Host (self-contained ESM) + browser (module-table), committed
├── src/index.ts              # Host half: publishes the settings, declares Config
├── src/config.ts             # config fields and their per-field fallbacks
├── src/color.ts              # colour parsing, mixing and the AA contrast derivation
├── src/client/               # browser half: styles / palette / skin / marquee / settings / panel
├── locale/{zh,en}.json       # card copy; English is the fallback language
├── test/                     # 101 unit tests
├── docs/                     # the screenshots this README uses
├── scripts/install-profile.mjs   # install into / remove from a profile
├── build.mjs                 # the esbuild build for both halves
├── cordis.patch.yml          # the bundle patch: the row that activates on install
└── CHANGELOG.md / THIRD_PARTY_NOTICES.md / LICENSE
```

### The two halves

| Half | What it does | Why it is split this way |
| --- | --- | --- |
| Host (`lib/index.js`) | Writes the row's five appearance fields in full into the index injection table; `Config` declares them `.volatile()`, which makes that row the settings namespace behind the Plugins page's card | The loader row's `config` never reaches the page (the boot graph carries only id/inject/external), while a card's write can only land in the profile through the settings service |
| Browser (`lib/client.js`) | Installs the stylesheet, mounts the scrolling mark, writes the palette onto `document.body`, renders the card | The skin has no timeline and no session state; all it needs is settings |

The skin **ships no bundled assets**: every colour, line and the mark itself are CSS written by the
browser half, so the Host half registers no routes and needs no web server.

### Compatibility

- DSH only; no cross-host compatibility. The floor is `dsh-v0.1.5-rc.2`, backward compatible from there.
- **The page structure is untouched**: apart from `body` / `#root` it uses only documented hooks
  (`[data-composer-card]`, `[data-menu-material]`, the switch's own `role` / `aria-checked`), never
  generated class names that expire.

### Development

```bash
npm install                  # esbuild + schemastery, for the build only
node build.mjs               # both halves into lib/
node build.mjs --watch       # rebuild on every src/ change
node --test test/*.test.mjs  # 101 unit tests
```

**`lib/` is committed: after changing `src/`, commit the rebuilt `lib/` with it** — a GitHub install
uses exactly that payload. Publishing goes through `prepack`, so `npm publish` rebuilds first and the
npm tarball always matches `src/`.

After a source change: the browser half is **hot-reloaded**; the Host half is loaded once, when the
engine process starts — replacing it means restarting the engine, not reloading the page.

The tests cover: the colour arithmetic and `readableOn`'s AA floor (measured by a second, independent
WCAG implementation, so the code cannot certify itself), the per-field config fallbacks, the shells'
values and selection, a passing text colour for any accent, the mark's doubled structure and its
re-attachment, the stylesheet's token contract (with negative assertions such as "no generated class
names", "the accent never becomes the primary-button fill", "state colours are never pinned" and "the
dark block comes after the light one"), no residue after uninstall, the card's field narrowing and
pre-write validation, and the two `locale/` dictionaries key for key.

## FAQ

**I installed it and nothing changed.**
Check that the `dsh-mimo-skin` row is switched on in the Plugins page, then reload the page. The Host
half is loaded once, when the engine process starts; if it is the Host half you just replaced, the DSH
engine itself is what needs restarting.

**Why is the accent, as text, not the site's `#ff6700`?**
`#ff6700` is 2.74:1 on `#faf7f5`, below the 4.5:1 AA floor. The skin keeps the contrast, so the text
variant is derived (`#bf4d00` in light by default). To use the site's literal you would have to accept
link contrast below AA.

**The type does not look like the site's.**
The skin **ships no font files**; it only declares stacks, so the glyphs are whatever this machine has
installed, falling back to Noto Serif SC / Songti / Georgia. A 1:1 match means shipping woff2, which
means settling MiSans licensing first.

**How do I upgrade?**
Plugins do not update themselves: uninstall, then install the new version.

**Why does dark differ from the site's dark screenshots?**
The site's `.dark` is Rspress's unmodified default blue-grey and cannot be copied. The skin matches the
site's dark paper (`--rp-home-bg:#000`) plus the rule "black paper, white ink, accent one step
brighter".

## Roadmap

- **Released**: `v0.1.0`, the first version; `v0.1.1`, which makes a git install work (`lib/`
  committed, the build moved from `prepare` to `prepack`).
- **Planned**: nothing scheduled. The candidates are shipping the fonts (MiSans licensing first) and
  following later revisions of the reference site.

Details in [CHANGELOG.md](CHANGELOG.md).

## Contributing

- An issue should carry the DSH version, the OS and the steps to reproduce; a screenshot helps for
  anything visual.
- A PR should keep the tests green (`node --test test/*.test.mjs`) and commit the rebuilt `lib/`
  whenever `src/` changed.
- One change does one thing; no unrelated refactoring.

## License

MIT, see [LICENSE](LICENSE).

The third-party code inlined into the build (`@deepseek-ai/schemastery`, MIT) is credited in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and `build.mjs` appends those notices to the
artifact.

Visual reference: [`mimo.xiaomi.com`](https://mimo.xiaomi.com/). Host platform:
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Changes:
[CHANGELOG.md](CHANGELOG.md).
