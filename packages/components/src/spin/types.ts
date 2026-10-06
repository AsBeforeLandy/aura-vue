import type { ExtractPropTypes, PropType } from 'vue';

export type SpinSize = 'small' | 'middle' | 'large';

export const spinProps = {
  /** 是否处于加载状态；false 时不渲染任何内容 */
  spinning: {
    type: Boolean,
    default: true,
  },
  /** 尺寸 */
  size: {
    type: String as PropType<SpinSize>,
    default: 'middle',
  },
  /** 加载文案（也可用 tip 插槽自定义） */
  tip: {
    type: String,
    default: '',
  },
} as const;

export type SpinProps = ExtractPropTypes<typeof spinProps>;
