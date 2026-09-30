---
name: aura-vue-component-dev
description: aura-vue 组件库本仓库的组件开发规范流程。在 aura-vue 仓库内新建组件、修改或扩展现有组件（packages/components、packages/business）、从 React 版 aura 仓库移植组件、补组件测试 / 文档 / demo、把组件接入包导出时必须使用。当用户提到"新增 / 实现 / 仿写 / 移植某组件"、"给某组件加 prop"、"补测试、写文档、加 demo"、"按 Aura 规范"、"通过 pnpm verify"时触发——它把仓库门禁（lint / typecheck / coverage / size / attw / api-surface / smoke）背后的规范编排成可执行流程，确保新组件代码一次通过验证。
---

# Aura Vue 组件开发规范流程

本 skill 约束在 aura-vue 仓库内开发组件的方式。目标只有一个：**新组件代码一次通过 `pnpm verify` 全链路门禁**，不需要返工。

条款的完整背景在 `docs/guide/design.md`（命名 / 受控双轨 / 令牌等设计规范）。该文档是唯一权威，本 skill 不复制其全文，只做流程编排与高频规则速查；如有冲突，以权威文档为准。

姊妹仓库 `/Users/landy/GitHub-program/aura` 是本项目的 React 版（antd + dumi），结构性决策以它为参照；从它移植组件见 Step 8。

## 流程总览

新建组件按 8 步走。每步都标注了硬规则——违反任何一条都会被门禁或评审打回：

1. **定位**：选包 + 选参照组件
2. **脚手架**：组件目录 5 件套
3. **类型**：types.ts
4. **实现**：Xxx.vue
5. **样式**：style/index.less
6. **测试**：**tests**/
7. **文档**：docs/business/ 页 + demo + 侧边栏
8. **导出与验证**：barrel / api-surface / pnpm verify / 提交

写代码前先读 [references/templates.md](references/templates.md)：五个文件的完整骨架从仓库现有组件（description / pro-table）提炼而来，直接复制改造，**不要凭空重写**——凭空写的命名、注释、props 结构几乎必然偏离仓库风格。

## Step 1 定位：选包与选参照

| 包                 | 定位                          | 依赖约束                                                              | 参照组件                                    |
| ------------------ | ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `@aura/components` | 通用 UI 原子组件（不依赖 EP） | 只依赖 `@aura/shared`、`vue`；**不得引入 element-plus**               | `input` / `select` / `form` / `modal`       |
| `@aura/business`   | 基于 Element Plus 二次封装    | 可用 element-plus（peer）+ `@element-plus/icons-vue` + `@aura/shared` | `pro-form` / `pro-table` / `pro-modal-form` |

规则：

- 动手前**先完整读 1~2 个参照组件的全部文件**（vue / types / index / less / 对应测试与文档页）。命名、JSDoc 注释、测试断言风格、文档结构全部向它看齐，不发明新风格。
- 组件目录名用 kebab-case；组件文件 PascalCase（`ProTable.vue`）；导出名 PascalCase；`defineOptions({ name: 'AXxx' })` 统一带 `A` 前缀。
- 选不准包时问一句：这个组件去掉业务语境还成立吗？成立 → components；是 Element Plus 组件的固定业务封装 → business。

## Step 2 脚手架：组件目录 5 件套

```text
packages/<pkg>/src/<kebab-case-name>/
├── Xxx.vue           # 组件实现：渲染 + 交互
├── types.ts          # Props / Emits / 公开类型 + 运行时 props 对象
├── index.ts          # 桶导出：组件 + 全部公开类型 + xxxProps
├── style/index.less  # 样式，与逻辑分离
└── utils.ts          # （复杂组件）纯函数层，不得依赖 vue 响应式
```

- 与 React 版不同，测试**不放在组件目录**，集中在 `packages/<pkg>/__tests__/<name>.test.ts`；文档页在顶层 `docs/`（React 版 dumi 是组件目录内 index.md，Vue 版是独立文档站）。
- 纯逻辑（日期、树运算、排序参数组装）抽到 `utils.ts`：**不得依赖 vue**（保证不渲染组件就能单测）——参照 `pro-table/utils.ts`。
- 单文件 `Xxx.vue` 以 **400 行为软上限**：超出先把纯逻辑抽入 `utils.ts`，再考虑拆子组件。

