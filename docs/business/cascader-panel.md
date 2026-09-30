# CascaderPanel 级联多选面板

以横向多列的形式呈现多级选项：点击选项展开下级，勾选后级联作用于整棵子树，逐列提供「全选」，父级自动呈现全选 / 半选状态。

与 Element Plus 的 `ElCascader`（下拉形态、单选路径）不同，本组件为平铺面板的**多选**形态，适用于组织架构、类目树等需要批量圈选子级场景。

## 何时使用

- 组织架构、类目树等多级数据的批量勾选
- 需要在固定面板（而非下拉）中横向逐级浏览的表单场景
- 希望勾选父级自动圈选全部子孙、回传「最大粒度」结果的场景

## 何时不用

| 场景                     | 应该用                              |
| ------------------------ | ----------------------------------- |
| 单选路径（省市区）       | Element Plus 的 `ElCascader`        |
| 不需要逐级浏览的平铺多选 | [Select 选择器](/components/select) |

## 基础用法

`modelValue` 受控选中值（勾选父级时自动包含其全部子孙）；`change` 事件回传「去重的最大粒度选中项」，整树选中时由父级代表子孙，避免输出冗余：

<demo src="./demos/cascader-panel/basic.vue" />

- 点击选项展开下一列；勾选框才改变选中状态（点行只是展开）。
- 每一列都有「全选」，作用于该列全部选项及其子孙。

## 首列标题与提示

`title` 设置首列列头；`tooltips` 为选项提供悬停提示：

<demo src="./demos/cascader-panel/title-tooltips.vue" />

## API

### Props

| 属性       | 说明                                   | 类型               | 默认值 |
| ---------- | -------------------------------------- | ------------------ | ------ |
| options    | 级联选项数据                           | `CascaderOption[]` | -      |
| title      | 首列标题                               | `string`           | `''`   |
| modelValue | 受控选中值（自动包含所勾选父级的子孙） | `string[]`         | -      |

### CascaderOption

| 属性     | 说明                   | 类型               | 默认值 |
| -------- | ---------------------- | ------------------ | ------ |
| label    | 选项文案               | `string`           | -      |
| value    | 选项值（同层级内唯一） | `string`           | -      |
| tooltips | 悬停提示文案           | `string`           | -      |
| children | 子级选项               | `CascaderOption[]` | -      |

支持任意扩展字段，事件回调时原样回传。

### Events

| 事件              | 说明                         | 回调参数                                                        |
| ----------------- | ---------------------------- | --------------------------------------------------------------- |
| update:modelValue | 选中值变化（v-model）        | `(selectedValues: string[])`                                    |
| change            | 选中值变化（每次交互只一次） | `(selectedValues: string[], selectedOptions: CascaderOption[])` |
| current-click     | 点击选项（展开下级）         | `(option: CascaderOption)`                                      |

### 类型导出

```ts
import type { CascaderPanelProps, CascaderOption } from '@aura/business';
```

### CSS 类名

| 类名                                 | 说明         |
| ------------------------------------ | ------------ |
| `.aura-cascader-panel`               | 容器         |
| `.aura-cascader-panel-column`        | 列           |
| `.aura-cascader-panel-column-title`  | 列标题       |
| `.aura-cascader-panel-check-all`     | 列首全选     |
| `.aura-cascader-panel-option`        | 选项行       |
| `.aura-cascader-panel-option-active` | 展开中的选项 |

## 相关文档

- [ProTable 高级表格](/business/pro-table) — 列表页一体化方案
