# 更新日志

Aura Vue 遵循 [语义化版本](https://semver.org/lang/zh-CN/) 与 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 规范。变更记录由 [changesets](https://github.com/changesets/changesets) 在开发过程中沉淀，发版时自动汇总。

## 0.1.0

首个可用版本，聚焦「基础组件 + 表单组件」两条主线。

### 新增

**组件**

| 组件 | 说明 |
| --- | --- |
| `Button` 按钮 | 四种类型、三档尺寸、加载态、禁用态、撑满整行 |
| `Input` 输入框 | 受控 / 非受控双轨、清空按钮、IME 中文输入守卫 |
| `Form` / `FormItem` 表单 | 声明式规则校验、provide/inject 自动接入控件 |
| `Select` 选择器 | 自定义下拉面板、Teleport 浮层定位、完整键盘导航 |
| `Switch` 开关 | 双轨模式、`role="switch"` 无障碍语义 |
| `Modal` 对话框 | 遮罩 / ESC / × 三种关闭路径、自定义底部与标题插槽 |

**能力**

- `useControllable` 组合式函数 — 统一实现受控 / 非受控双轨
- `Rule` 校验引擎 — 必填 / 长度 / 正则 / 自定义（含异步）四类规则
- Design Token 体系 — `--aura-*` 前缀的 CSS 变量，支持换肤与局部覆盖
- BEM 类名规范 — 基于 `prefixCls` 生成，稳定可预测

**工程**

- pnpm workspace Monorepo（`@aura/components` / `@aura/shared` / `@aura/icons`）
- Vite + `vite-plugin-dts` 构建，ES Module + `preserveModules` 产物
- Vitest 单元测试（正常 / 边界 / 异常三类用例）
- VitePress 文档站，含自定义 Demo 容器、暗色主题与 GitHub Pages 自动部署
- GitHub Actions：CI / Release（changesets）/ 文档部署三条流水线

### 已知限制

- 尚未适配 SSR（Modal、Select 依赖浏览器 API）
- Modal 不锁定页面滚动，需要时由使用方自行处理
- 组件矩阵尚不完整，布局、导航、数据展示类组件在规划中
- `@aura/icons` 为空占位包

## 版本约定

| 版本段 | 含义 |
| --- | --- |
| 主版本 | 不兼容的 API 变更 |
| 次版本 | 向下兼容的功能新增 |
| 修订号 | 向下兼容的问题修复 |

:::warning
当前处于 **v0.x** 早期开发阶段，API 可能随时调整，不建议在关键生产环境使用。
:::

## 如何贡献变更记录

提交 PR 前为你的改动生成一条 changeset：

```bash
pnpm changeset
```

按提示选择受影响的包、版本类型（major / minor / patch）并填写变更说明。发版时这些记录会被自动汇总为 CHANGELOG。
