window.__ModuleLoader__.load({
	id: "dsh-mimo-skin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name,
  readSettings: () => readSettings
});
module.exports = __toCommonJS(index_exports);

// src/constants/plugin.ts
var PLUGIN_ID = "dsh-mimo-skin";
var SETTINGS_NAMESPACE = PLUGIN_ID;
var DEFAULT_GLOBAL_NAME = "__DSH_MIMO_SKIN__";
var DEFAULT_ACCENT = "#ff6700";
var DEFAULT_PATTERN_TEXT = "DEEPSEEK HARNESS";
var DEFAULT_PATTERN_OPACITY = 0.05;
var DEFAULT_PATTERN_HEIGHT = 26;
var DEFAULT_THEME = "auto";
var DEFAULT_PATTERN = true;
var DEFAULT_ENABLED = true;

// src/constants/config.ts
var SECTION_FIELDS = ["theme", "accent", "pattern", "patternOpacity", "patternText", "patternHeight"];
var CONTINUOUS_FIELDS = [
  "accent",
  "patternText",
  "patternOpacity",
  "patternHeight"
];
var SAVE_DEBOUNCE_PICK = 100;
var SAVE_DEBOUNCE_ADJUST = 600;
var PATTERN_HEIGHT_MIN = 8;
var PATTERN_HEIGHT_MAX = 200;

// src/enums/theme.ts
var THEMES = ["light", "dark", "auto"];
function isTheme(value) {
  return typeof value === "string" && THEMES.includes(value);
}

// src/utils/color.ts
var HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu;
var AA_TEXT_CONTRAST = 4.5;
function parseColor(value) {
  if (typeof value !== "string") return void 0;
  const text2 = value.trim();
  if (!HEX.test(text2)) return void 0;
  const digits = text2.slice(1);
  const full = digits.length === 3 ? digits.split("").map((digit) => `${digit}${digit}`).join("") : digits;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16)
  };
}
function isColor(value) {
  return parseColor(value) !== void 0;
}
function toHex(color) {
  const channel = (value) => Math.round(value).toString(16).padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}
function mix(from, to, amount) {
  const at = Math.min(1, Math.max(0, amount));
  return {
    r: from.r + (to.r - from.r) * at,
    g: from.g + (to.g - from.g) * at,
    b: from.b + (to.b - from.b) * at
  };
}
function luminance(color) {
  const channel = (value) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}
function contrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}
function readableOn(color, page, direction, floor = AA_TEXT_CONTRAST) {
  if (contrast(color, page) >= floor) return toHex(color);
  const target = direction === "darken" ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  const steps = 100;
  for (let step = 1; step <= steps; step += 1) {
    const candidate = mix(color, target, step / steps);
    if (contrast(candidate, page) >= floor) return toHex(candidate);
  }
  return toHex(target);
}

// src/utils/value.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function isNumberWithin(value, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  return value >= min && value <= max;
}
function numberWithin(value, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) return void 0;
  return Math.min(max, Math.max(min, value));
}
function numberOr(value, fallback, min, max) {
  return numberWithin(value, min, max) ?? fallback;
}
function nonBlankText(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed === "" ? fallback : trimmed;
}

// src/utils/config.ts
function resolveSettings(config) {
  const raw = config ?? {};
  return {
    theme: isTheme(raw.theme) ? raw.theme : DEFAULT_THEME,
    accent: isColor(raw.accent) ? raw.accent.trim().toLowerCase() : DEFAULT_ACCENT,
    pattern: raw.pattern === void 0 ? DEFAULT_PATTERN : raw.pattern !== false,
    patternOpacity: numberOr(raw.patternOpacity, DEFAULT_PATTERN_OPACITY, 0, 1),
    patternText: nonBlankText(raw.patternText, DEFAULT_PATTERN_TEXT),
    patternHeight: numberOr(raw.patternHeight, DEFAULT_PATTERN_HEIGHT, PATTERN_HEIGHT_MIN, PATTERN_HEIGHT_MAX),
    enabled: raw.enabled === void 0 ? DEFAULT_ENABLED : raw.enabled !== false
  };
}

// src/utils/section.ts
var DEFAULTS = resolveSettings(void 0);
var SECTION_DEFAULTS = {
  theme: DEFAULTS.theme,
  accent: DEFAULTS.accent,
  pattern: DEFAULTS.pattern,
  patternOpacity: DEFAULTS.patternOpacity,
  patternText: DEFAULTS.patternText,
  patternHeight: DEFAULTS.patternHeight
};
function sectionOf(value) {
  if (!isRecord(value)) return {};
  const section = {};
  if (isTheme(value.theme)) section.theme = value.theme;
  if (isColor(value.accent)) section.accent = value.accent.trim().toLowerCase();
  if (typeof value.pattern === "boolean") section.pattern = value.pattern;
  const patternOpacity = numberWithin(value.patternOpacity, 0, 1);
  if (patternOpacity !== void 0) section.patternOpacity = patternOpacity;
  if (typeof value.patternText === "string" && value.patternText.trim() !== "") {
    section.patternText = value.patternText.trim();
  }
  const patternHeight = numberWithin(value.patternHeight, PATTERN_HEIGHT_MIN, PATTERN_HEIGHT_MAX);
  if (patternHeight !== void 0) section.patternHeight = patternHeight;
  return section;
}
function invalidFields(section) {
  const invalid = [];
  if (!isTheme(section.theme)) invalid.push("theme");
  if (!isColor(section.accent)) invalid.push("accent");
  if (!isNumberWithin(section.patternOpacity, 0, 1)) invalid.push("patternOpacity");
  if (nonBlankText(section.patternText, "") === "") invalid.push("patternText");
  if (!isNumberWithin(section.patternHeight, PATTERN_HEIGHT_MIN, PATTERN_HEIGHT_MAX)) {
    invalid.push("patternHeight");
  }
  return invalid;
}
function sectionOps(section) {
  return SECTION_FIELDS.map((field) => ({
    op: "set",
    path: [field],
    value: section[field]
  }));
}

// src/client/components/Panel.tsx
var import_react = require("react");

