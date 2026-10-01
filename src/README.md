# `src/` 的结构与分层规矩

这套结构不依赖 MiMo 皮肤的任何特性，只假设一件事：**一个插件有宿主半边和浏览器半边**。任何 DSH 插件页面
都可以照搬，换成自己的字段与样式即可。

## 目录

```text
src/
├── index.ts      # 宿主入口（build.mjs 的入口点，路径别动）
├── host/         # 宿主半边实现
├── client/       # 浏览器半边（构建入口 src/client/index.ts）
├── constants/    # 常量
├── enums/        # 枚举
├── types/        # 类型
└── utils/        # 纯函数
```

## 每一层放什么

| 层 | 放什么 | 判断标准 |
| --- | --- | --- |
| `enums/` | 封闭取值集合：`as const` 元组 + 派生联合类型 + 判定函数（如 `THEMES` / `isTheme`） | 「只有这几种」，要拿来校验或分支 |
| `constants/` | 插件自己定死的具体值：id、DOM 契约、默认值、字段表、字体栈、变量名 | 值不靠计算，写下来就是它 |
| `types/` | 跨模块的对象形状（`interface` / `type`），只有结构没有值 | 被两处以上引用的形状才放这里 |
| `utils/` | 纯函数，一个文件一件事：`color`（颜色）、`value`（取值收敛）、`volatile`（解 volatile 引用）、`config`（配置收敛）、`section`（设置节） | 同样输入必得同样输出，不碰 `ctx` |
| `host/` | 宿主半边：`schema`（Config）、`publish`（挑出要传给页面的值）、`index`（`apply` 接线） | 只在 Node 侧跑 |
| `client/` | 浏览器半边：`index`（`apply`）、`published`（读宿主发布的全局）、样式、组件 | 只在页面里跑 |

`client/` 里再按形态分：`styles/` 放样式表与安装函数，`components/` 放 React 组件（容器一个文件、无状态的叶子
控件一个文件）。

## 依赖方向

```text
enums → constants → types → utils → host / client
```

箭头表示「可以被谁依赖」：`constants` 可以用 `enums`，`types` 可以用 `constants` 和 `enums`，`utils` 可以用下面
三层，两个半边在最上层，可以用全部四层。反向依赖不允许，同层之间可以互相 import。

- **两个半边都用的东西必须下沉**到 `utils/` 或 `constants/`；`host/` 与 `client/` 之间不互相 import。
- **不设 barrel `index.ts`**：两个入口（`src/index.ts`、`src/client/index.ts`）已经够用，多一层转发只会藏住真实
  依赖。层内直接指到文件，例如 `import { isColor } from '../utils/color.ts'`。
- **源码里写 `.ts` / `.tsx` 后缀**：esbuild 直编，不经过 bundler 解析。

## 换一个插件怎么抄

1. `constants/ enums/ types/ utils/` 四层整层拿走。`utils/` 里 `color.ts`、`value.ts`、`volatile.ts` 是通用的；
   `config.ts` 与 `section.ts` 换成自己插件的字段名即可。
2. `host/` 三件套：`schema.ts` 声明 `Config`（页面要改的字段加 `.volatile()`）、`publish.ts` 决定哪些值进页面、
   `index.ts` 只做接线。
3. `client/` 的骨架：`published.ts` 读宿主发布的全局、`styles/` 安装样式表、`components/` 渲染卡片。
4. **插件名只写一次**：`constants/plugin.ts` 的 `PLUGIN_ID`，宿主与浏览器两边的 `name`、设置命名空间都从它来。
5. 字段表也只写一次（`constants/config.ts` 的 `SECTION_FIELDS`）：宿主据此发布、卡片据此编辑，两者不会漂开。