## Step 3 类型 types.ts

必须遵守（模板见 references/templates.md）：

- **Props**：`export type XxxProps = { ... }`，每个 prop 写 JSDoc，有默认值的在运行时对象里体现；**同时导出运行时 props 对象** `export const xxxProps = { ... } as const`（`PropType` 标注复杂类型），组件里 `defineProps(xxxProps)`——运行时对象是 `businessComponents` 插件映射与 api-surface 门禁的数据来源，只写类型化 defineProps 会挂门禁。
- **Emits**：`export interface XxxEmits { (e: 'change', value: string): void }` 或 `export const xxxEmits = {} as const`（无事件时），组件里 `defineEmits<XxxEmits>()`。
- 受控组件用 Vue 惯例：`modelValue` + `update:modelValue`；非受控给 `defaultValue`。双轨实现复用 `@aura/components/src/composables/use-controllable`（参照 input / select）。
- 暴露实例方法：`export interface XxxInstance { reload(): void; ... }` + `defineExpose<XxxInstance>({ ... })`（参照 ProTable）。
- **TypeScript**：禁 `any`——需要宽类型用 `unknown` 并在使用处收窄；确需放宽的（如 EP 控件 v-model 值域）在行内注释说明原因并加 eslint-disable。

## Step 4 实现 Xxx.vue

- `defineOptions({ name: 'AXxx' })`；`const props = defineProps(xxxProps)`。
- 根元素类名：`prefixCls('xxx')` → `.aura-xxx`，外部 `class` / `style` 由 Vue 自动透传（单根组件无需手动合并）。
- Element Plus 组件**显式按需引入**（从 `'element-plus'` 具名导入），图标从 `'@element-plus/icons-vue'`；样式由文档站主题统一按需引入（`scripts/smoke.mjs` 自动校验 demo 用到的 EP 组件都有样式入口，新用 EP 组件后要往 `docs/.vitepress/theme/index.ts` 的 EP 样式清单里补一行）。
- **可访问性**：可交互元素必须有可访问名称与键盘支持；EP 组件自带的语义（button / dialog role）不要破坏。
- **性能红线**：拖拽 / 滚动等高频事件必须用 `requestAnimationFrame` 按帧合并，pointerup 时补提交最后一帧；列表热路径查找用 `Set` / `Map` 而非 `includes`；下传给子组件的对象 / 回调保持引用稳定（`computed` / 模板外提取）。
- 组件库代码不向控制台输出（`no-console`，warn/error 除外）。

## Step 5 样式 style/index.less

- **只用设计令牌**：颜色、圆角、间距一律 `var(--aura-*)`；**禁止硬编码色值**（hex / rgb / rgba）、禁止 `!important`、禁止 `color-mix` 派生。可用令牌见 `packages/components/src/style/base.less`（单一事实来源）；业务包样式带 fallback（`var(--aura-bg, #fff)`）是既有惯例，保持即可。
- 命名遵循 BEM（与 React 版 business 包的单横线风格不同，这里用标准 BEM，见 design.md）：

  | 类型               | 写法                       | 示例                    |
  | ------------------ | -------------------------- | ----------------------- |
  | Block              | `aura-{block}`             | `aura-pro-table`        |
  | Modifier（双横线） | `aura-{block}--{modifier}` | `aura-input--disabled`  |
  | Element（单横线）  | `aura-{block}-{element}`   | `aura-pro-table-search` |

- 过渡用 `--aura-duration-*` / `--aura-easing` 令牌；keyframes 只动 `opacity` / `transform` 这类可合成属性；适配 `prefers-reduced-motion`（参照现有组件的 reduce 覆盖）。
- 暗色差异写在 `html.dark { ... }` 块内（全部走令牌，无差异可不写）。
- 令牌不够用时在 `base.less` 新增，不要在组件里现场派生。

## Step 6 测试 **tests**/<name>.test.ts