// src/client/palette.ts
var LIGHT_SHELL = {
  id: "light",
  page: "#faf7f5",
  raised: "#f5f0eb",
  ink: "#1a1a1a",
  muted: "#555555",
  faint: "#888888",
  rule: "#000000",
  ruleSoft: "#00000012",
  track: "#0000001f",
  washAlpha: "1a",
  textDirection: "darken",
  hover: "#0000000a",
  active: "#00000014",
  shadow: "#00000014"
};
var DARK_SHELL = {
  id: "dark",
  page: "#000000",
  raised: "#111111",
  ink: "#ffffff",
  muted: "#b3b3b3",
  faint: "#8a8a8a",
  rule: "#ffffff",
  ruleSoft: "#ffffff29",
  track: "#ffffff29",
  washAlpha: "26",
  textDirection: "lighten",
  hover: "#ffffff12",
  active: "#ffffff1f",
  shadow: "#00000080"
};
function accents(accent, shell) {
  const fill = parseColor(accent);
  const page = parseColor(shell.page);
  if (fill === void 0 || page === void 0) {
    return { fill: accent, text: accent, wash: accent };
  }
  const normalized = toHex(fill);
  return {
    fill: normalized,
    text: readableOn(fill, page, shell.textDirection),
    wash: `${normalized}${shell.washAlpha}`
  };
}
function skinVariables(input, shell) {
  const accent = accents(input.accent, shell);
  return {
    "--dsh-mimo-page": shell.page,
    "--dsh-mimo-raised": shell.raised,
    "--dsh-mimo-ink": shell.ink,
    "--dsh-mimo-muted": shell.muted,
    "--dsh-mimo-faint": shell.faint,
    "--dsh-mimo-rule": shell.rule,
    "--dsh-mimo-rule-soft": shell.ruleSoft,
    "--dsh-mimo-track": shell.track,
    "--dsh-mimo-accent": accent.fill,
    "--dsh-mimo-accent-text": accent.text,
    "--dsh-mimo-accent-wash": accent.wash,
    "--dsh-mimo-hover": shell.hover,
    "--dsh-mimo-active": shell.active,
    "--dsh-mimo-shadow": shell.shadow,
    // Zero when the band is off, so the page it would have pushed down closes up.
    "--dsh-mimo-marquee-height": input.pattern ? `${input.patternHeight}px` : "0px",
    "--dsh-mimo-pattern-opacity": String(input.pattern ? input.patternOpacity : 0)
  };
}
function shellFor(setting, documentIsDark) {
  if (setting === "light") return LIGHT_SHELL;
  if (setting === "dark") return DARK_SHELL;
  return documentIsDark ? DARK_SHELL : LIGHT_SHELL;
}

// src/client/accent-preview.ts
function derive(fill, shell) {
  const page = parseColor(shell.page);
  if (page === void 0) return void 0;
  const value = readableOn(fill, page, shell.textDirection);
  const ratio = contrast(parseColor(value) ?? fill, page);
  return { value, ratio: `${ratio.toFixed(1)}:1` };
}
function accentPreview(accent) {
  const fill = parseColor(accent);
  if (fill === void 0) return void 0;
  const light = derive(fill, LIGHT_SHELL);
  const dark = derive(fill, DARK_SHELL);
  if (light === void 0 || dark === void 0) return void 0;
  return { light, dark };
}

// locale/en.json
var en_default = {
  meta: {
    title: "dsh-mimo-skin",
    description: "Repaints the whole GUI as mimo.xiaomi.com: warm off-white paper, hairline black rules, a serif reading face and the orange accent, with a dark shell that is the same syntax flipped to black paper and white ink. The shell, the accent and the scrolling mark are edited on this plugin's own card."
  },
  panel: {
    noteReady: "These values live in the profile's configuration, so they survive a port change and a restart. A change applies and saves itself once you stop adjusting it, and it is validated before the write.",
    noteLoading: "Reading settings\u2026",
    noteUnavailable: "This engine offers no settings interface: changes here last for this page only, and a new port falls back to the profile's values.",
    noteStaleHost: "The engine is still running an older Host half of this plugin (this page is already the new version). The Host half loads once, when the engine process starts, so reloading the page cannot replace it. The engine itself has to restart \u2014 stop it and start it again (that interrupts a running conversation, and this page has to be reopened). Afterwards these changes are saved to the profile.",
    reset: "Restore defaults",
    stateSaved: "The saved values are the ones the page is using",
    stateDirty: "There are changes not yet written",
    stateClean: "Changes apply and save themselves",
    stateLocked: "This form is not writable",
    fieldTheme: "Shell",
    fieldThemeHint: "Follows the product's own light/dark setting by default.",
    fieldThemeAuto: "Follow the product (default)",
    fieldThemeLight: "Light: warm paper and black ink",
    fieldThemeDark: "Dark: black paper and white ink",
    fieldAccent: "Accent",
    fieldAccentHint: "The reference site's accent is #ff6700. Fine as a fill, 2.74:1 as link text.",
    fieldAccentLight: "as text on light",
    fieldAccentDark: "as text on dark",
    fieldPattern: "Scrolling mark",
    fieldPatternHint: "The faint line scrolling across the top of the page. Off leaves a cleaner page.",
    fieldPatternOpacity: "Mark ink",
    fieldPatternOpacityHint: "0\u20131, 0.05 by default \u2014 the reference site's own wash.",
    fieldPatternText: "Mark text",
    fieldPatternTextHint: "What the mark scrolls. DEEPSEEK HARNESS by default.",
    fieldPatternHeight: "Mark height",
    fieldPatternHeightHint: "The strip's height in px, 26 by default; the mark's face scales with it, and a hairline closes the strip at its foot.",
    errorTheme: "The shell is one of follow-the-product, light, or dark.",
    errorAccent: "The accent is written as #rgb or #rrggbb.",
    errorPatternOpacity: "The mark ink is between 0 and 1.",
    errorPatternText: "The mark text cannot be empty.",
    errorPatternHeight: "The mark height is between 8 and 200 px."
  }
};

