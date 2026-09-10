# Aura Vue

Aura Vue 是一套基于 **Vue 3 + TypeScript** 的轻量组件库，采用 pnpm Monorepo 架构，聚焦"基础组件 + 表单组件"两条主线，为后台管理系统与内部工具的开发而生。

## 核心特性

- **Vue 3 Composition API** — 全量 `<script setup>` 编写，类型推导完整
- **受控 / 非受控双轨** — `v-model` 与 `default-value` 并存，一套组件适配两种心智模型
- **Less 独立样式** — 样式与逻辑分离，每个组件独立 Less 文件，支持按需引入与变量覆盖
- **BEM 命名规范** — `aura-button`、`aura-button--primary`，类名可预测、可覆盖
- **Design Token 驱动** — 全部设计变量以 `--aura-` 前缀的 CSS 变量承载，主题切换零成本
- **Tree-shaking 友好** — ES Module + `preserveModules` 产物，未使用的组件不进业务包
- **表单校验内建** — Form / FormItem 提供声明式规则校验，控件自动接入校验钩子

## 架构

Aura Vue 使用 pnpm workspaces 管理 Monorepo，按职责拆分为独立包：

```
aura-vue/
├── packages/
│   ├── components/   # @aura/components — 组件库主体（6 个组件）
│   ├── shared/       # @aura/shared — 公共工具（prefixCls、classNames）
│   └── icons/        # @aura/icons — 图标资源包（规划中）
├── docs/             # @aura/docs — VitePress 文档站
└── .github/          # CI / Release / Docs 部署工作流
```

| 包名 | 描述 | 依赖 |
| --- | --- | --- |
| `@aura/components` | 组件库主体，含 Button / Input / Form / Select / Switch / Modal | `@aura/shared` |
| `@aura/shared` | 工具函数集（`prefixCls`、`classNames`） | - |
| `@aura/icons` | 图标资源（占位，后续迁移） | - |

## 组件总览

| 分类 | 组件 |
| --- | --- |
| 通用 | [Button 按钮](/components/button)、[Input 输入框](/components/input) |
| 表单 | [Form 表单](/components/form)、[Select 选择器](/components/select)、[Switch 开关](/components/switch) |
| 反馈 | [Modal 对话框](/components/modal) |

## 浏览器兼容性

| 浏览器 | 版本 |
| --- | --- |
| Chrome | 80+ |
| Firefox | 80+ |
| Safari | 14+ |
| Edge | 80+ |

> 组件库依赖 CSS Variables 实现主题能力，请确保运行环境支持原生 CSS 变量。

## 版本

当前版本：**0.1.0**（早期开发阶段）

:::warning
v0.x 阶段 API 可能随时变动，不建议在生产环境使用。
:::

## 下一步

- [快速开始](/guide/quick-start) — 5 分钟接入一个按钮
- [安装](/guide/installation) — 环境要求与包管理器安装
- [主题定制](/guide/theme) — 覆盖 Design Token 换肤
- [组件设计规范](/guide/design) — 命名、受控模式与 API 约定