- **三类用例缺一不可**：正常（默认渲染 / 受控往返，用例名 `正常：...`）、边界（空值 / 极值 / disabled / 阈值）、异常（非法输入 / 回调报错）——参照 `business-components.test.ts` 的命名与断言风格。
- `@vue/test-utils` 的 `mount` + `happy-dom`；**vitest 配置里已 inline element-plus**（pnpm 严格布局下 EP 的裸依赖解析问题，别改 vitest.config.ts 的这段）。
- Teleport 弹层（Modal / Dialog）用例必须 `afterEach(() => { document.body.innerHTML = '' })` 清理。
- **断言 DOM 行为与暴露方法，不 mock 渲染层**；happy-dom 没有布局引擎，ElTable 渲染不出 `<td>`——这类场景通过 `defineExpose` 的方法（如 `getData()`）断言数据链路，DOM 渲染由文档站 e2e 兜底。
- 覆盖率是全局硬门禁（语句 80 / 分支 84 / 函数 65 / 行 80，全包一起算）：新组件分支覆盖不足会拖垮全局并挂掉 `pnpm verify`。**不要**把逻辑写进 demo 凑覆盖率。

## Step 7 文档：docs/business/ + 侧边栏

- 文档页 `docs/business/<kebab>.md`，章节结构照抄参照组件：`# 标题` → `## 何时使用` → `## 何时不用`（表格：场景 / 应该用）→ `## 基础用法` 等（每节先文字说明再 `<demo src="./demos/xxx/basic.vue" />`）→ `## API`（Props / Events / 类型导出 / CSS 类名 / 相关文档）。
- demo 放 `docs/business/demos/<kebab>/`，自包含可运行，`<script setup lang="ts">` + 从 `@aura/business` 具名导入；命名按语义（`basic.vue` / `controlled.vue`）。
- **侧边栏是手工维护的**（与 React 版 dumi 自动生成不同）：新组件要在 `docs/.vitepress/config.mts` 的 `/business/` 侧边栏加条目；demo 里新用 EP 组件要补 `docs/.vitepress/theme/index.ts` 的 EP 按需样式（smoke 会拦截）。
- demo 引用走 `<demo src="./demos/xxx/basic.vue" />`（demo-plugin 编译期展开，路径相对当前 .md）。

## Step 8 从 React 版移植组件

移植 `/Users/landy/GitHub-program/aura/packages/business/src/<name>/` 时：

1. **先完整读 React 版全部文件**（tsx / less / test / demo / utils），行为以它为唯一事实标准——目标是「功能完全一致」，不是「借个思路重写」。
2. **API 做 Vue 化映射**，语义保持不变：`value` + `onChange` → `modelValue` + `update:modelValue`；`onXxx` 回调 → `emit('xxx')`；`render?: () => ReactNode` 逃生舱 → `VNodeChild` 渲染函数或 slot；`className` / `style` → Vue 自动透传；`forwardRef` 暴露 → `defineExpose`。
3. **antd 控件映射到 Element Plus 对应物**（Form / Select / DatePicker / Table / Pagination 等），行为差异（如校验时序、弹层挂载）按 EP 的方式实现，但对外契约（props 名、值结构、事件时序）与 React 版保持一致。
4. `utils.ts` 纯函数尽量**原样移植**（不依赖 React 的都能直接用），测试用例逐条对应移植，保证覆盖率意图不缩水。
5. 样式类名向 Vue 的 BEM 风格对齐（React 版 business 是单横线修饰符，Vue 版是双横线），视觉令牌不变。
6. 移植完成后按 Step 2~7 走完五件套与门禁；React 版有而 Vue 版职责不同的小件（如 antd 主题桥接 `BusinessProvider`）在提交信息与文档里说明 Vue 侧的对应实现（token-bridge）。

## Step 9 导出与验证

1. **桶导出**：`packages/business/src/<name>/index.ts` 导出组件与全部公开类型；再接入 `packages/business/src/index.ts` 的桶导出与 `businessComponents` 映射 + `AuraBusiness` 插件（`index-plugin.test.ts` 会校验）。
2. **api-surface 快照**：新导出后跑 `pnpm api-surface:update` 更新 `packages/<pkg>/api-surface.json`，门禁对比快照。
3. **体积预算**：`pnpm build:business && pnpm size`，确认 `size-limit` 预算未超（根 package.json；超过余量一半先优化）。
4. **内循环用 `pnpm verify:fast`**；**推送前跑完整 `pnpm verify`**（含覆盖率阈值与 attw）。
5. **提交信息**用 Conventional Commits，scope 用包短名：`feat(business): 新增 SearchForm 查询表单`；主题行 ≤ 100 字符，可中文。
6. 门禁细节见根 package.json scripts 与 `.github/workflows/ci.yml`——不要再造检查清单。