// locale/zh.json
var zh_default = {
  meta: {
    title: "dsh-mimo-skin",
    description: "\u628A\u6574\u4E2A GUI \u6362\u6210 mimo.xiaomi.com \u7684\u6837\u5B50\uFF1A\u6696\u767D\u7EB8\u9762\u3001\u9ED1\u8272\u53D1\u4E1D\u5206\u9694\u7EBF\u3001\u886C\u7EBF\u9605\u8BFB\u6B63\u6587\u3001\u6A59\u8272\u70B9\u7F00\uFF0C\u6DF1\u8272\u662F\u540C\u4E00\u5957\u8BED\u6CD5\u6574\u4F53\u7FFB\u6210\u9ED1\u7EB8\u767D\u58A8\u3002\u914D\u8272\u5916\u58F3\u3001\u5F3A\u8C03\u8272\u4E0E\u9876\u90E8\u6EDA\u52A8\u5B57\u6807\u90FD\u5728\u672C\u63D2\u4EF6\u81EA\u5DF1\u7684\u5361\u7247\u91CC\u6539\u3002"
  },
  panel: {
    noteReady: "\u8FD9\u4E9B\u503C\u5199\u8FDB profile \u7684\u914D\u7F6E\u91CC\uFF1A\u6362\u7AEF\u53E3\u3001\u91CD\u542F\u90FD\u8FD8\u5728\u3002\u6539\u52A8\u5728\u4F60\u505C\u624B\u540E\u81EA\u52A8\u5E94\u7528\u5E76\u4FDD\u5B58\uFF0C\u5199\u5165\u524D\u4F1A\u5148\u6821\u9A8C\u3002",
    noteLoading: "\u6B63\u5728\u8BFB\u53D6\u8BBE\u7F6E\u2026",
    noteUnavailable: "\u8FD9\u53F0\u5F15\u64CE\u6CA1\u6709\u63D0\u4F9B\u8BBE\u7F6E\u63A5\u53E3\uFF1A\u8FD9\u91CC\u7684\u6539\u52A8\u53EA\u5BF9\u5F53\u524D\u9875\u9762\u6709\u6548\uFF0C\u6362\u7AEF\u53E3\u5C31\u4F1A\u56DE\u5230 profile \u91CC\u7684\u503C\u3002",
    noteStaleHost: "\u5F15\u64CE\u91CC\u8DD1\u7684\u8FD8\u662F\u672C\u63D2\u4EF6\u7684\u65E7\u5BBF\u4E3B\u534A\u8FB9\uFF08\u672C\u9875\u5DF2\u662F\u65B0\u7248\u672C\uFF09\uFF1A\u5BBF\u4E3B\u534A\u8FB9\u53EA\u5728\u5F15\u64CE\u8FDB\u7A0B\u542F\u52A8\u65F6\u52A0\u8F7D\u4E00\u6B21\uFF0C\u5237\u65B0\u9875\u9762\u6362\u4E0D\u6389\u5B83\u3002\u8981\u91CD\u542F\u7684\u662F\u5F15\u64CE\u672C\u8EAB\u2014\u2014\u505C\u6389\u518D\u91CD\u65B0\u8D77\u4E00\u6B21 DSH \u5F15\u64CE\uFF08\u4F1A\u6253\u65AD\u6B63\u5728\u8DD1\u7684\u5BF9\u8BDD\uFF0C\u672C\u9875\u8981\u91CD\u5F00\uFF09\uFF1B\u91CD\u542F\u540E\u8FD9\u91CC\u7684\u6539\u52A8\u5C31\u80FD\u5B58\u8FDB profile \u914D\u7F6E\u3002",
    reset: "\u6062\u590D\u9ED8\u8BA4",
    stateSaved: "\u5DF2\u4FDD\u5B58\u7684\u503C\u5C31\u662F\u9875\u9762\u6B63\u5728\u7528\u7684\u503C",
    stateDirty: "\u6709\u6539\u52A8\u8FD8\u6CA1\u5199\u8FDB\u914D\u7F6E",
    stateClean: "\u6539\u52A8\u4F1A\u81EA\u52A8\u5E94\u7528\u5E76\u4FDD\u5B58",
    stateLocked: "\u8FD9\u4EFD\u8868\u5355\u5F53\u524D\u4E0D\u53EF\u5199",
    fieldTheme: "\u914D\u8272\u5916\u58F3",
    fieldThemeHint: "\u9ED8\u8BA4\u8DDF\u968F\u4EA7\u54C1\u81EA\u5DF1\u7684\u660E\u6697\u8BBE\u7F6E\u3002",
    fieldThemeAuto: "\u8DDF\u968F\u4EA7\u54C1\uFF08\u9ED8\u8BA4\uFF09",
    fieldThemeLight: "\u6D45\u8272\uFF1A\u6696\u767D\u7EB8 + \u9ED1\u58A8",
    fieldThemeDark: "\u6DF1\u8272\uFF1A\u9ED1\u7EB8 + \u767D\u58A8",
    fieldAccent: "\u5F3A\u8C03\u8272",
    fieldAccentHint: "\u53C2\u7167\u7AD9\u7684\u5B98\u7F51\u6A59\u662F #ff6700\u3002\u5B83\u505A\u586B\u5145\u591F\uFF0C\u505A\u94FE\u63A5\u6587\u5B57\u53EA\u6709 2.74:1\u3002",
    fieldAccentLight: "\u6D45\u8272\u4E0B\u5F53\u6587\u5B57",
    fieldAccentDark: "\u6DF1\u8272\u4E0B\u5F53\u6587\u5B57",
    fieldPattern: "\u9876\u90E8\u6EDA\u52A8\u5B57\u6807",
    fieldPatternHint: "\u9875\u9762\u9876\u7AEF\u90A3\u6761\u6A2A\u5411\u6EDA\u52A8\u7684\u6DE1\u5B57\uFF0C\u5173\u6389\u9875\u9762\u66F4\u5E72\u51C0\u3002",
    fieldPatternOpacity: "\u5B57\u6807\u6D53\u5EA6",
    fieldPatternOpacityHint: "0\u20131\uFF0C\u9ED8\u8BA4 0.05\uFF0C\u4E5F\u5C31\u662F\u53C2\u7167\u7AD9\u81EA\u5DF1\u7684\u90A3\u5C42\u6DE1\u58A8\u3002",
    fieldPatternText: "\u5B57\u6807\u6587\u5B57",
    fieldPatternTextHint: "\u5B57\u6807\u6EDA\u52A8\u7684\u5185\u5BB9\uFF0C\u9ED8\u8BA4 DEEPSEEK HARNESS\u3002",
    fieldPatternHeight: "\u5B57\u6807\u9AD8\u5EA6",
    fieldPatternHeightHint: "\u9876\u90E8\u90A3\u6761\u5E26\u5B50\u7684\u9AD8\u5EA6\uFF0C\u5355\u4F4D px\uFF0C\u9ED8\u8BA4 26\uFF1B\u5B57\u6807\u5B57\u53F7\u8DDF\u7740\u5B83\u7B49\u6BD4\u7F29\u653E\uFF0C\u5E26\u5B50\u4E0B\u6CBF\u6709\u4E00\u6761\u7EC6\u6A2A\u7EBF\u3002",
    errorTheme: "\u914D\u8272\u5916\u58F3\u53EA\u80FD\u53D6\u300C\u8DDF\u968F\u4EA7\u54C1 / \u6D45\u8272 / \u6DF1\u8272\u300D\u4E09\u4E2A\u503C\u4E4B\u4E00\u3002",
    errorAccent: "\u5F3A\u8C03\u8272\u8981\u5199\u6210 #rgb \u6216 #rrggbb\u3002",
    errorPatternOpacity: "\u5B57\u6807\u6D53\u5EA6\u8981\u843D\u5728 0 \u5230 1 \u4E4B\u95F4\u3002",
    errorPatternText: "\u5B57\u6807\u6587\u5B57\u4E0D\u80FD\u4E3A\u7A7A\u3002",
    errorPatternHeight: "\u5B57\u6807\u9AD8\u5EA6\u8981\u843D\u5728 8 \u5230 200 px \u4E4B\u95F4\u3002"
  }
};

