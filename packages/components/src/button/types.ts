import type { ExtractPropTypes, PropType } from 'vue';

export type ButtonType = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSize = 'large' | 'middle' | 'small';

export const buttonProps = {
  /** 按钮类型 */
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  /** 尺寸 */
  size: {
    type: String as PropType<ButtonSize>,
    default: 'middle'
  },
  /** 禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 加载中（同时阻断点击） */
  loading: {
    type: Boolean,
    default: false
  },
  /** 撑满整行 */
  block: {
    type: Boolean,
    default: false
  }
} as const;

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;

export type ButtonEmits = {
  (e: 'click', evt: MouseEvent): void;
};
