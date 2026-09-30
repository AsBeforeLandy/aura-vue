# YearCalendar 年历选择器

把一整年铺成一张「周 × 星期」的连续网格，高信息密度、无空白位，适用于投票日、活动排期、值班表等需要「一眼看全年」的勾选场景。

支持单击切换与拖拽框选；选中结果以 `YYYY-MM-DD` 升序数组对外输出。

## 何时使用

- 排班 / 值班表：按日勾选一整年的排期
- 活动排期：营销日历、开售日配置
- 需要全年视角对比月份节奏的圈选场景

## 何时不用

| 场景                    | 应该用                                              |
| ----------------------- | --------------------------------------------------- |
| 按星期 × 时段配置班次   | [WeekTimeRange 周时间段](/business/week-time-range) |
| 常规的单日期 / 日期范围 | Element Plus 的 `ElDatePicker`                      |

## 基础用法

支持 `v-model` 受控与非受控（`defaultValue`）两种模式；底部插槽可展示已选摘要：

<demo src="./demos/year-calendar/basic.vue" />

- 单击日期切换选中；按住鼠标拖拽可框选一片区域
- 年初 / 年末凑整周的「非本年」日期呈灰色且不可交互
- 选中结果按日期升序输出，保证结果稳定可预期

## 自定义密度与颜色

`cellSize` 调整格子尺寸（数字按 px，也支持任意 CSS 长度）；`color` / `selectedColor` 覆写单元格配色：

<demo src="./demos/year-calendar/density.vue" />

## API

### Props

| 属性           | 说明                                   | 类型               | 默认值                        |
| -------------- | -------------------------------------- | ------------------ | ----------------------------- |
| year           | 年份                                   | `number`           | 当前年份                      |
| modelValue     | 受控值：选中日期数组（`YYYY-MM-DD`）   | `string[]`         | -                             |
| defaultValue   | 非受控默认值                           | `string[]`         | `[]`                          |
| weekStartsOn   | 一周起始日：`1` 周一，`0` 周日         | `0 \| 1`           | `1`                           |
| monthLabels    | 月份标签                               | `string[]`         | `1月` ~ `12月`                |
| hideYearTitle  | 是否隐藏年份标题                       | `boolean`          | `false`                       |
| color          | 未选中单元格颜色                       | `string`           | `'var(--aura-border-color)'`  |
| selectedColor  | 选中单元格颜色                         | `string`           | `'var(--aura-color-primary)'` |
| outsideColor   | 非本年日期的颜色                       | `string`           | `'var(--aura-bg-soft)'`       |
| cellSize       | 单元格尺寸（px 或 CSS 长度）           | `number \| string` | `13`                          |
| weekLabels     | 星期标签（7 个，按 weekStartsOn 顺序） | `string[]`         | 内置中文标签                  |
| selectionStyle | 拖拽选区遮罩样式                       | `CSSProperties`    | -                             |

### Events

| 事件              | 说明                  | 回调参数            |
| ----------------- | --------------------- | ------------------- |
| update:modelValue | 选中值变化（v-model） | `(dates: string[])` |
| change            | 选中值变化            | `(dates: string[])` |

### Slots

| 插槽    | 说明           | 作用域                        |
| ------- | -------------- | ----------------------------- |
| default | 底部自定义内容 | `{ selectedDates: string[] }` |

### 类型导出

```ts
import type { YearCalendarProps, YearCalendarSlotProps } from '@aura/business';
```

### CSS 类名

| 类名                               | 说明         |
| ---------------------------------- | ------------ |
| `.aura-year-calendar`              | 容器         |
| `.aura-year-calendar-title`        | 年份标题     |
| `.aura-year-calendar-month-label`  | 月份标签     |
| `.aura-year-calendar-day`          | 日期格       |
| `.aura-year-calendar-day-selected` | 选中的日期格 |
| `.aura-year-calendar-day-outside`  | 非本年日期格 |

矩阵密度可通过覆盖 CSS 变量调整：`--aura-yc-cell`、`--aura-yc-gap`、`--aura-yc-month-gap`、`--aura-yc-weeks-width`。

## 相关文档

- [WeekTimeRange 周时间段](/business/week-time-range) — 同款拖拽框选的按周配置
