# WeekTimeRange 周时间段选择器

以「一周 × 时间粒度」的矩阵呈现可选时段，适用于排班、可预约时间、营业时间等场景。

支持两种选择方式：单击单元格切换，或按住鼠标拖拽框选一片区域。相邻时间段会自动合并为连续区间（如选中 09:00-09:30 与 09:30-10:00 → `09:00-10:00`）。

## 何时使用

- 排班表：按周配置员工班次
- 可预约时间：服务开放时段配置
- 营业时间：门店每周营业时间管理

## 何时不用

| 场景                   | 应该用                                             |
| ---------------------- | -------------------------------------------------- |
| 按日期圈选一整天的排班 | [YearCalendar 年历选择器](/business/year-calendar) |
| 单个时间点的选择       | Element Plus 的 `ElTimePicker`                     |

## 基础用法

支持 `v-model` 受控与非受控（`defaultValue`）两种模式；`stepMinutes` 控制时间粒度（15 / 30 / 60 分钟）：

<demo src="./demos/week-time-range/basic.vue" />

- 单击单元格切换选中；按住鼠标拖拽可框选一片区域
- 相邻时段自动合并；再次点击取消
- 底部摘要实时展示每天已选时段，可一键清空

## 自定义起始日与粒度

`weekStartsOn` 切换一周起始日（默认周一）；`stepMinutes` 切换粒度：

<demo src="./demos/week-time-range/step.vue" />

## 只读与单元格尺寸

`disabled` 整体只读；`cellWidth` / `cellHeight` 调整矩阵密度（数字按 px，也支持任意 CSS 长度）：

<demo src="./demos/week-time-range/disabled.vue" />

## API

### Props

| 属性           | 说明                           | 类型                 | 默认值                        |
| -------------- | ------------------------------ | -------------------- | ----------------------------- |
| modelValue     | 受控值                         | `WeekTimeRangeValue` | -                             |
| defaultValue   | 非受控默认值                   | `WeekTimeRangeValue` | -                             |
| stepMinutes    | 时间粒度（分钟），需能整除 60  | `15 \| 30 \| 60`     | `30`                          |
| weekStartsOn   | 一周起始日：`1` 周一，`0` 周日 | `0 \| 1`             | `1`                           |
| weekLabels     | 自定义星期标签                 | `string[]`           | 内置中文标签                  |
| color          | 选中单元格颜色                 | `string`             | `'var(--aura-color-primary)'` |
| selectionStyle | 拖拽选区遮罩样式               | `CSSProperties`      | -                             |
| cellWidth      | 单元格宽度（px 或 CSS 长度）   | `number \| string`   | `11`                          |
| cellHeight     | 单元格高度（px 或 CSS 长度）   | `number \| string`   | `26`                          |
| disabled       | 是否只读                       | `boolean`            | `false`                       |
| showSummary    | 是否显示底部已选摘要           | `boolean`            | `true`                        |

### WeekTimeRangeValue

一周七天、每天若干互不重叠的时间段：

```ts
interface TimeRange {
  /** 开始时间，格式 `HH:mm` */
  start: string;
  /** 结束时间，格式 `HH:mm` */
  end: string;
}

type WeekTimeRangeValue = TimeRange[][];
```

### Events

| 事件              | 说明              | 回调参数                      |
| ----------------- | ----------------- | ----------------------------- |
| update:modelValue | 值变化（v-model） | `(value: WeekTimeRangeValue)` |
| change            | 值变化            | `(value: WeekTimeRangeValue)` |

### 类型导出

```ts
import type {
  WeekTimeRangeProps,
  TimeRange,
  WeekTimeRangeValue,
} from '@aura/business';
```

### CSS 类名

| 类名                                  | 说明         |
| ------------------------------------- | ------------ |
| `.aura-week-time-range`               | 容器         |
| `.aura-week-time-range--disabled`     | 只读态       |
| `.aura-week-time-range-matrix`        | 矩阵网格     |
| `.aura-week-time-range-cell`          | 时间格       |
| `.aura-week-time-range-cell-selected` | 选中的时间格 |
| `.aura-week-time-range-summary`       | 底部摘要     |

矩阵密度可通过覆盖 CSS 变量调整：`--aura-wtr-label-width`、`--aura-wtr-cell-width`、`--aura-wtr-cell-height`、`--aura-wtr-gap`。

## 相关文档

- [YearCalendar 年历选择器](/business/year-calendar) — 同款拖拽框选的按日期圈选
