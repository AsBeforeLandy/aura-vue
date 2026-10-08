# @aura-vue/components

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

- e07429c: 新增第五批组件：Tabs / Drawer / Breadcrumb，基础组件扩至 23 个

  ### 新组件
  - **Tabs 标签页**：完整 WAI-ARIA tabs 模式（tablist / tab / tabpanel，
    aria-selected + aria-controls / aria-labelledby 双向关联）；双轨受控
    （复用 useControllable，非受控默认选中**第一个可用项**）；roving tabindex +
    左右方向键在可用项之间循环（跳过禁用项）。面板从具名插槽 `panel-<value>`
    取内容、只渲染激活项（懒渲染），无对应插槽的标签退化为纯导航 tab。
  - **Drawer 抽屉**：`role="dialog"` + `aria-modal`，与 Modal 共享同一套焦点
    管理（useDialogBehavior）；right / bottom 两个贴边方向（滑动进场），
    `size` 在 right 时为宽度、bottom 时为高度；footer 插槽放动作区。
  - **Breadcrumb 面包屑**：nav + ol 语义；末项自动视为当前页（非链接 +
    `aria-current="page"`）；中间节点提供 `to` 才渲染为链接；分隔符画在
    伪元素上。

  ### 架构
  - **抽取 `useDialogBehavior` 组合式**（焦点陷阱、焦点接管与归还、Esc 关闭），
    Modal 重构为复用，Drawer 直接受益——两套弹层不再各维护 ~100 行焦点逻辑。
    Modal 24 个既有用例全部通过（回归网）。
  - 组合式顺带修复一个边缘语义：**挂载即打开**的弹层此前不会接管焦点
    （watch 无 immediate，Modal 的用例都是先挂载后置 true，掩盖了这条路径）；
    并修正「焦点归还到 body」的无效归还（初始态焦点不算用户焦点）。
  - Segmented / Tabs 同源坑再次出现：模板绑定必须用带「默认选中第一项」
    回退的 fallbackValue 而非裸 value——本批在 Tabs 上第二次踩到，
    已在两个组件源码注释中标警示。

  ### 体积预算
  - components 全量 esm：20 组件 25.24 kB → 23 组件 29.05 kB，预算 28 → 32 kB。

- 72b6006: 新增第一批轻量组件：Divider / Space / Tag / Typography

  ### 新组件
  - **Divider 分割线**：水平 / 垂直方向、虚线、文字三档位置（left / center / right）。
    带文字时线条由伪元素绘制；垂直方向不渲染文字。带 `role="separator"` 语义。
  - **Space 间距**：横向 / 纵向排列，三档间距（small 8 / middle 12 / large 16，走间距令牌）
    或像素值；支持换行（行间距与列间距同档）与对齐覆盖。
  - **Tag 标签**：五种语义色（primary / success / warning / danger / info，info 为中性灰），
    浅底深字组合；`closable` 显示原生关闭按钮（可键盘触发），
    显隐双轨受控（`v-model:visible` / `default-visible`）。
  - **Typography 排版**：`level` 渲染 h1~h4（超出范围安全回落为段落），
    `type` 语义色，`strong` / `underline` / `delete` 行内强调（可组合）。

  ### 设计令牌与工具
  - 新增间距令牌 `--aura-space-small/middle/large`（8 / 12 / 16px，与按钮设计规范的
    「相邻间距 12px」对齐）。
  - 新增语义色的柔和表面与文字级变体令牌（`--aura-success-soft` 等 +
    `--aura-color-*-strong`）：12px 小字直接用主色对比度不足，加深一档保证可读；
    亮暗两套都在 `base.less` 集中维护。
  - `@aura-vue/shared` 新增 `pickPresetClass(value, presets, prefix)`：联合类型的
    档位 prop（type / size / align）在运行时收到非法值时不再产生垃圾类名，
    安静回落到组件默认外观。

  ### 升级注意
  - 若你依赖「非法枚举值会产生类名」的行为（不应有人依赖），现在会得到空类名。
  - 语义色标签的文字色改为 `-strong` 变体；若你基于旧色值做过覆盖，需要同步。

