# dsh-mimo-skin

**中文** | [English](README.en.md)

![version](https://img.shields.io/badge/version-0.1.1-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![DSH](https://img.shields.io/badge/DSH-%3E%3D0.1.5--rc.2-8b5cf6)
![tests](https://img.shields.io/badge/tests-101%20passing-brightgreen)
![node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933)

> 给 DSH Web GUI 换一套外观的**纯皮肤插件** —— 暖白纸面、黑色发丝分隔线、衬线阅读正文、橙色点缀。

[安装](#安装) · [首次使用](#首次使用) · [English](README.en.md)

<!-- 图片走仓库的绝对地址：npm 页面渲染 README 时解析不到相对路径，写成 docs/… 会裂成图框。 -->
![前后对比](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-compare.png)

上图是同一台引擎、同一个页面：**上**是产品自己的外壳，**下**是套上皮肤之后。两张都是从真引擎、
真浏览器上截的，不是示意图。

## 这是什么

它把 DSH Web GUI 换成 [`mimo.xiaomi.com`](https://mimo.xiaomi.com/) 的样子。**不新增任何业务功能，只改外观**：
侧栏、消息栏、输入卡、菜单、代码块一起换，深浅两套外壳都能用。给想让 DSH 变成暖白纸 +
黑发丝 + 衬线正文这套编辑风的人用。

### 实际表现

| 项 | 值 |
| --- | --- |
| 产物体积 | `lib/index.js` 42.1 KB / `lib/client.js` 47.5 KB |
| 改写的产品 token | 74 个 `--dsw-*` alias |
| 皮肤自己的变量 | 16 个 `--dsh-mimo-*` |
| 打包资源 / 运行时依赖 | **0**（不带字体文件、不带图片；只有引擎自己的 `@deepseek-ai/cordis` 保持外部） |
| 单测 | 101 项，9 个文件，约 0.3 s 跑完 |

## 主要功能

### 整页换肤

只经产品有文档的 `--dsw-*` alias token 换色，不改页面结构。

| 部位 | 换成什么 | 来自参考站的什么 |
| --- | --- | --- |
| 页面底色 | `#faf7f5` 暖白 | `:root{--bg-primary}` |
| 抬升面（气泡、菜单、输入卡） | `#f5f0eb` 嵌套面 | `--bg-secondary` |
| 正文 | `#1a1a1a` 墨色 | `--text-primary` |
| 次级 / 三级文字 | `#555` / `#888` | `--text-secondary` / `--text-tertiary` |
| 分隔线 | 纯黑发丝 | 分区行 `border-bottom:1px solid #000`、卡片 `#00000012` |
| 强调色 | 默认 `#ff6700`，可改 | `--accent` |
| 三套字体 | 正文 PT Serif 系衬线 / 控件 MiSans 系无衬线 / 代码 SF Mono 系等宽 | `--font-serif`、`--font-title`、`--font-mono` |
| 圆角 | 3px | 内容卡 `border-radius:3px` |
| 投影 | 参考站自己那套极浅投影 | `.grid-btn`、内容卡 |

### 浅色 / 深色两套外壳

深色**是同一套规则整体翻转**，不是「把背景调暗」：

| | 浅色 | 深色 |
| --- | --- | --- |
| 纸面 | `#faf7f5` 米白（官网 `--bg-primary`） | `#000000` 纯黑（官网深色版 `--rp-home-bg`） |
| 嵌套面 | `#f5f0eb` | `#111111` |
| 墨色 | `#1a1a1a` | `#ffffff` |
| 次级 / 三级文字 | `#555` / `#888` | `#b3b3b3` / `#8a8a8a` |
| 分隔线 | `#000` 黑发丝 | `#ffffff` 白发丝 |
| 悬浮 / 按下 | 黑色 4% / 8% 洗 | 白色 7% / 12% 洗 |
| 投影 | 黑 8% | 黑 50% |

![深色](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-dark.png)

**配色外壳**默认 `auto`：跟随 DSH 自己的深浅色设置 —— 你在产品里切明暗，皮肤跟着重画。

### 强调色：填充与文字分开算

参考站的 `#ff6700` 在自己那张 `#faf7f5` 纸上只有 **2.74:1** 对比度：做填充色块够了，做链接文字
低于 AA 的 4.5:1。所以皮肤只让你**填一个颜色**（填充用），**当文字渲染的那一档是算出来的** ——
浅色下往黑里走、深色下往白里走，直到对比度达标。默认 `#ff6700` 因此得到浅色 `#bf4d00`（4.60:1）、
深色 `#ff6700`（7.19:1）。换别的颜色这两档会重算，AA 下限不会掉。

![插件卡片](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-card.png)

卡片里会把两个算出来的值直接显示给你看（含对比度）。

### 顶部滚动字标

![上方字标](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-light.png)

一条固定在整个窗口顶端的横条，里面是一行横向滚动的淡字：

- **滚动**：内容是该文字的**两遍**，动画 `translateX(0 → -50%)` 线性无限循环，接缝处看不见跳。
- **位置**：横向铺满，`body` 被它自身高度（默认 52px）顶下去，所以它有自己的**一行**，不压侧栏与标题行。
- **可调**：浓度 0–1（默认 `0.05`，参考站自己的值）、文字可改（默认 `DEEPSEEK HARNESS`）、
  可以整个关掉 —— 关掉时那一行也收回去，不留空白。
- **不添乱**：不挡鼠标、不可选中、`aria-hidden`，被挪走或移除会自动挂回；在 macOS 桌面壳里
  自己声明 `-webkit-app-region: drag`，否则窗口顶端会被产品的 no-drag 规则挖掉一块，拖不动。

### 故意不动的 token

- **状态色 / toast / tooltip / diff 底色 / 气泡高亮**：DSH 自己在 `body[data-ds-dark-theme]` 上
  已经切了一套深色值；钉死它们等于把为白纸调的琥珀色搬去黑纸，所以皮肤一个都不声明。
- **主按钮**：参考站的主按钮浅色页是**黑**、深色页是**白**，橙色只做点缀 —— 所以
  `--dsw-alias-button-primary-fill` 不动，只把**信息填充**（输入框右下那颗发送键）涂成强调色。
- **关闭态开关**：产品把 `--dsw-alias-border-l3` 当关闭态**底色**用（不是描边），而它在皮肤里是
  纯黑发丝；皮肤改用 `--dsh-mimo-track` 重画关闭态，打开态保持产品自己的品牌填充。

![插件页](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-plugins.png)

上图里 8 个官方插件的开关关闭态是浅灰洗，`dsh-mimo-skin` 自己的打开态是产品品牌填充。

## 安装

### 环境要求

| 项 | 要求 |
| --- | --- |
| DSH | `dsh-v0.1.5-rc.2` 起，向后兼容 |
| Node.js | `^22.19.0 \|\| >=24.0.0`（只有本机自己构建时才需要） |
| 系统 | 跟随 DSH Web GUI：macOS / Windows / Linux 都行 |

### 方式一：命令

```bash
# 从 npm 装
dsh plugin --profile web add dsh-mimo-skin

# 或直接从 GitHub 装：仓库里带着构建好的 lib/，装的人不需要本机再构建
dsh plugin --profile web add https://github.com/RonnyJung2021/dsh-mimo-skin
```

> **GitHub 直装靠的是仓库里那份 `lib/`，别改成「装完再构建」。** pnpm 默认拒绝执行 git 依赖的
> 构建脚本（`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`），除非本机在 profile 的
> `pnpm-workspace.yaml` 里把包加进 `onlyBuiltDependencies`，而那个键要一字不差地抄 pnpm 打印出来
> 的形式。所以构建产物入库、构建挂在 `prepack` 上，git 安装既不用构建也不用放行。

### 方式二：插件页

侧栏 **插件** → **Add plugin** → 填 `dsh-mimo-skin`（或上面那个 GitHub 地址）→ **Install** →
装完点 **Enable now**。

### 本机开发时从工作目录装

```bash
node scripts/install-profile.mjs --home /path/to/home              # 装
node scripts/install-profile.mjs --home /path/to/home --dry-run    # 只打印将改动什么
node scripts/install-profile.mjs --home /path/to/home --uninstall  # 卸
```

它写三样东西（都是「插件」页自己会写的那三样）：profile `package.json` 的 `link:` 依赖与
`dsh.profile.bundles` 里的包名、`node_modules/<包名>` 软链、`pnpm-lock.yaml` 的 importer 条目；
顺带清掉老的 `file://` 式 `insert` 行（否则插件会被加载两次），每个被改的文件先备份成
`*.bak-dsh-mimo-skin`。

### 首次使用

1. 按上面任一种方式装上并**启用**。
2. 打开 GUI，侧栏 **插件 → 已安装 → dsh-mimo-skin**，卡片下面是这个插件**自己的设置页**。
3. 改外观项，点 **保存**；页面立刻重画。

### 卸载

```bash
dsh plugin --profile web remove dsh-mimo-skin
```

或在插件页对这个包点卸载（会先确认）。卸载后样式表、顶部字标与注入的调色板一起消失，页面回到
产品自带外壳，**不留残余**。

## 配置

五个外观项加一个总开关，全部可选，省略即用默认值，非法值逐字段回退 —— 皮肤坏掉不该拖住 GUI 启动。

| 项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `theme` | `light` \| `dark` \| `auto` | `auto` | 配色外壳；`auto` 跟随产品自己的深浅色设置 |
| `accent` | `#rgb` / `#rrggbb` | `#ff6700` | 强调色（填充用）；当文字渲染的那一档自动算 |
| `pattern` | boolean | `true` | 是否画顶部那条横向滚动的字标 |
| `patternOpacity` | number 0–1 | `0.05` | 字标墨色浓度；参考站自己的值就是 0.05 |
| `patternText` | string | `DEEPSEEK HARNESS` | 字标滚动的内容，不能为空 |
| `enabled` | boolean | `true` | 皮肤是否渲染 |

写在 profile 的 patch 里（`profiles/web/cordis.patch.yml`）：

```yaml
- insert:
    - id: dsh-mimo-skin
      name: dsh-mimo-skin
      config:
        theme: auto                 # light | dark | auto
        accent: '#ff6700'           # 任意 #rrggbb；当文字的那一档自动算
        pattern: true               # 是否画顶部那条滚动字标
        patternOpacity: 0.05        # 字标墨色浓度 0…1
        patternText: DEEPSEEK HARNESS
        enabled: true
```

也可以不改 YAML，直接在上面那张卡片里改：

- **改完点「保存」才生效**（不是改一项立刻重画），另有一颗**「恢复默认」**把所有外观项写回默认。
- **保存前先校验**：颜色值要合法、浓度要落在 0–1、字标文字不能为空。不合法时「保存」是灰的，
  字段下面直接说明哪里不行。
- **改动能留住**：值写进 profile 的配置，换端口、重启、在面板与桌面窗口之间切换都还在，页面不留副本。
- 三套字体**不在卡片里**：皮肤不带字体文件，手填字体栈只会指向这台机器可能没装的字族，
  所以字体栈固定用插件内置的那几套。

## 结构

```
dsh-mimo-skin/
├── lib/{index.js,client.js}  # 两个半边：宿主（自包含 ESM）+ 浏览器（module-table），都入库
├── src/index.ts              # 宿主半边：发布设置、声明 Config
├── src/config.ts             # 配置字段与逐字段回退
├── src/color.ts              # 颜色解析、混合与 AA 对比度推导
├── src/client/               # 浏览器半边：styles / palette / skin / marquee / settings / panel
├── locale/{zh,en}.json       # 卡片文案，英文是回退语言
├── test/                     # 101 项单测
├── docs/                     # README 用的截图
├── scripts/install-profile.mjs   # 装进 / 移出某个 profile
├── build.mjs                 # esbuild 构建两个半边
├── cordis.patch.yml          # bundle patch：装上即生效的那一行
└── CHANGELOG.md / THIRD_PARTY_NOTICES.md / LICENSE
```

### 两个半边

| 半边 | 做什么 | 为什么这么分 |
| --- | --- | --- |
| 宿主（`lib/index.js`） | 把行的五个外观字段整份写进 index 注入表；`Config` 把它们声明成 `.volatile()`，这一行于是成为「插件」页卡片背后的设置命名空间 | loader 行的 `config` 到不了页面（boot 图只带 id/inject/external）；卡片的写入又只能经设置服务落进 profile |
| 浏览器（`lib/client.js`） | 装样式表、挂顶部字标、把调色板写到 `document.body`、渲染卡片 | 皮肤没有时间轴、没有会话状态，只需要设置 |

皮肤**不带任何打包资源**：颜色、线条、字标都是浏览器半边用 CSS 写出来的，所以宿主半边不注册路由、不需要 web server。

### 兼容性

- 纯面向 DSH，不做跨宿主兼容；兼容下限 `dsh-v0.1.5-rc.2`，从这一版起向后兼容。
- **不改页面结构**：除 `body` / `#root` 外只用产品有文档的钩子（`[data-composer-card]`、
  `[data-menu-material]`、开关自己发布的 `role` / `aria-checked`），不依赖会过期的生成类名。

### 开发

```bash
npm install                  # esbuild + schemastery，只为构建
node build.mjs               # 两个半边都产出到 lib/
node build.mjs --watch       # 改 src/ 就重建
node --test test/*.test.mjs  # 101 项单测
```

**`lib/` 入库，改完 `src/` 请把重建后的 `lib/` 一起提交** —— GitHub 直装用的就是仓库里这份产物。
发布走 `prepack`，`npm publish` 会先重建一遍，发到 npm 的那份永远与 `src/` 同步。

改源码后：浏览器半边是**热更**的，宿主半边只在引擎进程启动时加载一次 —— 换宿主半边要重启引擎，不是刷新页面。

单测覆盖：颜色算术与 `readableOn` 的 AA 下限（用另一份独立实现的 WCAG 对比度来量，避免自证）、
配置逐字段回退、外壳取值与选择、任选强调色都能算出达标的文字色、字标的两遍结构与自动挂回、
样式表的 token 契约（含「不得出现生成式类名」「强调色不得变成主按钮填充」「状态色不得被钉死」
「深色块必须在浅色块之后」「关闭态开关不得沿用黑发丝」等反向断言）、卸载后不留痕、
卡片那侧的字段收窄与保存前校验，以及两份 `locale/` 词典逐键对齐。

## FAQ

**装完界面没变？**
先看插件页里 `dsh-mimo-skin` 这一行是不是打开的；再确认页面已经刷新。宿主半边只在引擎进程启动时
加载一次，如果刚换过宿主半边，要重启的是 DSH 引擎本身。

**为什么强调色当文字时不是官网的 `#ff6700`？**
`#ff6700` 在 `#faf7f5` 上只有 2.74:1，低于 AA 的 4.5:1。皮肤选择保住对比度，所以文字那一档是
算出来的（默认浅色 `#bf4d00`）。想完全照搬官网原值，就得接受链接对比度掉到 AA 以下。

**字体看起来不像官网？**
皮肤**不带字体文件**，只声明字体栈，实际字形由这台机器已装的字体决定；没装时退到
Noto Serif SC / 宋体 / Georgia。要 1:1 复刻得自带 woff2，那要先解决 MiSans 的授权。

**怎么升级？**
插件不自动更新：先卸载再装新版本。

**深色为什么和官网深色截图不一样？**
官网的 `.dark` 是 Rspress 未改的默认蓝灰，不能照抄。皮肤对齐的是官网深色版的纸色
（`--rp-home-bg:#000`）加上「黑纸白墨、强调色提亮一档」这条规则。

## Roadmap

- **已发布**：`v0.1.0` 首个版本；`v0.1.1` 让 git 直装可用（`lib/` 入库、构建从 `prepare` 挪到 `prepack`）。
- **计划中**：暂无排期。候选是自带字体（需先解决 MiSans 授权），以及跟随参考站后续的改版。

细节见 [CHANGELOG.md](CHANGELOG.md)。

## 贡献

- 提 issue 请附上 DSH 版本、系统、复现步骤；界面问题带截图更好。
- 提 PR 请保持单测全绿（`node --test test/*.test.mjs`），改了 `src/` 就一并提交重建后的 `lib/`。
- 一处改动只做一件事，不加与本次无关的重构。

## 许可

MIT，见 [LICENSE](LICENSE)。

产物里内联的第三方代码（`@deepseek-ai/schemastery`，MIT）其许可声明见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，由 `build.mjs` 附加到产物末尾。

视觉参考 [`mimo.xiaomi.com`](https://mimo.xiaomi.com/)；宿主平台
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。改动记录见 [CHANGELOG.md](CHANGELOG.md)。
