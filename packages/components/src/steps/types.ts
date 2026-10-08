import type { ExtractPropTypes, PropType } from 'vue';

/** 单个步骤 */
export interface StepItem {
  /** 步骤标题 */
  title: string;
  /** 补充说明（可选） */
  description?: string;
}

export const stepsProps = {
  /** 步骤列表 */
  items: {
    type: Array as PropType<StepItem[]>,
    default: () => [],
  },
  /** 当前步骤下标（从 0 开始）；小于它的视为已完成，等于它的为进行中 */
  current: {
    type: Number,
    default: 0,
  },
  /** 当前步骤的形态；`error` 表示当前步骤出错 */
  status: {
    type: String as PropType<'process' | 'error'>,
    default: 'process',
  },
} as const;

export type StepsProps = ExtractPropTypes<typeof stepsProps>;
