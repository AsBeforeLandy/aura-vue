import type { ExtractPropTypes, PropType } from 'vue';

export type ProgressStatus = 'normal' | 'success' | 'danger';

export const progressProps = {
  /** 进度百分比；超出 0~100 会被钳位 */
  percent: {
    type: Number,
    default: 0,
  },
  /** 状态；success / danger 时进度条变色，normal 为主色 */
  status: {
    type: String as PropType<ProgressStatus>,
    default: 'normal',
  },
  /** 是否展示右侧百分比文字 */
  showInfo: {
    type: Boolean,
    default: true,
  },
  /** 轨道高度（px） */
  strokeWidth: {
    type: Number,
    default: 8,
  },
  /** 无障碍名称（progressbar 需要可访问名称） */
  label: {
    type: String,
    default: undefined,
  },
} as const;

export type ProgressProps = ExtractPropTypes<typeof progressProps>;
