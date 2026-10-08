# SearchForm 查询表单

声明式查询区：按 `fields` 配置生成字段、24 栅格自动布局、字段超限自动折叠。查询与重置按钮内置。基于 [Element Plus](https://element-plus.org/) 的 `ElForm` 二次封装。

## 何时使用

- 列表页顶部的独立查询区（与 ProTable 内置查询区二选一）
- 查询字段由配置驱动、需要统一布局与折叠行为的场景

## 何时不用

| 场景                       | 应该用                                              |
| -------------------------- | --------------------------------------------------- |
| 查询区与表格强绑定         | [ProTable](/business/pro-table) 的 columns 驱动查询 |
| 需要复杂校验规则的编辑表单 | [ProForm](/business/pro-form)                       |

## 基础用法

`fields` 就绪后，组件接管布局、折叠与提交互时序，你只需要关心「按参数取数」这一件事：

<demo src="./demos/search-form/basic.vue" />

- 点击「查询」会以当前表单值触发 `search`；「重置」回到初始值并触发 `reset`。
- 字段数超过 `collapseAfter`（默认 3）时自动折叠，可点「展开 / 收起」切换。

## 受控与自定义控件

`type: 'custom'` 走 `render` 逃生舱；`fieldProps` 可把任意属性透传给对应控件（与 React 版语义一致）：

<demo src="./demos/search-form/field-props.vue" />

## API

### Props

| 属性             | 说明                   | 类型                      | 默认值   |
| ---------------- | ---------------------- | ------------------------- | -------- |
| fields           | 查询字段配置           | `SearchField[]`           | -        |
| loading          | 提交按钮 loading       | `boolean`                 | `false`  |
| defaultCollapsed | 是否默认折叠           | `boolean`                 | `true`   |
| collapseAfter    | 超过多少字段后启用折叠 | `number`                  | `3`      |
| submitText       | 查询按钮文案           | `string`                  | `'查询'` |
| resetText        | 重置按钮文案           | `string`                  | `'重置'` |
| initialValues    | 表单初始值             | `Record<string, unknown>` | `{}`     |

### SearchField

| 属性        | 说明                     | 类型                                                                   | 默认值 |
| ----------- | ------------------------ | ---------------------------------------------------------------------- | ------ |
| name        | 字段名（对应表单值 key） | `string`                                                               | -      |
| label       | 字段标签                 | `string`                                                               | -      |
| type        | 控件类型                 | `'input' \| 'select' \| 'number' \| 'date' \| 'dateRange' \| 'custom'` | -      |
| options     | select 的选项            | `SearchFieldOption[]`                                                  | -      |
| placeholder | 占位符                   | `string`                                                               | -      |
| span        | 栅格占比（24 栅格制）    | `number`                                                               | `8`    |
| fieldProps  | 透传给控件的额外属性     | `Record<string, unknown>`                                              | -      |
| render      | custom 类型的自定义渲染  | `() => VNodeChild`                                                     | -      |

### Events

| 事件   | 说明                         | 回调参数                            |
| ------ | ---------------------------- | ----------------------------------- |
| search | 点击查询（回车）后触发       | `(values: Record<string, unknown>)` |
| reset  | 点击重置、值回到初始值后触发 | -                                   |

### 实例方法

React 版通过受控 `form` 实例外部操纵表单；Vue 版按惯例走模板 ref，暴露 EP 表单实例：

```ts
import type { SearchFormInstance } from '@aura-vue/business';

// formRef.value.validate() / resetFields() / clearValidate()
const formRef = ref<SearchFormInstance['formRef']>();
```

### 类型导出

```ts
import type {
  SearchFormProps,
  SearchField,
  SearchFieldOption,
  SearchFieldType,
  SearchFormInstance,
} from '@aura-vue/business';
```

### CSS 类名

| 类名                        | 说明     |
| --------------------------- | -------- |
| `.aura-search-form`         | 容器     |
| `.aura-search-form-field`   | 字段项   |
| `.aura-search-form-actions` | 操作区   |
| `.aura-search-form-arrow`   | 折叠箭头 |

## 相关文档

- [ProTable 高级表格](/business/pro-table) — 内置查询区的一体化方案
- [ProForm 高级表单](/business/pro-form) — 带校验的编辑表单
