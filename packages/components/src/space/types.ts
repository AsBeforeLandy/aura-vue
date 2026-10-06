import type { ExtractPropTypes, PropType } from 'vue';

export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceSize = 'small' | 'middle' | 'large';
export type SpaceAlign = 'start' | 'center' | 'end' | 'baseline';

export const spaceProps = {
  /** 排列方向 */
  direction: {
    type: String as PropType<SpaceDirection>,
    default: 'horizontal',
  },
  /** 间距：预设档位（走间距令牌）或具体像素值 */
  size: {
    type: [String, Number] as PropType<SpaceSize | number>,
    default: 'middle',
  },
  /** 是否允许换行（仅水平方向有意义） */
  wrap: {
    type: Boolean,
    default: false,
  },
  /** 对齐方式；不传时水平方向居中、垂直方向顶对齐 */
  align: {
    type: String as PropType<SpaceAlign>,
    default: undefined,
  },
} as const;

export type SpaceProps = ExtractPropTypes<typeof spaceProps>;
