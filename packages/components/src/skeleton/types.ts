import type { ExtractPropTypes } from 'vue';

export const skeletonProps = {
  /**
   * 是否处于加载态
   * @default true
   */
  loading: {
    type: Boolean,
    default: true,
  },
  /** 是否显示标题条 */
  title: {
    type: Boolean,
    default: true,
  },
  /** 是否显示头像圆 */
  avatar: {
    type: Boolean,
    default: false,
  },
  /** 段落条数 */
  rows: {
    type: Number,
    default: 3,
  },
} as const;

export type SkeletonProps = ExtractPropTypes<typeof skeletonProps>;