- 1cdd2b4: 新增第四批组件：Steps / Segmented / Skeleton，基础组件扩至 20 个

  ### 新组件
  - **Steps 步骤条**：`items`（title / description）+ `current` + `status`
    （process / error）。ol / li 有序列表承载语义，当前项 `aria-current="step"`；
    完成项圆圈变对勾；`current` 越界钳位推断（-1 全部等待，length 全部完成）。
  - **Segmented 分段控制器**：字符串 / 对象两种选项形态；双轨受控
    （`v-model` / `default-value`，复用 useControllable；非受控时默认选中第一项）；
    radiogroup + radio 语义，roving tabindex + 左右方向键循环切换；
    初始值在 setup 时取一次，动态改 options 需用受控模式（文档已标注）。
  - **Skeleton 骨架屏**：`loading` 双态（true 骨架占位 / false 渲染插槽）；
    avatar / title / rows 组合，末行短一截模拟段落收尾；`aria-busy` +
    骨架块 aria-hidden；呼吸脉冲走新增的 `--aura-duration-slow` 令牌，
    reduced-motion 下自动静止（与 spin 的「放慢不归零」策略区分）。

  ### 设计令牌
  - 新增 `--aura-duration-slow: 1.5s`（循环装饰动画用）；
    reduced-motion 下归零——base.less 注释同步更新了「循环动画分两类」的
    策略说明：加载指示器放慢不归零，装饰脉冲直接归零。

  ### 体积预算
  - components 全量 esm：17 组件 21.95 kB → 20 组件 25.24 kB，预算 25 → 28 kB。

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

- 2e803d7: 适配系统的「减少动态效果」偏好（prefers-reduced-motion）

  ### 变化
  - 新增动效令牌：`--aura-duration-fast` / `--aura-duration-base` / `--aura-easing` /
    `--aura-spin-duration`。全部过渡时长不再写死在组件样式里，而是从令牌取值。
    （此前 `--aura-easing` 被三处样式引用但从未定义，一直走的是 `ease` 兜底，现已补上。）
  - `prefers-reduced-motion: reduce` 时：
    - **过渡归零**——进出场、hover、展开收起这类纯装饰性动效取消，变化立刻生效；
    - **loading 旋转放缓为 2.4s 而不是停止**——它承载「正在处理中」的状态信息，
      冻结会被理解成界面卡死。

  ### 升级注意
  - 若你在自己的样式里覆盖过 `--aura-easing`，现在它会真正生效（此前被 `ease` 兜底盖住）。
  - 组件样式里的过渡时长一律走令牌；如果你 fork 过组件样式并写了固定时长，
    建议同样改为引用令牌，以保持行为一致。
  - 令牌只在 `@media (prefers-reduced-motion: reduce)` 下被覆盖，
    采用 `:root` 覆盖自定义属性的方式，**不会**用 `* { transition: none !important }`
    这类通配禁用——那会连消费方自己的过渡一起干掉。

- ca1d5db: 新增第二批组件：Alert / Spin / Empty / Tooltip，基础组件扩至 14 个

  ### 新组件
  - **Alert 提醒**：四种语义色（与 Tag 同源的柔和表面 + 加深文字组合），
    `title` / `show-icon` / `closable`；显隐双轨受控（`v-model:visible`）。
    根节点带 `role="alert"`，图标内联 SVG（组件包不依赖 EP，也没有图标依赖），
    warning 用三角底形区分。
  - **Spin 加载中**：三档尺寸；`role="status"` + `aria-live="polite"`，
    旋转对读屏隐藏、信息由 tip 文案承载；`spinning=false` 不渲染任何内容。
    keyframes 定义在组件自身样式内，不依赖 Button 的样式文件。
  - **Empty 空状态**：内联 SVG 占位图（描边走令牌，暗色可用）、
    默认文案「暂无数据」、`default` 插槽放主动作按钮。
  - **Tooltip 文字提示**：**自研实现**（组件包约束不得依赖 element-plus）。
    Teleport 到 body + `position: fixed` 定位；定位只用触发元素的视口矩形、
    浮层尺寸交给 transform（免测量），hover 与 focus 双触发、Escape 关闭、
    打开期间跟踪滚动（capture）与窗口缩放；`aria-describedby` 指向
    `role="tooltip"` 浮层。已知限制：不做视口边缘翻转（文档页已标注）。

  ### 设计令牌
  - 新增反色表面令牌 `--aura-inverse-bg` / `--aura-inverse-text`（深底浅字浮层用，
    亮暗主题下都保持深色以与内容形成反差）。

  ### 体积预算
  - components 全量 esm：10 组件 13.04 kB → 14 组件 17.59 kB，预算 15 → 20 kB
    （口径：单组件约 1.2 kB brotli，属组件库正常密度）。

  ### 升级注意
  - `visible` 双轨组件（Alert / Tag）的非受控初始属性名为 `default-visible`。

