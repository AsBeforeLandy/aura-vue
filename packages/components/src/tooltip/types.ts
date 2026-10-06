import type { ExtractPropTypes, PropType } from 'vue';

export type TooltipPlacement = 'top' | 'bottom';

export const tooltipProps = {
  /** 浮层内容（也可用 content 插槽自定义） */
  content: {
    type: String,
    default: '',
  },
  /** 浮层出现在触发元素的哪个方向 */
  placement: {
    type: String as PropType<TooltipPlacement>,
    default: 'top',
  },
  /** 是否禁用（禁用后不响应 hover / focus） */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const;

export type TooltipProps = ExtractPropTypes<typeof tooltipProps>;

export type TooltipEmits = {
  (e: 'visible-change', value: boolean): void;
};