// src/client/copy.ts
function panelOf(dictionary) {
  const panel = typeof dictionary === "object" && dictionary !== null ? Reflect.get(dictionary, "panel") : void 0;
  return typeof panel === "object" && panel !== null ? panel : {};
}
function text(panel, english, key) {
  for (const source of [panel, english]) {
    const value = source[key];
    if (typeof value === "string" && value !== "") return value;
  }
  return key;
}
function dictionaryFor(language) {
  return language.toLowerCase().startsWith("zh") ? zh_default : en_default;
}
function panelCopy(language) {
  const tag = language ?? (typeof navigator === "undefined" ? "en" : navigator.language);
  const english = panelOf(en_default);
  const panel = panelOf(dictionaryFor(tag));
  const read = (key) => text(panel, english, key);
  return {
    noteReady: read("noteReady"),
    noteLoading: read("noteLoading"),
    noteUnavailable: read("noteUnavailable"),
    noteStaleHost: read("noteStaleHost"),
    reset: read("reset"),
    stateSaved: read("stateSaved"),
    stateDirty: read("stateDirty"),
    stateClean: read("stateClean"),
    stateLocked: read("stateLocked"),
    accentText: { light: read("fieldAccentLight"), dark: read("fieldAccentDark") },
    themeOptions: [
      { value: "auto", label: read("fieldThemeAuto") },
      { value: "light", label: read("fieldThemeLight") },
      { value: "dark", label: read("fieldThemeDark") }
    ],
    // Keyed by the one field list the card edits and the Host publishes: a knob
    // added there is a type error here until it has copy.
    field: {
      theme: { label: read("fieldTheme"), hint: read("fieldThemeHint") },
      accent: { label: read("fieldAccent"), hint: read("fieldAccentHint") },
      pattern: { label: read("fieldPattern"), hint: read("fieldPatternHint") },
      patternOpacity: { label: read("fieldPatternOpacity"), hint: read("fieldPatternOpacityHint") },
      patternText: { label: read("fieldPatternText"), hint: read("fieldPatternTextHint") },
      patternHeight: { label: read("fieldPatternHeight"), hint: read("fieldPatternHeightHint") }
    },
    error: {
      theme: read("errorTheme"),
      accent: read("errorAccent"),
      patternOpacity: read("errorPatternOpacity"),
      patternText: read("errorPatternText"),
      patternHeight: read("errorPatternHeight")
    }
  };
}

// src/client/components/controls.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function Field(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dshMimoField", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMimoFieldLabel", children: props.label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMimoFieldControl", children: props.children }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: props.error === void 0 ? "dshMimoFieldHint" : "dshMimoError", children: props.error ?? props.hint })
  ] });
}
function Toggle(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dshMimoToggle", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        type: "checkbox",
        checked: props.checked,
        disabled: props.disabled,
        onChange: (event) => {
          props.onChange(event.target.checked);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMimoFieldLabel", children: props.label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMimoFieldHint", children: props.hint })
    ] })
  ] });
}
function AccentTextPair(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshMimoPreviewPair", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMimoSwatchSmall", style: { background: props.entry.value } }),
    props.label,
    " ",
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: props.entry.value }),
    ` (${props.entry.ratio})`
  ] });
}

