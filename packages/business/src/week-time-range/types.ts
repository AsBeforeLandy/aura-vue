import type { PropType, CSSProperties } from 'vue';
import type { WeekTimeRangeValue } from './utils';

export type { TimeRange, WeekTimeRangeValue } from './utils';

export type WeekTimeRangeProps = {
  /** 受控值 */
  modelValue?: WeekTimeRangeValue;
  /** 非受控默认值 */
  defaultValue?: WeekTimeRangeValue;
  /**
   * 时间粒度（分钟），需能整除 60
   * @default 30
   */
  stepMinutes?: 15 | 30 | 60;
  /**
   * 一周起始日：`1` 表示周一，`0` 表示周日
   * @default 1
   */
  weekStartsOn?: 0 | 1;
  /** 自定义星期标签（按 weekStartsOn 顺序） */
  weekLabels?: string[];
  /**
   * 选中单元格颜色
   * @default 'var(--aura-color-primary)'
   */
  color?: string;
  /** 拖拽选区遮罩样式 */
  selectionStyle?: CSSProperties;
  /**
   * 自定义单元格宽度。数字按 px，也可传任意 CSS 长度
   * @default 11（由 CSS 变量 --aura-wtr-cell-width 控制）
   */
  cellWidth?: number | string;
  /**
   * 自定义单元格高度
   * @default 26（由 CSS 变量 --aura-wtr-cell-height 控制）
   */
  cellHeight?: number | string;
  /** 是否只读 */
  disabled?: boolean;
  /**
   * 是否显示底部已选摘要
   * @default true
   */
  showSummary?: boolean;
};

export const weekTimeRangeProps = {
  modelValue: {
    type: Array as PropType<WeekTimeRangeValue>,
    default: undefined,
  },
  defaultValue: {
    type: Array as PropType<WeekTimeRangeValue>,
    default: undefined,
  },
  stepMinutes: {
    type: Number as PropType<15 | 30 | 60>,
    default: 30,
  },
  weekStartsOn: {
    type: Number as PropType<0 | 1>,
    default: 1,
  },
  weekLabels: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  color: { type: String, default: 'var(--aura-color-primary)' },
  selectionStyle: {
    type: Object as PropType<CSSProperties>,
    default: undefined,
  },
  cellWidth: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
  },
  cellHeight: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
  },
  disabled: { type: Boolean, default: false },
  showSummary: { type: Boolean, default: true },
} as const;

export interface WeekTimeRangeEmits {
  (e: 'update:modelValue', value: WeekTimeRangeValue): void;
  (e: 'change', value: WeekTimeRangeValue): void;
}