- ef4f6c8: 新增第六批组件：Collapse / Tree / Upload，基础组件扩至 26 个

  ### 新组件
  - **Collapse 折叠面板**：Collapse + CollapseItem 组合（provide/inject 传递
    展开上下文）；`v-model` 绑定展开项 value 数组，accordion 手风琴模式；
    标题行原生 button（aria-expanded + aria-controls），面板 region 双向关联；
    展开动画用 `grid-template-rows: 0fr → 1fr`（纯 CSS 免测量），内容
    v-show 保持挂载不销毁。
  - **Tree 树形控件**：内部 TreeItem 递归渲染；选中双轨受控
    （useControllable）；展开集合内部自持（defaultExpandedKeys / expandAll）；
    role=tree/treeitem/group + aria-level/expanded/selected；
    点击有子节点的节点顺带切换展开；方向键树导航留作后续（文档已标注）。
  - **Upload 上传**：fileList 双轨受控（v-model:file-list，内联实现——
    属性名不同构于 useControllable）；三种上传方式：action（内置 XHR，
    upload.onprogress 进度）/ customRequest 逃生舱 / autoUpload=false 只进列表；
    beforeUpload 业务校验（同步或 Promise）；drag 拖拽区；文件四态
    ready / uploading / success / danger；文件输入裁剪隐藏 + aria-hidden，
    可访问触发点是「选择文件」按钮。

  ### 架构与测试基建
  - XHR 上传与 formatSize 纯逻辑抽 `upload/utils.ts`（不依赖 Vue 响应式）。
  - upload 测试伪造最小 FileList（happy-dom 无法构造）+ File 构造器，
    customRequest 同步回调消除计时不确定性。
  - 回归记录：happy-dom 的 `checkVisibility` 是恒真桩——**isVisible() 对
    v-show 的 display:none 误报可见**，此类断言改查 inline style。
  - Upload 测试回调参数显式标注 `Parameters<UploadRequest>[0]`
    （mount props 无类型推断，隐式 any 会被 typecheck 拦下）。

  ### 体积预算
  - components 全量 esm：23 组件 29.05 kB → 26 组件 36.06 kB，预算 32 → 38 kB
    （约 1.4 kB/组件，按需导入不构成消费方负担）。

- 499ea59: 新增第三批组件：Message / Popover / Progress，基础组件扩至 17 个

  ### 新组件
  - **Message 全局消息**：命令式 API（`Message.success('已保存')` 等，不是组件、
    不进全量注册清单）。共享顶部容器随最后一条消息移除；默认 3s 自动关闭，
    `duration: 0` 不自动关（配合 `closable`），返回 `MessageHandle.close()` 可提前
    手动收掉；`role="alert"` 语义；SSR 环境静默降级不抛错。
  - **Popover 弹出框**：点击触发的可交互浮层（title / content / footer 插槽），
    面板 `role="dialog"` + `aria-modal="false"` 非模态语义；触发元素带
    `aria-expanded` / `aria-controls`；点击外部与 Escape 关闭（open 期间挂监听、
    卸载时兜底清理）；定位复用 Tooltip 的组合式。已知限制：不做视口边缘翻转。
  - **Progress 进度条**：`percent` 越界钳位到 0~100；三态配色；`role="progressbar"`
    - 完整 `aria-valuenow/min/max`，`label` 提供可访问名称；宽度过渡走令牌。

  ### 架构与修复
  - **抽取 `use-overlay-position` 组合式**：浮层定位（触发元素视口矩形 +
    打开期间跟踪滚动/缩放 + 关闭即解绑）收敛到一处，Tooltip / Popover 共用。
  - **修复 Tooltip 的真 bug**：触发元素从未绑定 `ref`，`update()` 拿不到矩形
    静默早退，浮层一直没有任何定位坐标（fixed 无坐标 = 停在视口左上角）。
    单测因不断言定位而全绿，已补定位断言兜底。
  - **修复 Alert 的图标路径重复**：形状数据抽到内部模块 `_internal/semantic-icon`，
    Alert / Message 共用，避免两处各写一份后悄悄走样。
  - **修复 smoke 的裸依赖扫描假阳性**：d.ts 的 JSDoc 使用示例（如
    `import { Message } from '@aura-vue/components'`）会被当成未声明的裸依赖误报；
    扫描前先剥块注释与行首行注释。

  ### 体积预算
  - components 全量 esm：14 组件 17.59 kB → 17 组件 21.95 kB，预算 20 → 25 kB。

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
