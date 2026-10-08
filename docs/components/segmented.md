# Segmented 分段控制器

在一组**互斥且数量少**的选项中做单选，选择即刻生效。

## 何时使用

- 视图切换（日 / 周 / 月）
- 排序方式切换（最热 / 最新）
- 2~5 个互斥选项的即时筛选

## 何时不用

| 场景                  | 应该用                     |
| --------------------- | -------------------------- |
| 选项需要提交才生效    | Radio / Select（表单语义） |
| 选项超过 5 个         | Select                     |
| 选项是页面 / 路由跳转 | Tabs / 导航                |
| 多选                  | Checkbox 组                |

> **核心判断**：Segmented 是「即选即用的视图开关」。放进表单让用户「选完一起提交」的，语义上应该是 Radio。

## 基础用法

<demo src="./demos/segmented/basic.vue" />

## 受控 / 非受控与键盘

与 Switch / Input 一致的双轨：`v-model` 受控，`default-value` 非受控（不传时默认选中第一项）。

键盘遵循 radio 组惯例：组内只有选中项可 Tab 到达（roving tabindex），左右方向键循环切换。

## 设计规范

| 项   | 规范                                           |
| ---- | ---------------------------------------------- |
| 数量 | 2~5 个；超过用 Select                          |
| 文案 | 2~4 字名词；选项宽度尽量接近，避免视觉重心跳动 |
| 生效 | 切换立即生效；需要「应用」按钮的场景不要用它   |

## API

### Props

| 属性         | 说明                                          | 类型                               | 默认值  |
| ------------ | --------------------------------------------- | ---------------------------------- | ------- |
| options      | 选项；字符串项等价于 `{ label: s, value: s }` | `Array<string \| SegmentedOption>` | `[]`    |
| modelValue   | 受控值（传入即视为受控模式）                  | `string`                           | -       |
| defaultValue | 非受控模式初始值；不传时默认选中第一项        | `string`                           | -       |
| disabled     | 是否整体禁用                                  | `boolean`                          | `false` |

### Events

| 事件              | 说明           | 回调参数          |
| ----------------- | -------------- | ----------------- |
| update:modelValue | 选中变化时触发 | `(value: string)` |
| change            | 选中变化时触发 | `(value: string)` |

### 类型导出

```ts
import type {
  SegmentedProps,
  SegmentedOption,
  SegmentedEmits,
} from '@aura/components';
```

### CSS 类名

| 类名                             | 说明                 |
| -------------------------------- | -------------------- |
| `.aura-segmented`                | 根节点（radiogroup） |
| `.aura-segmented--disabled`      | 禁用态               |
| `.aura-segmented-option`         | 选项按钮             |
| `.aura-segmented-option--active` | 选中态               |

## 相关文档

- [Switch 开关](/components/switch) — 单个布尔开关
- [组件设计规范](/guide/design#受控与非受控) — 双轨模式实现原理