// src/client/components/Panel.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function useFormView(form) {
  const [state, setState] = (0, import_react.useState)(() => form.getSnapshot());
  (0, import_react.useEffect)(() => form.subscribe(() => {
    setState(form.getSnapshot());
  }), [form]);
  return state;
}
function MimoSkinPanel(props) {
  const copy = panelCopy();
  const { form, hostPublished: hostPublished2 } = props;
  const state = useFormView(form);
  const committed = { ...SECTION_DEFAULTS, ...state.value ?? {} };
  const committedKey = JSON.stringify(committed);
  const [draft, setDraft] = (0, import_react.useState)(committed);
  (0, import_react.useEffect)(() => {
    setDraft(committed);
  }, [committedKey]);
  const writable = state.status === "ready" && state.writable;
  const invalid = invalidFields(draft);
  const dirty = JSON.stringify(draft) !== committedKey;
  const stillAdjusting = CONTINUOUS_FIELDS.some((field) => draft[field] !== committed[field]);
  const delay = stillAdjusting ? SAVE_DEBOUNCE_ADJUST : SAVE_DEBOUNCE_PICK;
  const edit = (field, next) => {
    setDraft((current) => ({ ...current, [field]: next }));
  };
  (0, import_react.useEffect)(() => {
    if (!writable || !dirty || invalid.length > 0) return;
    const timer = setTimeout(() => {
      void form.mutate(sectionOps(draft));
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [draft, dirty, delay, writable, invalid.length, form]);
  const note = state.status === "unavailable" ? hostPublished2 ? copy.noteUnavailable : copy.noteStaleHost : state.status === "loading" ? copy.noteLoading : copy.noteReady;
  const status = !writable ? copy.stateLocked : invalid.length > 0 ? copy.error[invalid[0]] : dirty ? copy.stateDirty : copy.stateClean;
  const errorOf = (field) => invalid.includes(field) ? copy.error[field] : void 0;
  const preview = accentPreview(draft.accent);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshMimoPanel", "data-plugin-config": "dsh-mimo-skin", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dshMimoNote", children: note }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshMimoGrid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: copy.field.theme.label, hint: copy.field.theme.hint, error: errorOf("theme"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "select",
        {
          value: draft.theme,
          disabled: !writable,
          onChange: (event) => {
            edit("theme", event.target.value);
          },
          children: copy.themeOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: option.value, children: option.label }, option.value))
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Field, { label: copy.field.accent.label, hint: copy.field.accent.hint, error: errorOf("accent"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshMimoSwatch", style: { background: draft.accent } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            type: "text",
            spellCheck: false,
            value: draft.accent,
            disabled: !writable,
            onChange: (event) => {
              edit("accent", event.target.value);
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: copy.field.patternText.label, hint: copy.field.patternText.hint, error: errorOf("patternText"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "text",
          spellCheck: false,
          value: draft.patternText,
          disabled: !writable,
          onChange: (event) => {
            edit("patternText", event.target.value);
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: copy.field.patternHeight.label, hint: copy.field.patternHeight.hint, error: errorOf("patternHeight"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "number",
          min: PATTERN_HEIGHT_MIN,
          max: PATTERN_HEIGHT_MAX,
          step: 1,
          value: draft.patternHeight,
          disabled: !writable,
          onChange: (event) => {
            edit("patternHeight", Number(event.target.value));
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: copy.field.patternOpacity.label, hint: copy.field.patternOpacity.hint, error: errorOf("patternOpacity"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "number",
          min: 0,
          max: 1,
          step: 0.01,
          value: draft.patternOpacity,
          disabled: !writable,
          onChange: (event) => {
            edit("patternOpacity", Number(event.target.value));
          }
        }
      ) })
    ] }),
    preview === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "dshMimoPreview", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AccentTextPair, { label: copy.accentText.light, entry: preview.light }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AccentTextPair, { label: copy.accentText.dark, entry: preview.dark })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshMimoToggles", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      Toggle,
      {
        label: copy.field.pattern.label,
        hint: copy.field.pattern.hint,
        checked: draft.pattern,
        disabled: !writable,
        onChange: (next) => {
          edit("pattern", next);
        }
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshMimoFoot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          disabled: !writable || committedKey === JSON.stringify(SECTION_DEFAULTS),
          onClick: () => {
            setDraft(SECTION_DEFAULTS);
          },
          children: copy.reset
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshMimoStatus", children: status })
    ] })
  ] });
}

// src/constants/dom.ts
var STYLE_ID = "dsh-mimo-styles";
var SKIN_ATTRIBUTE = "data-dsh-mimo";
var DARK_ATTRIBUTE = "data-dsh-mimo-dark";
var THEME_DARK_ATTRIBUTE = "data-ds-dark-theme";
var MARQUEE_CLASS = "dsh-mimo-marquee";
var MARQUEE_TRACK_CLASS = "dsh-mimo-marquee-track";
var PANEL_STYLE_ATTRIBUTE = "data-dsh-mimo-panel-styles";

// src/client/marquee.ts
var COPY_CHARACTERS = 140;
var MIN_COPIES = 2;
function marqueeContent(text2) {
  const unit = `${text2.trim()} `;
  const copies = Math.max(MIN_COPIES, Math.ceil(COPY_CHARACTERS / unit.length));
  return unit.repeat(copies * 2);
}
function createMarquee(doc = document, text2 = "") {
  let root;
  let track;
  let observer;
  function build() {
    const element = doc.createElement("div");
    element.className = MARQUEE_CLASS;
    element.setAttribute("aria-hidden", "true");
    track = doc.createElement("span");
    track.className = MARQUEE_TRACK_CLASS;
    track.textContent = marqueeContent(text2);
    element.appendChild(track);
    return element;
  }
  function sync() {
    const body = doc.body;
    if (body === null) return;
    if (root === void 0) {
      root = build();
      body.appendChild(root);
      observer = new MutationObserver(() => {
        sync();
      });
      observer.observe(body, { childList: true });
    } else if (root.parentElement !== body) {
      body.appendChild(root);
    }
  }
  sync();
  return {
    ensure: sync,
    setText(next) {
      if (track !== void 0) track.textContent = marqueeContent(next);
    },
    destroy() {
      observer?.disconnect();
      observer = void 0;
      root?.remove();
      root = void 0;
      track = void 0;
    }
  };
}

// src/client/published.ts
function readSettings(scope = globalThis) {
  const raw = scope[DEFAULT_GLOBAL_NAME];
  return resolveSettings(isRecord(raw) ? raw : void 0);
}
function hostPublished(scope = globalThis) {
  const raw = scope[DEFAULT_GLOBAL_NAME];
  if (!isRecord(raw)) return false;
  return SECTION_FIELDS.some((key) => key in raw);
}

// src/constants/palette.ts
var SERIF_STACK = "'PT Serif', 'Noto Serif SC', 'Songti SC', Georgia, 'Times New Roman', serif";
var SANS_STACK = "'MiSans', 'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif";
var MONO_STACK = "'SF Mono', 'Fira Code', 'JetBrains Mono', Consolas, 'Liberation Mono', Menlo, monospace";
var MARK_FACE_RATIO = 0.58;
var PALETTE_VARIABLES = [
  "--dsh-mimo-page",
  "--dsh-mimo-raised",
  "--dsh-mimo-ink",
  "--dsh-mimo-muted",
  "--dsh-mimo-faint",
  "--dsh-mimo-rule",
  "--dsh-mimo-rule-soft",
  "--dsh-mimo-track",
  "--dsh-mimo-accent",
  "--dsh-mimo-accent-text",
  "--dsh-mimo-accent-wash",
  "--dsh-mimo-hover",
  "--dsh-mimo-active",
  "--dsh-mimo-shadow",
  "--dsh-mimo-marquee-height",
  "--dsh-mimo-pattern-opacity"
];

