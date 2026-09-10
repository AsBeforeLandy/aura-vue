# Description 描述列表

详情页的字段展示组件。用一份 `items` 配置描述「有哪些字段、怎么展示」，替代手写一堆 `label: value` 的标签结构。

`valueType` 的取值与 [ProTable](/components/pro-table)、[ProForm](/components/pro-form) 保持一致，降低记忆成本。

## 何时使用

- 详情页 / 查看弹窗里集中展示一批只读字段
- 字段数量多、需要按 2~3 列排布
- 需要把字段按业务语义分组（基本信息 / 客户信息 / 备注…）

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 只有零星两三个字段 | 直接用普通标签结构，不必引入组件 |
| 需要展示可编辑内容 | [ProForm](/components/pro-form) 的只读模式 |
| 数据是列表形态而非单条记录 | [ProTable](/components/pro-table) |

## 基础用法

支持 `groups` 分组，也支持扁平的 `items`：

<demo src="./demos/description/basic.vue" />

## 两种写法

### 扁平 items

```ts
const items: DescriptionItem[] = [
  { key: 'orderNo', label: '订单号' },
  { key: 'amount', label: '金额', valueType: 'money' }
];
```

### 分组 groups

分组之间会渲染分隔标题，适合字段较多的详情页：

```ts
const groups: DescriptionGroup[] = [
  { title: '订单信息', items: [/* ... */] },
  { title: '客户信息', items: [/* ... */] }
];
```

`items` 与 `groups` 二选一，同时传时以 `groups` 为准。

## 取值路径

`key` 支持 `a.b` 形式的嵌套路径，直接从 `data` 中按路径取值：

```ts
{ key: 'customer.name', label: '客户姓名' }
// data = { customer: { name: '李振虎' } } → 显示「李振虎」
```

## 展示类型

| valueType | 效果 |
| --- | --- |
| `text` | 原样输出（默认） |
| `tag` | 渲染为 `ElTag`，配色由 `valueEnum` 决定 |
| `date` | 格式化为 `YYYY-MM-DD` |
| `datetime` | 格式化为 `YYYY-MM-DD HH:mm:ss` |
| `money` | 千分位分隔 |

`date` / `datetime` 可用 `dateFormat` 自定义模板。

## 空值与隐藏

- `emptyText`：单个字段的空值占位；`emptyText`（组件级）可设全局占位，默认 `-`
- `hidden`：条件隐藏某个字段（不进 DOM）

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 描述项（与 `groups` 二选一） | `DescriptionItem[]` | - |
| groups | 分组描述项（与 `items` 二选一） | `DescriptionGroup[]` | - |
| data | 数据源 | `Record<string, unknown>` | `{}` |
| columns | 每行几列 | `number` | `2` |
| direction | 标签与值的方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| bordered | 是否显示边框 | `boolean` | `false` |
| labelWidth | 标签列宽度 | `number \| string` | `110` |
| emptyText | 全局空值占位 | `string` | `'-'` |
| title | 列表标题 | `string` | `''` |
| size | 尺寸 | `'large' \| 'default' \| 'small'` | `'default'` |

### DescriptionItem

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| key | 字段名 / 取值路径（支持 `a.b`） | `string` |
| label | 标签文案 | `string` |
| span | 占据列数 | `number` |
| valueType | 展示形态 | `'text' \| 'tag' \| 'date' \| 'datetime' \| 'money'` |
| valueEnum | tag 的取值到文案/颜色映射 | `Record<string, { text, color }>` |
| dateFormat | 日期格式化模板 | `string` |
| emptyText | 该字段的空值占位 | `string` |
| hidden | 是否隐藏 | `boolean` |
| render | 自定义渲染（逃生舱） | `({ value, item }) => VNodeChild` |

### 类型导出

```ts
import type {
  DescriptionItem,
  DescriptionGroup,
  DescriptionDirection,
  DescriptionProps
} from '@aura/business';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-description` | 组件根节点 |
| `.aura-description-group` | 分组容器 |
| `.aura-description-group-title` | 分组标题 |
| `.aura-description-item` | 单个字段 |
| `.aura-description-label` | 标签 |
| `.aura-description-value` | 值 |

## 相关文档

- [ProTable 高级表格](/components/pro-table) — 列表数据展示
- [ProForm 高级表单](/components/pro-form) — 可在只读模式下复用为详情展示
- [PageContainer 页面容器](/components/page-container) — 把一个 Description 装进标准详情页外壳
