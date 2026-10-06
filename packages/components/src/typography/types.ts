import type { ExtractPropTypes, PropType } from 'vue';

export type TypographyLevel = 1 | 2 | 3 | 4;
export type TypographyType = 'secondary' | 'success' | 'warning' | 'danger';

export const typographyProps = {
  /** 标题级别；设置后渲染为 h1~h4，不设置渲染为段落 p */
  level: {
    type: Number as PropType<TypographyLevel>,
    default: undefined,
  },
  /** 语义色 */
  type: {
    type: String as PropType<TypographyType>,
    default: undefined,
  },
  /** 加粗 */
  strong: {
    type: Boolean,
    default: false,
  },
  /** 下划线 */
  underline: {
    type: Boolean,
    default: false,
  },
  /** 删除线 */
  delete: {
    type: Boolean,
    default: false,
  },
} as const;

export type TypographyProps = ExtractPropTypes<typeof typographyProps>;