// src/client/skin.ts
function createSkin(input, doc = document) {
  let observer;
  function documentIsDark() {
    return doc.body?.hasAttribute(THEME_DARK_ATTRIBUTE) === true;
  }
  function setFlag(body, name2, wanted) {
    if (body.hasAttribute(name2) === wanted) return;
    if (wanted) body.setAttribute(name2, "");
    else body.removeAttribute(name2);
  }
  function paint() {
    const body = doc.body;
    if (body === null) return;
    const shell = shellFor(input.theme, documentIsDark());
    const variables = skinVariables(input, shell);
    for (const [name2, value] of Object.entries(variables)) body.style.setProperty(name2, value);
    setFlag(body, SKIN_ATTRIBUTE, true);
    setFlag(body, DARK_ATTRIBUTE, shell.id === "dark");
  }
  paint();
  observer = new MutationObserver(() => {
    paint();
  });
  if (doc.body !== null) {
    observer.observe(doc.body, { attributes: true, attributeFilter: [THEME_DARK_ATTRIBUTE] });
  }
  return {
    apply: paint,
    destroy() {
      observer?.disconnect();
      observer = void 0;
      const body = doc.body;
      if (body === null) return;
      body.removeAttribute(SKIN_ATTRIBUTE);
      body.removeAttribute(DARK_ATTRIBUTE);
      for (const name2 of PALETTE_VARIABLES) body.style.removeProperty(name2);
    }
  };
}

