import type { ExtractPropTypes, PropType } from 'vue';

export type DividerDirection = 'horizontal' | 'vertical';
export type DividerOrientation = 'left' | 'center' | 'right';

export const dividerProps = {
  /** 是否虚线 */
  dashed: {
    type: Boolean,
    default: false,
  },
  /** 分割线方向；垂直方向不渲染文字 */
  direction: {
    type: String as PropType<DividerDirection>,
    default: 'horizontal',
  },
  /** 文字位置（仅水平方向有效） */
  orientation: {
    type: String as PropType<DividerOrientation>,
    default: 'center',
  },
} as const;

export type DividerProps = ExtractPropTypes<typeof dividerProps>;
