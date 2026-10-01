# dsh-mimo-skin

一个给 DSH（DeepSeek Harness）Web GUI 用的**纯皮肤插件**：装上之后，整个界面换成
[`mimo.xiaomi.com`](https://mimo.xiaomi.com/) 的样子 —— 暖白纸面、黑色发丝分隔线、衬线阅读正文、
橙色点缀。它不新增任何业务功能，只改外观。

<!-- 图片走仓库的绝对地址：npm 页面渲染 README 时解析不到相对路径，写成 docs/… 会裂成图框。 -->
![前后对比](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-compare.png)

上图是同一台引擎、同一个页面：**上**是产品自己的外壳，**下**是套上皮肤之后。两张都是从一台
真引擎、真浏览器上截的，不是示意图。

## 它做什么

| 部位 | 换成什么 | 来自参考站的什么 |
| --- | --- | --- |
| 页面底色 | `#faf7f5` 暖白 | `:root{--bg-primary}` |
| 抬升面（气泡、菜单、输入卡） | `#f5f0eb` 嵌套面 | `--bg-secondary` |
| 正文 | `#1a1a1a` 墨色 | `--text-primary` |
| 次级 / 三级文字 | `#555` / `#888` | `--text-secondary` / `--text-tertiary` |
| 分隔线 | 纯黑发丝 | 分区行 `border-bottom:1px solid #000`、卡片 `#00000012` |
| 强调色 | 默认 `#ff6700`，可改 | `--accent` |
| 正文与标题字体 | PT Serif 系衬线 | 正文 `PTSerif-Regular`、`--font-serif` |
| 控件与标签字体 | MiSans/Ubuntu 系几何无衬线 | `--font-title`、`MiSans-Medium` |
| 代码字体 | SF Mono 系等宽 | `--font-mono` |
| 圆角 | 3px | 内容卡 `border-radius:3px` |
| 投影 | 参考站自己那套极浅投影 | `.grid-btn`、内容卡 |
| 顶部字标 | 一条横向滚动的淡字，默认 `DEEPSEEK HARNESS` | hero 背后那层 5% 墨的字场 |

## 两种外壳

浅色与深色都做了，而且**深色是同一套规则整体翻转**，不是「把背景调暗」：

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

深色的口径是「同一套规则整体翻转」，不是「把背景调暗」：纸面从米白翻成纯黑、墨色翻成纯白、
发丝线跟着反过来，强调色则提亮一档。顶部那条滚动字标的做法照的是一行 `nowrap` 文字走
`translateX(0 → -50%)` 的走马灯。

**配色外壳**默认 `auto`：跟随 DSH 自己的深浅色设置。你在产品里切明暗，皮肤跟着重画，明暗开关
仍然在你手里。

### 为什么强调色要分「填充」和「文字」两个值

参考站的 `#ff6700` 在自己那张 `#faf7f5` 纸上只有 **2.74:1** 对比度 —— 做填充色块、按钮圆点、
描边完全够，但做链接文字低于 AA 的 4.5:1。所以皮肤只让你**填一个颜色**（填充用），
**当文字渲染的那一档是算出来的**：浅色下往黑里走、深色下往白里走，直到对比度达标为止。

卡片里会把两个算出来的值直接显示给你看（含对比度）：

![插件卡片](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-card.png)

默认 `#ff6700` 因此得到浅色 `#bf4d00`（4.6:1）、深色 `#ff6700`（7.2:1，纯黑上本来就够）。
换成别的颜色，这两档会跟着重新算，AA 下限不会掉。

### 哪些 token **故意不动**

- **状态色**（警示 / 成功 / 错误）、**toast**、**tooltip**、**diff 底色**、**气泡高亮**：DSH 自己在
  `body[data-ds-dark-theme]` 上已经切了一套深色值。皮肤要是用 `!important` 把它们钉死，那套为
  白纸调的琥珀色就会被原样搬到黑纸上。所以这些 token 皮肤一个都不声明，交给产品自己切。
- **主按钮**：参考站自己的主按钮在浅色页是**黑色**、深色页是**白色**，橙色只做点缀。所以皮肤没有
  改 `--dsw-alias-button-primary-fill`（「Add plugin」「Continue」这些仍是黑/白），只把
  **信息填充**（`--dsw-alias-button-info-fill`，就是输入框右下那颗发送键）涂成强调色。
- **关闭态开关**：产品把 `--dsw-alias-border-l3` 当关闭态**底色**用（不是描边），而这个 token 在皮肤里
  是纯黑发丝 —— 不单独处理，关闭态会和打开态一样近黑。所以皮肤用 `--dsh-mimo-track` 重画关闭态；
  打开态保持产品自己的品牌填充。

![插件页](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-plugins.png)

上图里 8 个官方插件的开关关闭态是浅灰洗，`dsh-mimo-skin` 自己的打开态是产品品牌填充。

## 顶部滚动字标

![上方字标](https://raw.githubusercontent.com/RonnyJung2021/dsh-mimo-skin/main/docs/preview-light.png)

一条固定在整个窗口顶端的横条，里面是一行横向滚动的淡字：

- **滚动效果**照同项目「专注 / 休息计时」面板里的那一行做：内容是该文字的**两遍**，
  动画 `translateX(0 → -50%)` 线性无限循环 —— 走完正好是一遍的距离，所以接缝处看不见跳。
- 位置在**顶部、横向铺满**，`body` 被这条横条自身的高度顶下去，所以它有自己的**一行**，
  不会压在侧栏或标题行上。
- **浓度可调**（0–1，默认 `0.05`，也就是参考站自己的值），**可以整个关掉**（关掉时那一行也收回去，
  不留空白）。
- **文字可改**，默认 `DEEPSEEK HARNESS`。
- 不挡鼠标、不可选中、`aria-hidden`；被别的东西挪走或被移除时会自动重新挂回来。
- 在 macOS 桌面壳里这条横条自己声明 `-webkit-app-region: drag` —— 否则窗口顶端会被产品的
  「非 `#root` 的 body 子节点一律 no-drag」规则挖掉一块，拖不动窗口。

## 插件卡片

侧栏 **插件 → 已安装 → dsh-mimo-skin**，卡片下面是这个插件**自己的页面**，五个外观项：

| 项 | 说明 |
| --- | --- |
| 配色外壳 | 跟随产品（默认）/ 浅色 / 深色 |
| 强调色 | `#rgb` 或 `#rrggbb`，旁边有实时色块与算出来的两档文字色 |
| 字标文字 | 顶部那条横条滚动的内容 |
| 字标浓度 | 0–1 |
| 顶部滚动字标 | 开关 |

- **改完点「保存」才生效**（不是改一项立刻重画），另有一颗「恢复默认」把所有外观项写回默认。
- **保存前先校验**：颜色值要合法、浓度要落在 0–1、字标文字不能为空。不合法时「保存」是灰的，
  字段下面直接说明哪里不行。
- **改动能留住**：值写进 profile 的配置（`profiles/web/cordis.patch.yml` 的 `- id: dsh-mimo-skin` +
  `config:`），换端口、重启、在面板与桌面窗口之间切换都还在。页面不留任何自己的副本。
- 三套字体**不在卡片里**：皮肤不带字体文件，手填字体栈只会指向这台机器可能没装的字族，
  所以字体栈固定用插件内置的那几套。
- 卡片显示的是**包名** `dsh-mimo-skin`。

## 两个半边

| 半边 | 做什么 | 为什么 |
| --- | --- | --- |
| 宿主（`lib/index.js`） | 把行的五个外观字段整份写进 index 注入表；`Config` 把它们声明成 `.volatile()`，这一行于是成为「插件」页卡片背后的设置命名空间 | loader 行的 `config` 到不了页面（boot 图只带 id/inject/external）；卡片的写入又只能经设置服务落进 profile |
| 浏览器（`lib/client.js`） | 装样式表、挂顶部字标、把调色板写到 `document.body`、渲染卡片 | 皮肤没有时间轴、没有会话状态，只需要设置 |

皮肤**不带任何打包资源**：所有颜色、线条、字标都是浏览器半边用 CSS 写出来的，所以宿主半边不注册
路由、不需要 web server。

## 行配置

所有字段可选，省略即用默认值，非法值逐字段回退——皮肤坏掉不该拖住 GUI 启动。

```yaml
- insert:
    - id: dsh-mimo-skin
      name: dsh-mimo-skin
      config:
        theme: auto                 # light | dark | auto（默认 auto：跟随产品自己的深浅色）
        accent: '#ff6700'           # 任意 #rrggbb；当文字渲染的那一档自动算
        pattern: true               # 是否画顶部那条滚动字标
        patternOpacity: 0.05        # 字标墨色浓度 0…1（参考站自己的值就是 0.05）
        patternText: DEEPSEEK HARNESS
        enabled: true
```

这些值也可以不改 YAML，直接在卡片里改（见上）。

## 装 / 卸

插件以 **bundle** 的形式装进 profile：包本身声明了 `dsh.bundle.patch`，装完即生效，并在「插件」页
给出一个可开关的条目。

```bash
# 装进某个 profile（默认 $DSH_HOME 或 ~/.dsh，profile 名 web）
node scripts/install-profile.mjs --home /path/to/home
node scripts/install-profile.mjs --home /path/to/home --dry-run   # 只打印将改动什么
node scripts/install-profile.mjs --home /path/to/home --uninstall # 卸掉
```

它写三样东西（都是「插件」页自己会写的那三样）：profile `package.json` 的 `link:` 依赖与
`dsh.profile.bundles` 里的包名、`node_modules/<包名>` 软链、`pnpm-lock.yaml` 的 importer 条目；
顺带把老的 `file://` 式 `insert` 行清掉（否则插件会被加载两次）。每个被改的文件都先备份成
`*.bak-dsh-mimo-skin`。

## 跑起来看看

```bash
npm install                                              # 装构建依赖，并自动跑一次 prepare 出 lib/
node scripts/install-profile.mjs                          # 装进 $DSH_HOME 或 ~/.dsh 的 web profile
dsh web --no-open --port 4399                             # 起 DSH 自己的 Web GUI
```

打开最后一条打印的那个带 `?token=` 的地址即可。

想隔离在一边试，就把 `DSH_HOME` 指到别处再重复上面两步 —— 引擎的数据、profile 配置与端口都按
home 分区，所以互不影响：

```bash
export DSH_HOME="$HOME/.dsh-scratch"
DSH_DESKTOP_USER_DATA="$DSH_HOME" dsh web --no-open --port 4399
```

改源码后重建：`node build.mjs`（或 `node build.mjs --watch`）。浏览器半边是热更的，宿主半边只在
引擎进程启动时加载一次 —— 换宿主半边要重启的是引擎，不是刷新页面。

## 构建与测试

```bash
npm install                       # esbuild + schemastery，并为构建后的 prepare 跑一次
node build.mjs                    # 两个半边都产出到 lib/
node build.mjs --watch
node --test test/*.test.mjs       # 101 项单测
```

`lib/` 不入库（见 `.gitignore`），由 `prepare` 在 `npm install` 后自动产出；直接 `npm install` 完
即可用，不必记着敲构建。

- `lib/index.js` 是自包含 ESM：`name` / `inject` / `apply` / `Config`（schemastery 校验器由
  `build.mjs` 就地内联进来），不需要旁边有 `node_modules`。只有 `@deepseek-ai/cordis` 保持外部，
  一台引擎里只能有一个 Cordis 实例。内联进来的第三方代码其许可声明写在
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，并由 `build.mjs` 附加到产物末尾。
- `lib/client.js` 是 **module-table 方言**：`window.__ModuleLoader__.load({ id, factory })`，
  只 `require` 平台种子模块；esbuild 的 CJS 产物由 `build.mjs` 包上这套信封，不要手改产物。
- 单测覆盖：颜色算术与 `readableOn` 的 AA 下限（另一份独立实现的 WCAG 对比度来量，避免自证）、
  配置逐字段回退、两个外壳的取值与选择、**任选强调色都能算出达标的文字色**、字标内容的两遍结构
  与自动挂回、样式表的 token 契约（含「不得出现生成式类名」「强调色不得变成主按钮填充」
  「状态色不得被钉死」「深色块必须在浅色块之后」「关闭态开关不得沿用黑发丝」「字标横条必须占一行」
  等反向断言）、applier 的写入与跟随主题、卸载后不留痕、卡片那侧的字段收窄与保存前校验、
  宿主半边把 volatile 引用解成取值再发布，以及两份 `locale/` 词典逐键对齐。

## 已知取舍

- **不带字体文件。** 皮肤只声明字体栈，实际字形由机器已装的字体决定；没装时退到
  Noto Serif SC / 宋体 / Georgia。要 1:1 复刻参考站字形得自带 woff2，那要处理 MiSans 的授权。
- **强调文字是算出来的，不是官网原值。** 官网 `#ff6700` 在它自己的纸上只有 2.74:1；
  要完全照搬官网原值就得接受链接对比度掉到 AA 以下。皮肤选择保住对比度。
- **深色是「参考站深色规则」而非「参考站深色截图」。** 官网的 `.dark` 是 Rspress 未改的默认蓝灰，
  不能照抄；这里对齐的是官网深色版的纸色（`--rp-home-bg:#000`）加上「黑纸白墨、强调色提亮一档」这条规则。
- **字标横条占了顶部一行。** 它把页面顶下去一个横条的高度（默认 52px），关掉即收回；
  这么做是为了不压住产品的侧栏与标题行。
- **0.5px 发丝线在 1x 屏上可能被渲染成 1px 或极淡。** 这是 DSH 自己画分隔线的方式，皮肤只是给它上色。
- **不改页面结构。** 除 `body` / `#root` 外只用产品有文档的钩子（`[data-composer-card]`、
  `[data-menu-material]`、开关自己发布的 `role`/`aria-checked`），不依赖会过期的生成类名。

## 兼容

纯面向 DSH，不做跨宿主兼容；兼容下限 `dsh-v0.1.5-rc.2`，从这一版起向后兼容。

## 许可

MIT，见 [LICENSE](LICENSE)。产物里内联的第三方代码其许可声明见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。改动记录见 [CHANGELOG.md](CHANGELOG.md)。
