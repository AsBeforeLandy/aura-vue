# @aura-vue/business

## 0.2.0

### Minor Changes

- e39768e: 建立工程化门禁基线：lint / format / typecheck / 覆盖率阈值 / 产物冒烟测试

  ### 新增
  - `@aura-vue/components` 补 `install` 插件与 `components` 清单，与 `@aura-vue/business` 的
    `AuraBusiness` 对齐（两个包现在都支持 `app.use()` 全量注册）。
  - `scripts/smoke.mjs` 产物冒烟测试：校验 exports 目标存在、产物无 alias 泄漏、
    裸包名依赖已声明、文档引用的包内路径确实被 exports 暴露。
  - 覆盖率阈值门禁（阈值取当前实测值 -3~4pt，用于防回退）。
  - 包体积预算（size-limit）。

  ### 修复
  - **发布阻断**：`exports` 原先声明 `"./src/*"` 但 `files` 只含 `dist`，
    发布后任何源码子路径导入都会 404。现收窄为只导出样式路径
    （`./src/style/*`、`./src/*/style/*`），并把对应目录加入 `files`。
  - **发布阻断**：`@aura-vue/business` 产物残留裸引用 `@aura-vue/shared`，
    而后者以 TS 源码为入口，使用方安装后无法加载。现改为内联，
    与 `@aura-vue/components` 行为一致。
  - 移除 `@aura-vue/business` 未使用的 `@aura-vue/components` 依赖（幽灵依赖）。
  - 文档中 `@aura-vue/components/dist/style.css` 改为 `@aura-vue/components/style.css`
    （前者不在 exports 映射内，照抄必然 Module not found）。
  - 上游 `v-html` 加安全说明注释；`render-control` / `Select` 中的三元表达式
    语句改为 if/else。

  ### 工程化
  - 新增 ESLint 9 flat config、Prettier、EditorConfig、Husky（pre-commit + commit-msg）、
    commitlint、`.nvmrc`、根 LICENSE。
  - CI 门禁扩展为 Lint / Format check / Typecheck / Coverage / Build / Size / Smoke / Docs。

### Patch Changes

- 9374033: 修复发布包的类型解析问题，并让文档站按需加载 Element Plus

  ### 修复（影响发布包）
  - **`.vue.d.ts` 与 `.vue.js` 文件名对不上**：原先 `cleanVueFileName: true` 会把
    声明文件重命名为 `Button.d.ts`，而 JS 产物是 `Button.vue.js`。
    `moduleResolution` 为 `node16` / `nodenext` 的消费方因此完全拿不到类型
    （静默退化为 `any`）。现改为保持 `Button.vue.d.ts`，与 JS 一一对应。
  - **声明文件里混进不可移植的类型引用**：`lodash-unified` 的类型引用曾被写成
    `import('../node_modules/lodash-unified/type.d.ts')`，该路径在消费方机器上必然不存在。
    现在由 `scripts/postbuild-dts.mjs` 收敛回裸包名，并把 `lodash-unified` 移入
    `dependencies` 以保证可解析。
  - 声明文件里的相对引用统一补全扩展名（`./button` → `./button/index.js`），
    使其在 `node16` 解析下可用。

  :::tip 效果
  `@arethetypeswrong/cli` 现在对两个包在 `node16 (from ESM)` 与 `bundler`
  两种模式下都判定为 🟢（此前是解析错误）。
  :::

  ### 文档站
  - Element Plus 改为**按需引入样式**（不再引 `element-plus/dist/index.css` 全量）：
    聚合 CSS 从 489 KB 降到 331 KB（gzip 71 → 49 KB）。
  - 修复主题入口为取两个注入 key 而引入 EP 根 barrel 的问题——它导致 Element Plus
    被打进首屏 chunk。改走 `element-plus/es/hooks/*` 深路径后，EP 组件只被
    用到它们的 demo 页懒加载：**首屏 JS 从约 415 KB 降到约 134 KB（gzip）**，
    指南页与首页完全不再加载 EP。构建的 chunk 体积告警随之自然消失
    （不是靠调高阈值掩盖）。

- 2a14d72: Modal 补齐焦点管理，并修复三项发版配置

  ### @aura-vue/components — Modal 无障碍（minor）

  按 WAI-ARIA dialog 模式补齐了此前缺失的焦点管理：

  - **打开时聚焦面板**：面板加了 `tabindex="-1"`，聚焦后读屏会先播报对话框与其名称，
    而不是一上来先读到一个按钮。
  - **Tab 焦点陷阱**：`Tab` / `Shift+Tab` 在弹窗内循环，不会跑到弹窗背后的页面内容；
    若焦点已在弹窗外（例如用户点了浏览器地址栏再回来），下一次 `Tab` 会把它拉回弹窗。
    弹窗内没有任何可聚焦元素时，焦点按在面板上而不是漏出去。
  - **关闭后归还焦点**：恢复到打开前的元素；组件在打开状态下被卸载时同样归还，
    避免焦点落到 `body`。
  - 新增 `aria-label`（取 `title`），关闭控件由 `span[role="button"]`
    改为**原生 `<button>`**——原生元素自带可聚焦性、Enter/Space 激活与焦点环，
    无需再手工补 `tabindex` 与键盘处理。类名不变，样式选择器不受影响。

  :::tip 升级注意
  若你自定义了 `.aura-modal-close` 的样式，它现在作用在原生 `button` 上，
  可能需要补 `border: 0; background: none` 之类的重置。
  :::

  ### 发版配置（两个包）
  - 补 `publishConfig.access = "public"`：两个包都是作用域包，
    npm 默认按 restricted 处理，**免费账号发布会直接 402 失败**。
  - 补 `engines`，与 CI / `.nvmrc` 对齐。
  - 补包级 `prepublishOnly`：此前只有根级，从包目录直接发布时不会构建，
    可能发出一个没有 `dist` 的包。

  ### 仓库工程化（不影响包产物）
  - `Release` 工作流补 `permissions`（`contents` / `pull-requests` / `id-token`）：
    changesets/action 需要写权限才能提交 version commit、创建 Version Packages PR 并打 tag，
    缺失时会静默失败。同时开启 npm provenance。
  - 发布前改为复用单步 `pnpm verify`，避免与 CI 各维护一份步骤清单而漂移。
  - 新增 `scripts/api-surface.mjs` 公开 API 表面快照校验：
    从构建产物提取导出名 / props 类型与默认值 / emits，与仓库快照比对，
    把「改 prop 名、删导出」这类编译期无感的破坏性变更变成显式动作。

- 84320a0: 收紧 engines 到 `^22.13.0 || >=24`

  业务包依赖的 `pdfjs-dist@6` 在模块顶层引用了 `Iterator` 全局
  （Node 22+ 才有），Node 20 消费方在运行时会直接抛
  `ReferenceError: Iterator is not defined`——安装期不报错，
  炸在用户页面上，属于最恶劣的失败模式。

  engines 是 advisory 字段（npm 只警告不强拦），但它能给出
  明确的安装期提示，比静默炸运行时好。`@aura-vue/components`
  无此依赖，engines 保持 `^20.19.0 || ^22.13.0 || >=24` 不变。