// src/client/styles/page.ts
function installPageStyles(doc = document) {
  if (doc.getElementById(STYLE_ID) !== null) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = PAGE_CSS;
  doc.head.appendChild(style);
}
var PAGE_CSS = `
/* ---------- the band ---------- */

.${MARQUEE_CLASS} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* \`border-box\` so the hairline at the foot is inside the strip the page is
     pushed down by, and the two edges stay one value apart. */
  box-sizing: border-box;
  height: var(--dsh-mimo-marquee-height, ${DEFAULT_PATTERN_HEIGHT}px);
  border-bottom: 0.5px solid var(--dsh-mimo-rule);
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  display: flex;
  align-items: center;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 400ms ease;
}

body[${SKIN_ATTRIBUTE}] .${MARQUEE_CLASS} {
  opacity: var(--dsh-mimo-pattern-opacity, 0);
}

/* The one line the animation moves. Its content is the unit twice over, so
   \`translateX(-50%)\` travels exactly one copy and the loop has no seam. It must
   not be allowed to shrink: a flex item would, and the line would compress to
   the window instead of overrunning it. */
.${MARQUEE_CLASS} > .${MARQUEE_TRACK_CLASS} {
  flex: none;
  font-family: ${SANS_STACK};
  /* The strip's height is a setting, so the face follows it: a fixed size would
     crop the glyphs the moment the card moved the strip off its default. */
  font-size: calc(var(--dsh-mimo-marquee-height, ${DEFAULT_PATTERN_HEIGHT}px) * ${MARK_FACE_RATIO});
  font-weight: 700;
  letter-spacing: 0.3em;
  line-height: 1;
  color: var(--dsh-mimo-ink);
  animation: dsh-mimo-drift 70s linear infinite;
}

@keyframes dsh-mimo-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .${MARQUEE_CLASS} > .${MARQUEE_TRACK_CLASS} { animation: none; }
  .${MARQUEE_CLASS} { transition: none; }
}

/* The band owns a row of its own at the top, so the page moves down by exactly
   its height. \`border-box\` keeps the padding inside the \`height: 100%\` the
   shell's base sheet gives \`body\`, and \`#root\`'s own \`height: 100%\` therefore
   resolves to the space that is left. */
body[${SKIN_ATTRIBUTE}] {
  box-sizing: border-box;
  padding-top: var(--dsh-mimo-marquee-height, 0px);
}

/* The desktop shell subtracts every body child but \`#root\` from the window's
   drag region, and the band is now the element at the top of the window. */
body[${SKIN_ATTRIBUTE}] > .${MARQUEE_CLASS} {
  -webkit-app-region: drag;
}

/* The shell paints its own background, so it has to be lifted over the band. */
body[${SKIN_ATTRIBUTE}] > #root {
  position: relative;
  z-index: 1;
}

/* ---------- shell-independent remap ---------- */

body[${SKIN_ATTRIBUTE}] {
  /* The site's content card is a 3px square with a hairline. DSH owns the
     corner radii as tokens, so the shell reads as MiMo geometry everywhere. */
  --dsw-radius-xs: 2px !important;
  --dsw-radius-sm: 3px !important;
  --dsw-radius-md: 3px !important;
  --dsw-radius-lg: 3px !important;
  --dsw-radius-xl: 3px !important;
  --dsw-radius-panel: 3px !important;

  /* See the module doc: one family variable re-faces every composed text
     style; code keeps its own stack. */
  --dsw-font-family: ${SERIF_STACK} !important;
  --dsw-font-family-brand: ${SANS_STACK} !important;
  --ds-font-family-code: ${MONO_STACK} !important;

  /* Scrollbars track the shell's own resting ink (#999 on the light page). */
  --dsw-alias-scrollbar-bg-l1: var(--dsh-mimo-faint) !important;
  --dsw-alias-scrollbar-bg-l2: var(--dsh-mimo-faint) !important;
  --dsw-alias-scrollbar-hover-l1: var(--dsh-mimo-ink) !important;
  --dsw-alias-scrollbar-hover-l2: var(--dsh-mimo-ink) !important;
}

/* ---------- light shell ---------- */

body[${SKIN_ATTRIBUTE}] {
  /* Surfaces: the reference site's own paper/parchment pair, both opaque so
     the band never softens body text. */
  --dsw-alias-bg-base: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-1: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-2: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-layer-3: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-overlay: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-module-platform: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-multi-select: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-skeleton: var(--dsh-mimo-hover) !important;
  --dsw-alias-bg-document-preview: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-fill: var(--dsh-mimo-page) !important;
  --dsw-specific-input-major: var(--dsh-mimo-page) !important;
  --dsw-specific-bubble: var(--dsh-mimo-raised) !important;
  --dsw-specific-selector: var(--dsh-mimo-raised) !important;
  --dsw-specific-tip: var(--dsh-mimo-page) !important;
  --dsw-specific-login-input: var(--dsh-mimo-page) !important;
  --dsw-menu-surface-fill: var(--dsh-mimo-raised) !important;

  /* Text: MiMo's own three-step ink ramp, nothing invented. */
  --dsw-alias-label-primary: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-primary-dimmed: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-secondary: var(--dsh-mimo-muted) !important;
  --dsw-alias-label-tertiary: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-caption: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-dimmed: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-document-preview: var(--dsh-mimo-muted) !important;
  --dsw-alias-menu-icon: var(--dsh-mimo-muted) !important;

  /* Rules: the reference's section rules are 1px solid #000 and its card rules
     #00000012. DSH draws its own hairlines off these four tokens, so the
     sidebar edge, header edge and menu edges all become MiMo rules. */
  --dsw-alias-border-l1: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2-darkmode-thin: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l3: var(--dsh-mimo-rule) !important;
  --dsw-alias-border-l4: var(--dsh-mimo-rule) !important;
  --dsw-elevation-stroke-color: var(--dsh-mimo-rule-soft) !important;

  /* The accent is the configured fill, used the way the site uses it: links,
     the brand mark, informational fills, business/selected states. Primary
     fills are NOT the accent \u2014 the site's own primary button is black on the
     light page and white on the dark one, so the accent stays an accent. */
  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--dsh-mimo-accent) !important;
  --dsw-alias-link: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-brand-text: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-button-info-fill: var(--dsh-mimo-accent) !important;
  --dsw-alias-button-info-hover: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-primary: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-tertiary: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active-accent: var(--dsh-mimo-accent-text) !important;

  /* Interaction: hover is an ink wash, the way a MiMo row answers the pointer. */
  --dsw-alias-interactive-bg-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-interactive-bg-active: var(--dsh-mimo-active) !important;
  --dsw-alias-interactive-bg-hover-solid: var(--dsh-mimo-raised) !important;
  --dsw-alias-interactive-bg-hover-accent: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-nav-item-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-elevated-fill: var(--dsh-mimo-page) !important;
  --dsw-alias-button-floating-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-floating-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-ghost-active-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-ghost-active-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-primary-dimmed: var(--dsh-mimo-hover) !important;

  /* Code sits on the nested fill; inline code on the mono wash. */
  --dsw-alias-markdown-code-block: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-block-banner: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-inline-code: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-citation: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-selected: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-unselected: var(--dsh-mimo-page) !important;
  --dsw-alias-markdown-placeholder: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-tag: var(--dsh-mimo-hover) !important;

  /* Depth: MiMo separates surfaces with a rule and a very light shadow. */
  --dsw-shadow-lv1: 0 2px 4px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv1-blur: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv2: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv3: 0 12px 32px 0 var(--dsh-mimo-shadow) !important;
}

/* ---------- dark shell ----------
   Same declarations, black paper and white ink. MUST stay after the light
   block: both selectors match a body carrying the skin attribute, so source
   order is what makes the dark values win when the applier sets the dark flag. */

body[${SKIN_ATTRIBUTE}][data-dsh-mimo-dark] {
  color-scheme: dark;

  --dsw-alias-bg-base: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-1: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-layer-2: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-layer-3: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-overlay: var(--dsh-mimo-page) !important;
  --dsw-alias-bg-module-platform: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-multi-select: var(--dsh-mimo-raised) !important;
  --dsw-alias-bg-skeleton: var(--dsh-mimo-hover) !important;
  --dsw-alias-bg-document-preview: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-fill: var(--dsh-mimo-page) !important;
  --dsw-specific-input-major: var(--dsh-mimo-page) !important;
  --dsw-specific-bubble: var(--dsh-mimo-raised) !important;
  --dsw-specific-selector: var(--dsh-mimo-raised) !important;
  --dsw-specific-tip: var(--dsh-mimo-page) !important;
  --dsw-specific-login-input: var(--dsh-mimo-page) !important;
  --dsw-menu-surface-fill: var(--dsh-mimo-raised) !important;

  --dsw-alias-label-primary: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-primary-dimmed: var(--dsh-mimo-ink) !important;
  --dsw-alias-label-secondary: var(--dsh-mimo-muted) !important;
  --dsw-alias-label-tertiary: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-caption: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-dimmed: var(--dsh-mimo-faint) !important;
  --dsw-alias-label-document-preview: var(--dsh-mimo-muted) !important;
  --dsw-alias-menu-icon: var(--dsh-mimo-muted) !important;

  --dsw-alias-border-l1: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l2-darkmode-thin: var(--dsh-mimo-rule-soft) !important;
  --dsw-alias-border-l3: var(--dsh-mimo-rule) !important;
  --dsw-alias-border-l4: var(--dsh-mimo-rule) !important;
  --dsw-elevation-stroke-color: var(--dsh-mimo-rule-soft) !important;

  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--dsh-mimo-accent) !important;
  --dsw-alias-link: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-brand-text: var(--dsh-mimo-accent-text) !important;
  --dsw-alias-button-info-fill: var(--dsh-mimo-accent) !important;
  --dsw-alias-button-info-hover: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-primary: var(--dsh-mimo-accent) !important;
  --dsw-alias-state-business-tertiary: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active-accent: var(--dsh-mimo-accent-text) !important;

  --dsw-alias-interactive-bg-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-interactive-bg-active: var(--dsh-mimo-active) !important;
  --dsw-alias-interactive-bg-hover-solid: var(--dsh-mimo-raised) !important;
  --dsw-alias-interactive-bg-hover-accent: var(--dsh-mimo-accent-wash) !important;
  --dsw-specific-sidebar-nav-item-active: var(--dsh-mimo-raised) !important;
  --dsw-specific-sidebar-nav-item-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-elevated-fill: var(--dsh-mimo-page) !important;
  --dsw-alias-button-floating-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-floating-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-ghost-active-fill: var(--dsh-mimo-raised) !important;
  --dsw-alias-button-ghost-active-hover: var(--dsh-mimo-hover) !important;
  --dsw-alias-button-primary-dimmed: var(--dsh-mimo-hover) !important;

  --dsw-alias-markdown-code-block: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-block-banner: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-inline-code: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-citation: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-selected: var(--dsh-mimo-raised) !important;
  --dsw-alias-markdown-code-segment-unselected: var(--dsh-mimo-page) !important;
  --dsw-alias-markdown-placeholder: var(--dsh-mimo-hover) !important;
  --dsw-alias-markdown-tag: var(--dsh-mimo-hover) !important;

  --dsw-shadow-lv1: 0 2px 4px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv1-blur: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv2: 0 4px 12px 0 var(--dsh-mimo-shadow) !important;
  --dsw-shadow-lv3: 0 12px 32px 0 var(--dsh-mimo-shadow) !important;
}

/* Form controls do not inherit a font from the document, so the reading face
   has to be named on them explicitly. */
body[${SKIN_ATTRIBUTE}] input,
body[${SKIN_ATTRIBUTE}] textarea,
body[${SKIN_ATTRIBUTE}] select,
body[${SKIN_ATTRIBUTE}] button {
  font-family: inherit;
}

/* The product's one documented composer hook: an opaque card with a hairline,
   which is the reference site's content card. */
body[${SKIN_ATTRIBUTE}] [data-composer-card] {
  background: var(--dsh-mimo-page) !important;
  border: 1px solid var(--dsh-mimo-rule-soft) !important;
}

/* A switch paints its off track with the same token this skin spends on
   hairlines, so an untouched off track would come out the near-black of the on
   track. The state is repainted from the wash family. The role and aria-checked
   attributes are the control's own contract \u2014 the state it already publishes to
   assistive technology \u2014 not a generated class name. */
body[${SKIN_ATTRIBUTE}] [role='switch'][aria-checked='false'] {
  background: var(--dsh-mimo-track) !important;
}

/* A menu is the one surface that should read as floating paper. */
body[${SKIN_ATTRIBUTE}] [data-menu-material] {
  border: 1px solid var(--dsh-mimo-rule-soft) !important;
}

body[${SKIN_ATTRIBUTE}] :focus-visible {
  outline: 1px solid var(--dsh-mimo-accent);
  outline-offset: 1px;
}
`;

