# Changelog

All notable changes to this plugin are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-06

### Added

- **`patternHeight`.** The mark's bar is now a setting (8–200px in the card and
  in the profile patch) instead of a compiled constant, and a 0.5px hairline
  closes the bar at its foot — the same rule the sidebar's edge is drawn with.
  The mark's face is derived from the height (0.58 of it), so no height crops
  the glyphs.

### Changed

- **The card writes itself, and the Save button is gone.** An edit applies and
  persists on its own once the hand stops: 100 ms after a pick — the shell
  dropdown or the mark's switch — and 600 ms after a knob that is typed or
  stepped (the accent, the mark's text, its ink and its height). A burst of
  spinner clicks or keystrokes therefore lands as one write instead of one per
  click, and no write lands in the middle of an adjustment to fight the hand
  making it. **Restore defaults** rides the same path, and a draft the settings
  service would refuse is still never written — the message under that field is
  the reason it is still sitting there.
- **The bar is half as tall by default** — 26px instead of 52px. A bar set back
  to 52 looks exactly as it did: 0.58 × 52 is the 30px face the old stylesheet
  clamped to at desktop widths.

## [0.1.1] - 2026-10-01

### Fixed

- **Installing straight from the git URL works again.** pnpm refuses to run a
  git dependency's build scripts unless the machine allowlists the package, so
  the `prepare` script that built `lib/` during the install was refused with
  `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` — and because `lib/` was ignored by
  git, the clone it refused to build carried no payload either. A git install
  therefore could not succeed at all, while the npm tarball was fine because
  `npm publish` had already run `prepare`.

  `lib/` is now committed, and the build moved from `prepare` to `prepack`. A
  git install has no build script to run, so it needs no allowlist entry, and
  `npm publish` still rebuilds the payload from source. A registry install is
  unchanged.

## [0.1.0] - 2026-10-01

First release. It is a reskin of the DSH Web GUI after
[mimo.xiaomi.com](https://mimo.xiaomi.com/): warm off-white paper, black
hairline rules, a serif reading face and an orange accent, with a dark shell
that is the same rules flipped to black paper and white ink.

### Added

- Whole-page reskin through the product's `--dsw-*` alias tokens: sidebar,
  message column, composer, menus and code blocks change together.
- Three shells — light, dark, and follow-the-product (the default) — with the
  dark block deliberately declared after the light one.
- A configurable accent. Only the fill is chosen; the variant used where the
  accent is rendered as text is derived per shell, darkened on the warm page and
  lightened on the black one, until it clears the 4.5:1 AA floor.
- A scrolling mark across the top of the page: one `nowrap` line whose content
  is the unit twice over, moved by `translateX(-50%)`. Its text, ink strength
  and on/off state are all settings.
- Fixed faces: PT Serif for prose, MiSans for chrome, SF Mono for code. The skin
  ships no font files, so the glyphs are whatever the machine has.
- Detail work: 3px corners, hairline rules, shallow shadows, a separately
  coloured switch off-track, an opaque composer card, scrollbars on the shell's
  ink, an accent focus ring, and menus that read as floating paper.
- A configuration card on the plugin page (侧栏「插件」→ dsh-mimo-skin) with a
  draft, Save, Restore defaults, and validation before a write.
- Card copy in `locale/zh.json` and `locale/en.json`, English as the fallback.
- `scripts/install-profile.mjs`, which installs the package as a profile bundle
  and takes a legacy `file://` insert row out. Supports `--dry-run` and
  `--uninstall`.

### Known trade-offs

- The state colours (warn/success/error), toasts, tooltips, diff backgrounds and
  the bubble highlight are deliberately **not** remapped, so the product keeps
  switching them for its own two themes.
- The derived accent-text value is not the reference site's own literal. `#ff6700`
  is 2.74:1 on its own page — fine as a fill, below AA as link text.
- Dark is the reference site's dark rules plus the black-paper/white-ink
  inversion, not a transcription of its dark screenshots.
