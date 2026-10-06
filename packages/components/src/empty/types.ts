import type { ExtractPropTypes } from 'vue';

export const emptyProps = {
  /** 描述文案；不传时使用默认的「暂无数据」 */
  description: {
    type: String,
    default: '',
  },
} as const;

export type EmptyProps = ExtractPropTypes<typeof emptyProps>;