// src/client/styles/panel.ts
var PANEL_CSS = `
.dshMimoPanel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #101114);
}

.dshMimoNote {
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
  color: var(--dsw-alias-label-secondary, #4b5058);
  font-size: 12px;
  line-height: 18px;
}

.dshMimoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 14px 20px;
}

.dshMimoField {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 3px 10px;
  align-items: center;
}

.dshMimoFieldLabel {
  font-weight: 500;
}

.dshMimoFieldControl {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dshMimoFieldHint {
  grid-column: 1 / -1;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}

.dshMimoError {
  grid-column: 1 / -1;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-state-error-primary, #d92d20);
}

.dshMimoField select,
.dshMimoField input {
  width: 100%;
  min-width: 128px;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
}

.dshMimoSwatch {
  flex: none;
  width: 20px;
  height: 20px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 4px;
}

.dshMimoSwatchSmall {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 2px;
}

.dshMimoPreview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin: 0;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}

.dshMimoPreviewPair code {
  font-family: var(--ds-font-family-code, monospace);
  color: var(--dsw-alias-label-secondary, #4b5058);
}

.dshMimoToggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dshMimoToggle {
  display: flex;
  gap: 9px;
  align-items: flex-start;
}

.dshMimoToggle > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dshMimoToggle input[type="checkbox"] {
  margin: 2px 0 0;
}

.dshMimoFoot {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dshMimoFoot button {
  padding: 5px 12px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.dshMimoFoot button:disabled {
  opacity: 0.55;
  cursor: default;
}

.dshMimoStatus {
  font-size: 11.5px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}
`;
function installPanelStyles(doc) {
  const element = doc.createElement("style");
  element.setAttribute(PANEL_STYLE_ATTRIBUTE, "");
  element.textContent = PANEL_CSS;
  doc.head.append(element);
  return () => {
    element.remove();
  };
}

// src/client/index.ts
var name = PLUGIN_ID;
var inject = [];
function apply(ctx, doc = document) {
  const settings = readSettings();
  if (!settings.enabled) return;
  installPageStyles(doc);
  const input = {
    theme: settings.theme,
    accent: settings.accent,
    pattern: settings.pattern,
    patternOpacity: settings.patternOpacity,
    patternHeight: settings.patternHeight
  };
  const skin = createSkin(input, doc);
  let marquee = settings.pattern ? createMarquee(doc, settings.patternText) : void 0;
  const applySection = (section) => {
    Object.assign(input, section);
    skin.apply();
    if (typeof section.patternText === "string") marquee?.setText(section.patternText);
    if (input.pattern && marquee === void 0) marquee = createMarquee(doc, settings.patternText);
    else if (!input.pattern && marquee !== void 0) {
      marquee.destroy();
      marquee = void 0;
    }
  };
  ctx.effect(() => () => {
    marquee?.destroy();
    skin.destroy();
  }, "dsh-mimo-skin: document skin");
  const knobsPublished = hostPublished();
  ctx.effect(() => installPanelStyles(doc), "dsh-mimo-skin: the card stylesheet");
  ctx.inject(["configForms", "slots"], (child) => {
    const forms = child.get("configForms");
    if (forms === void 0) return;
    const form = forms.get(SETTINGS_NAMESPACE);
    child.effect(() => {
      const sync = () => {
        applySection(sectionOf(form.getSnapshot().value));
      };
      const unsubscribe = form.subscribe(sync);
      sync();
      return unsubscribe;
    }, "dsh-mimo-skin: apply the saved card settings");
    const slots = child.get("slots");
    if (slots === void 0) return;
    child.effect(() => {
      slots.inject("plugins.bundle.config", () => {
        slots.register(
          {
            name: "plugins.bundle.config",
            // Keyed by the bundle's package name, which is also the namespace.
            key: SETTINGS_NAMESPACE,
            inject: () => ({ form, hostPublished: knobsPublished })
          },
          MimoSkinPanel
        );
      });
    }, "dsh-mimo-skin: the knobs on the plugin card");
  });
}

		return module.exports;
	}
});