## Element Plus 已知坑（本仓库实测）

| 坑                                                     | 处理                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `formRef.validate()` 对「未声明规则」的字段一律判失败  | 只校验声明了 rules 的字段（参照 ProForm），或无规则组件直接不调 validate（参照 SearchForm） |
| happy-dom 下点击 submit 按钮不触发 form 的 submit 事件 | 表单组件的提交按钮用 `@click.prevent` 走 click 通道，`@submit` 仅作回车提交兜底             |
| ElSelect 的选项渲染在 teleport 弹层内且懒挂载          | 单测断言 `findAllComponents({ name: 'ElOption' })`，别查 DOM 文本                           |
| ElTable 在 happy-dom 无布局引擎，渲染不出 `<td>`       | 通过 `defineExpose` 的方法断言数据链路，DOM 渲染交给文档站 e2e                              |
| `v-loading` 指令不会随按需引入自动注册                 | `import { vLoading } from 'element-plus'` 后在 setup 中使用（参照 ProTable / PdfViewer）    |

## 移植 / 新增组件的另外四个坑

1. **新组件样式必须加进 `src/style/index.less` 入口**。文档站主题从源码入口汇总样式；demo 引的是包的 dist（JS 不带样式，`cssCodeSplit: false`），漏加入口 = 文档站组件裸奔而单测全绿。
2. **改了组件源码后，先 `pnpm build:business` 再 `pnpm docs:build`**。demo 引 dist，不重建业务包时文档站跑的是旧产物，「明明修了却没生效」基本都是这个原因。
3. **React 的 `useLayoutEffect(cb, deps)` 不能机械对应成 `watch(..., { immediate: true, flush: 'post' })`**——immediate 首跑在 setup 阶段同步执行，早于模板 ref 就绪。用 `onMounted(cb)` 覆盖首次 + `watch(deps, cb, { flush: 'post' })` 覆盖后续（参照 YearCalendar 的标签测量）。
4. **React 的一次渲染语义在 Vue 里可能拆成两层**：`onChange` 带双参 → `update:modelValue`（v-model 契约）+ `change`（完整语义）两个事件；受控实例 prop（如 antd 的 `form`）→ `defineExpose` 暴露内部 ref。

## 红线速查（历史上最容易踩）

| 禁止                                               | 改为                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| 硬编码色值 / `!important`（组件样式）/ `color-mix` | `var(--aura-*)`；缺令牌就在 base.less 补                         |
| 只写类型化 defineProps 不导出运行时 props 对象     | `types.ts` 里同时导出 `xxxProps`（api-surface 门禁依赖）         |
| `any`                                              | `unknown` + 收窄（确需放宽加行内注释与 eslint-disable）          |
| 漏导出 Props 类型或漏 barrel 导出                  | 组件与全部公开类型都从 `index.ts` 导出，再跑 api-surface:update  |
| 只写 happy path 测试                               | 正常 / 边界 / 异常三类                                           |
| mock 渲染层、断言实现细节                          | 断言 DOM 行为与 defineExpose 方法                                |
| demo 里塞业务逻辑凑覆盖率                          | 逻辑进组件或 `utils.ts` 并直测                                   |
| 高频事件直接改状态                                 | `requestAnimationFrame` 按帧合并 + pointerup 补提交              |
| 新用 EP 组件不补主题样式入口                       | `docs/.vitepress/theme/index.ts` EP 样式清单补一行（smoke 拦截） |
| 改了导出不更新 api-surface 快照                    | `pnpm api-surface:update`                                        |
| 凭空发明组件风格                                   | 先读参照组件全部文件，用 references/templates.md 骨架            |
| 只跑 `pnpm test` 就提交                            | 内循环 `verify:fast`，推送前完整 `verify`                        |
