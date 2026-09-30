export type { MonthSpan, WeekColumn, DayCell } from './utils';

import type { PropType, CSSProperties, VNodeChild } from 'vue';

export { MONTH_LABELS } from './utils';

export type YearCalendarProps = {
  /**
   * 年份
   * @default 当前年份
   */
  year?: number;
  /** 受控值：选中日期数组，元素格式 `YYYY-MM-DD` */
  modelValue?: string[];
  /** 非受控默认值 */
  defaultValue?: string[];
  /**
   * 一周起始日：`1` 表示周一，`0` 表示周日
   * @default 1
   */
  weekStartsOn?: 0 | 1;
  /** 月份标签 */
  monthLabels?: string[];
  /**
   * 是否隐藏年份标题
   * @default false
   */
  hideYearTitle?: boolean;
  /**
   * 未选中单元格颜色
   * @default 'var(--aura-border-color)'
   */
  color?: string;
  /**
   * 选中单元格颜色
   * @default 'var(--aura-color-primary)'
   */
  selectedColor?: string;
  /**
   * 非本年日期（仅年初 / 年末凑整周用）的颜色
   * @default 'var(--aura-bg-soft)'
   */
  outsideColor?: string;
  /**
   * 自定义单元格尺寸（正方形边长）。数字按 px，也可传任意 CSS 长度（如 '1.2em'）
   * @default 13（由 CSS 变量 --aura-yc-cell 控制）
   */
  cellSize?: number | string;
  /** 星期标签（7 个，按 weekStartsOn 顺序） */
  weekLabels?: string[];
  /** 拖拽选区遮罩样式 */
  selectionStyle?: CSSProperties;
};

export const yearCalendarProps = {
  year: { type: Number, default: undefined },
  modelValue: { type: Array as PropType<string[]>, default: undefined },
  defaultValue: { type: Array as PropType<string[]>, default: undefined },
  weekStartsOn: {
    type: Number as PropType<0 | 1>,
    default: 1,
  },
  monthLabels: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  hideYearTitle: { type: Boolean, default: false },
  color: { type: String, default: 'var(--aura-border-color)' },
  selectedColor: { type: String, default: 'var(--aura-color-primary)' },
  outsideColor: { type: String, default: 'var(--aura-bg-soft)' },
  cellSize: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
  },
  weekLabels: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  selectionStyle: {
    type: Object as PropType<CSSProperties>,
    default: undefined,
  },
} as const;

export interface YearCalendarEmits {
  (e: 'update:modelValue', dates: string[]): void;
  (e: 'change', dates: string[]): void;
}

/** 底部附加内容的插槽作用域（对应 React 版的 children 函数形态） */
export interface YearCalendarSlotProps {
  selectedDates: string[];
}

export type YearCalendarSlots = {
  default?: (props: YearCalendarSlotProps) => VNodeChild;
};
