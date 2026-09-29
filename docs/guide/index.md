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
- **配置驱动业务组件** — `@aura/business` 用一份 schema 同时描述表格列、查询区与表单字段，
  把后台页面「查询 + 表格 + 分页」「新增/编辑/查看」的模板重复收敛掉

## 架构

Aura Vue 使用 pnpm workspaces 管理 Monorepo，按职责拆分为独立包：

```
aura-vue/
├── packages/
│   ├── components/   # @aura/components — 基础组件（零依赖自研）
│   ├── business/     # @aura/business   — 业务组件（基于 Element Plus 二次封装）
│   ├── shared/       # @aura/shared     — 内部工具（构建期被内联，不单独发布）
│   └── icons/        # @aura/icons      — 图标资源包（占位，未发布）
├── docs/             # @aura/docs — VitePress 文档站
├── scripts/          # 产物冒烟测试等交付级校验脚本
└── .github/          # CI / Release / Docs 部署工作流
```

依赖方向是单向的：`shared` → `components` → `business`。

| 包名               | 描述                                                                      | 运行时依赖            | 发布状态   |
| ------------------ | ------------------------------------------------------------------------- | --------------------- | ---------- |
| `@aura/components` | 基础组件：Button / Input / Form / Select / Switch / Modal                 | `vue`                 | 可发布     |
| `@aura/business`   | 业务组件：ProTable / ProForm / ProModalForm / Description / PageContainer | `vue`、`element-plus` | 可发布     |
| `@aura/shared`     | 内部工具（`prefixCls`、`classNames`）                                     | -                     | 不单独发布 |
| `@aura/icons`      | 图标资源（占位，后续迁移）                                                | -                     | 未发布     |

## 组件总览

### 基础组件（`@aura/components`）

| 分类 | 组件                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- |
| 通用 | [Button 按钮](/components/button)、[Input 输入框](/components/input)                                  |
| 表单 | [Form 表单](/components/form)、[Select 选择器](/components/select)、[Switch 开关](/components/switch) |
| 反馈 | [Modal 对话框](/components/modal)                                                                     |

### 业务组件（`@aura/business`）

| 组件                                                 | 解决的问题                                       |
| ---------------------------------------------------- | ------------------------------------------------ |
| [ProTable 高级表格](/components/pro-table)           | 列表页的「查询 + 表格 + 分页」三件套             |
| [ProForm 高级表单](/components/pro-form)             | 配置驱动的表单，新增/编辑/查看三态复用一份定义   |
| [ProModalForm 弹窗表单](/components/pro-modal-form)  | 弹窗表单的提交时序（先校验、后请求、失败不关闭） |
| [Description 描述列表](/components/description)      | 详情页字段展示，支持分组与嵌套取值               |
| [PageContainer 页面容器](/components/page-container) | 面包屑 + 标题区 + 内容区 + 吸底操作栏的页面外壳  |

## 浏览器兼容性

| 浏览器  | 版本 |
| ------- | ---- |
| Chrome  | 80+  |
| Firefox | 80+  |
| Safari  | 14+  |
| Edge    | 80+  |

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
