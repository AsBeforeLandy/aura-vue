# ProTable 高级表格

配置驱动的表格。把「列定义 + 查询表单 + 分页 + 工具条」收敛成一份 `columns` 配置，用声明替代重复的模板代码，专门解决 B 端后台「每个列表页都要手写一遍搜索区 + 表格 + 分页」的重复劳动。

基于 [Element Plus](https://element-plus.org/) 的 `ElTable` 二次封装。

## 何时使用

- 后台列表页：需要「查询 + 表格 + 分页」三件套的常规场景
- 列较多、需要「列设置」让用户自定义显隐时
- 多列表页写法需要统一，降低团队间的风格差异

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 纯展示、无分页无查询的静态小表 | 直接 `ElTable`，无需引入这层抽象 |
| 需要复杂的单元格合并、树形展开等深度定制 | 直接 `ElTable` + 自定义 `cellRender` 可能更直观 |
| 数据已在父组件拿好、仅做渲染 | 传 `data` 即可，不必强行包一层 `request` |

## 基础用法

`request` 就绪后，组件接管分页、查询、刷新、loading 的完整时序，你只需要关心「按参数取数」这一件事：

<demo src="./demos/pro-table/basic.vue" />

## 两种数据模式

| 模式 | 触发条件 | 适用 |
| --- | --- | --- |
| 请求模式 | 传 `request` | 标准列表页，组件托管分页与查询 |
| 受控模式 | 只传 `data` | 本地数据，或外层已完成请求 |

受控模式不会发起任何请求，也不会接管分页——`pagination` 通常直接关掉：

<demo src="./demos/pro-table/local-data.vue" />

## 列配置

`ProTableColumn` 的两个类型字段是**两套独立语义**，这是最容易踩的点：

| 字段 | 作用域 | 取值 |
| --- | --- | --- |
| `valueType` | **表格展示**单元格长什么样 | `text` / `tag` / `date` / `datetime` / `money` / `index` |
| `searchType` | **查询区**用什么控件 | `text` / `select` / `date` / `dateRange` / `number` |

也就是说：状态列可以用 `tag` 展示、用 `select` 查询；创建时间列用 `date` 展示、用 `dateRange` 做区间查询。二者互不干扰。

### 常用列属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `key` / `title` | 字段名 / 列标题 | 必填 |
| `width` / `minWidth` | 列宽 / 最小列宽 | - |
| `fixed` | 固定列（`left` / `right`） | - |
| `sortable` | 是否可排序 | `false` |
| `align` | 对齐方式 | `left` |
| `ellipsis` | 超长省略并显示 tooltip | `false` |
| `hideInTable` | 不显示在表格中（但可作查询项） | `false` |
| `hideInSearch` | 不出现在查询区 | `false` |
| `cellRender` | 自定义单元格渲染（逃生舱） | - |

### 枚举与颜色

`valueEnum` 同时驱动两件事：`tag` 类型的文字与颜色、`select` 查询项的选项（未显式给 `searchOptions` 时的回退来源）。

```ts
{
  key: 'status',
  title: '状态',
  valueType: 'tag',
  searchType: 'select',
  valueEnum: {
    active: { text: '启用', color: 'success' },
    pending: { text: '待审核', color: 'warning' },
    disabled: { text: '停用', color: 'info' }
  }
}
```

## 查询区

- 查询项数量超过 `searchSpan`（默认 3）时默认折叠，点击箭头展开
- `searchDefaultCollapsed` 可改为默认展开
- 单个查询项可用 `searchFullWidth` 让它独占一行（适合日期区间）

## 工具条

`toolbar` 可分别开关三块能力：

```ts
toolbar: { reload: true, density: true, columnSetting: true }
```

| 按钮 | 作用 |
| --- | --- |
| 刷新 | 重新拉取当前页，保留查询条件与页码 |
| 密度 | 切换 `large` / `default` / `small` 行高 |
| 列设置 | 勾选列显隐（勾选结果可通过 `setHiddenColumns` 回填做持久化） |

## 实例方法

通过 `ref` 拿到组件实例后可编程控制：

```ts
const tableRef = ref<ProTableInstance>();

tableRef.value?.reload();            // 刷新当前页
tableRef.value?.reloadAndReset();    // 回到第一页并刷新（查询场景）
tableRef.value?.getSelectedRows();   // 获取选中行
tableRef.value?.getSearchValues();   // 获取当前查询条件
tableRef.value?.setSearchValues({ name: 'Landy' }); // 设置查询条件（不触发请求）
```

| 方法 | 说明 |
| --- | --- |
| `reload()` | 重新加载当前页 |
| `reloadAndReset()` | 回到第 1 页并重新加载 |
| `clearSelection()` | 清空行选择 |
| `getSearchValues()` | 获取当前查询表单值 |
| `setSearchValues(values)` | 设置查询表单值（不触发请求） |
| `getData()` | 获取当前表格数据 |
| `getSelectedRows()` | 获取当前选中的行 |
| `setHiddenColumns(keys)` | 恢复用户列显隐偏好 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `selection-change` | 行选择变化，参数为选中行数组 |
| `page-change` | 分页变化，参数 `{ current, pageSize }` |
| `search` | 查询条件变化（点击查询/重置后） |
| `loaded` | 数据加载完成，参数 `{ data, total }` |
| `error` | 加载失败（`request` 抛错），参数为错误对象 |

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列配置 | `ProTableColumn[]` | 必填 |
| request | 数据请求函数 | `(params) => Promise<{ data, total }>` | - |
| data | 受控数据（`request` 缺省时生效） | `T[]` | - |
| rowKey | 行唯一键 | `string` | `'id'` |
| search | 是否显示查询区 | `boolean` | `true` |
| searchDefaultCollapsed | 查询区默认折叠 | `boolean` | `true` |
| searchSpan | 查询区一行几项 | `number` | `3` |
| pagination | 分页配置，`false` 关闭 | `ProTablePagination \| false` | `{ current: 1, pageSize: 10 }` |
| toolbar | 工具条配置 | `ProTableToolbarConfig` | 三项全开 |
| size | 表格密度 | `'large' \| 'default' \| 'small'` | `'default'` |
| rowSelection | 显示行选择列 | `boolean` | `false` |
| stripe | 斑马纹 | `boolean` | `false` |
| border | 显示边框 | `boolean` | `false` |
| emptyText | 空数据文案 | `string` | `'暂无数据'` |
| title | 标题（工具条左侧） | `string` | `''` |
| clearOnReload | 请求前清空旧数据 | `boolean` | `false` |

### request 入参

```ts
interface ProTableRequestParams {
  current: number;     // 当前页，从 1 开始
  pageSize: number;    // 每页条数
  search: Record<string, unknown>;  // 查询条件（已剔除空值）
  sort?: { field: string; order: 'asc' | 'desc' };
}
```

`request` 返回 `{ data, total, success? }`。`success: false` 时组件保留原数据并解锁 loading，用于业务侧静默兜底。

### 类型导出

```ts
import type {
  ProTableColumn,
  ProTableRequest,
  ProTableRequestParams,
  ProTableRequestResult,
  ProTableInstance,
  ProTablePagination,
  ProTableToolbarConfig
} from '@aura/business';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-pro-table` | 组件根节点 |
| `.aura-pro-table-search` | 查询区 |
| `.aura-pro-table-search-arrow` | 查询区展开/收起箭头 |
| `.aura-pro-table-toolbar` | 工具条 |
| `.aura-pro-table-body` | 表格容器 |

## 实现说明

### 为什么查询表单要用内部影子对象

`ElForm` 的校验要求 `model` 是一个响应式对象且包含 `prop` 对应的键。如果直接把外部传入的 `data`/查询对象交给它，会遇到两个问题：

1. 外部对象不能被组件就地改写（补齐缺失键会破坏单向数据流）
2. 若使用方只传了部分字段，缺失的键不会触发校验（空值被当作"无需校验"跳过）

因此内部维护 `innerModel` 作为 `ElForm` 的 `model` 源，对外仍通过 `emit` 同步。同样的思路也用在 ProForm 上。

### 关于 `request` 的排序参数

`ElTable` 的 `sort-change` 给出的是 `{ prop, order }`（`order` 为 `'ascending' \| 'descending'`），组件内部会转换成后端友好的 `{ field, order }`（`order` 为 `'asc' \| 'desc'`），避免每个业务页都写一遍转换。

## 相关文档

- [ProForm 高级表单](/components/pro-form) — 配置驱动的表单
- [Description 描述列表](/components/description) — 详情页字段展示
- [PageContainer 页面容器](/components/page-container) — 列表页外壳
