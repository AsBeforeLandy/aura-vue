import type { ExtractPropTypes, PropType } from 'vue';

export type PopoverPlacement = 'top' | 'bottom';

export const popoverProps = {
  /** 标题（也可用 title 插槽自定义） */
  title: {
    type: String,
    default: '',
  },
  /** 浮层出现方向 */
  placement: {
    type: String as PropType<PopoverPlacement>,
    default: 'top',
  },
  /** 是否禁用（禁用后不响应点击） */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const;

export type PopoverProps = ExtractPropTypes<typeof popoverProps>;

export type PopoverEmits = {
  (e: 'visible-change', value: boolean): void;
};
