# PageContainer 页面容器

后台页面的统一外壳。把「面包屑 + 标题区 + 内容区 + 底部操作栏」的标准页面结构固化下来，让每个列表页/详情页的开头长得一样。

## 何时使用

- 后台列表页、详情页的标准页面骨架
- 希望全站页面的标题区、内边距、分隔线保持一致
- 需要「面包屑 + 标题 + 右侧操作按钮」的固定组合

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 登录页、全屏看板等无标准布局的页面 | 不套容器，自行布局 |
| 嵌入式弹窗内容 | 弹窗自带布局，无需再包一层 |
| 极简页面（只有一段文字） | 直接写内容即可 |

## 基础用法

<demo src="./demos/page-container/basic.vue" />

## 结构

```
┌────────────────────────────────────────┐
│ 首页 / 项目管理 / 项目列表              │  ← 面包屑
├────────────────────────────────────────┤
│ ← 返回   项目列表          [发布] [刷新] │  ← 标题区 + extra 插槽
│          共 2 个项目                     │
├────────────────────────────────────────┤
│                                        │
│              默认插槽（内容区）          │
│                                        │
├────────────────────────────────────────┤
│              [取消] [保存]              │  ← footer 插槽（可选）
└────────────────────────────────────────┘
```

## 面包屑与返回

- `breadcrumbs` 传数组，最后一项不传 `link` 即为「当前位置」（不可点击）
- `back` 显示返回按钮，点击时 `emit('back')`
- 传了 `backLink` 时组件会直接做原生跳转；否则完全交给外部通过 `@back` 处理路由（推荐配合 `router.back()`）

## 内容区

- `card: true`（默认）给内容区加白底卡片，适合表格、描述列表
- `card: false` 内容直接平铺，适合自定义布局
- `loading` 开启时内容区进入 loading 遮罩
- `padding` 控制左右内边距，默认 16

## 底部操作栏

`:fixedFooter="true"` 让 footer 吸底——表单较长的编辑页很实用，用户滚到哪都能点到保存。

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 页面标题 | `string` | `''` |
| subTitle | 副标题 / 页面说明 | `string` | `''` |
| breadcrumbs | 面包屑 | `PageBreadcrumb[]` | - |
| back | 显示返回按钮 | `boolean` | `false` |
| backLink | 返回跳转地址 | `string` | `''` |
| card | 内容区包卡片 | `boolean` | `true` |
| loading | 内容区 loading | `boolean` | `false` |
| fixedFooter | 底部操作栏吸底 | `boolean` | `false` |
| padding | 左右内边距 | `number \| string` | `16` |
| divider | 标题区与内容区之间显示分隔线 | `boolean` | `true` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 点击返回按钮 |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `extra` | 标题右侧（常放操作按钮） |
| `default` | 页面正文 |
| `footer` | 底部操作栏 |

### PageBreadcrumb

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| text | 展示文案 | `string` |
| link | 跳转链接，缺省则该项不可点击 | `string` |

### 类型导出

```ts
import type {
  PageBreadcrumb,
  PageContainerProps,
  PageContainerSlots
} from '@aura/business';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-page-container` | 根节点 |
| `.aura-page-container-breadcrumb` | 面包屑 |
| `.aura-page-container-header` | 标题区 |
| `.aura-page-container-title` | 标题 |
| `.aura-page-container-subtitle` | 副标题 |
| `.aura-page-container-extra` | 标题右侧 |
| `.aura-page-container-body` | 内容区 |
| `.aura-page-container-footer` | 底部操作栏 |

## 相关文档

- [ProTable 高级表格](/components/pro-table) — 放进内容区的典型内容
- [Description 描述列表](/components/description) — 详情页内容
- [ProForm 高级表单](/components/pro-form) — 配合吸底 footer 的编辑页
