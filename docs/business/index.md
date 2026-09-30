# 业务组件

`@aura/business` 是基于 **Element Plus** 二次封装的业务组件层，专注 B 端中后台（OA / ERP / 管理后台）高频场景，把「查、翻、展、填」这类重复劳动收敛成开箱即用的组件。

## 为什么需要它

`@aura/components` 聚焦基础组件，而中后台页面真正耗费工时的往往是**页面级骨架**与**列表页范式**。业务组件层基于 Element Plus 补齐这部分能力，把「搜索区 + 表格 + 分页」「表单 + 弹窗 + 提交时序」这类固定组合收敛成一份配置，同时与基础组件共用同一套 `--aura-*` 设计令牌，保证两套组件混用时不割裂。

## 安装

:::code-group

```bash [pnpm]
# pnpm（推荐）
pnpm add @aura/business
```

```bash [yarn]
# yarn
yarn add @aura/business
```

```bash [npm]
# npm
npm install @aura/business
```

:::

`element-plus`（>= 2.8）与 `vue`（>= 3.4）为 peerDependencies，需由使用方提供。

## 快速开始

```ts
import { ProTable } from '@aura/business';
import type { ProTableColumn, ProTableRequest } from '@aura/business';
import '@aura/business/style.css';

interface UserRow {
  id: number;
  name: string;
}

const columns: ProTableColumn<UserRow>[] = [
  { dataIndex: 'name', title: '姓名', search: true },
  { dataIndex: 'createdAt', title: '创建时间', valueType: 'date' },
];

const request: ProTableRequest<UserRow> = async ({ current, pageSize }) => {
  const { data } = await fetchUsers({ current, pageSize });
  return { data: data.list, total: data.total };
};
```

```vue
<template>
  <ProTable :columns="columns" :request="request" row-key="id" />
</template>
```

## 组件一览

| 组件                                               | 说明                                                     |
| -------------------------------------------------- | -------------------------------------------------------- |
| [ProTable 高级表格](/business/pro-table)           | 搜索 + 表格 + 分页一体化，columns 同时驱动列与查询区     |
| [ProForm 高级表单](/business/pro-form)             | items 驱动的配置表单，新增 / 编辑 / 查看三态复用一份定义 |
| [ProModalForm 弹窗表单](/business/pro-modal-form)  | ProForm + ElDialog，核心语义为「先请求后关闭」           |
| [Description 描述列表](/business/description)      | 详情页字段展示，支持分组与 a.b 嵌套取值                  |
| [PageContainer 页面容器](/business/page-container) | 面包屑 + 标题区 + 内容区 + 可选吸底 footer 的页面外壳    |

## 设计令牌与样式

业务组件样式提供单文件产物，一次引入即可：

```ts
import '@aura/business/style.css';
```

两点注意：

- 该文件**覆盖了 Element Plus 的内部类**（如 `.el-table th.el-table__cell`、`.el-dialog__body`），必须保证它晚于 Element Plus 自身样式引入，否则会被反覆盖。
- 本包所有样式消费 `var(--aura-*)` 设计令牌且**不设 fallback**。令牌与 `@aura/components` 共用同一套（主色 `--aura-color-primary: #7c3aed` 紫罗兰），由 `@aura/components` 的 `base.less` 定义；令牌未加载时颜色、圆角、字号会整体失效。
