import type { ExtractPropTypes, PropType } from 'vue';

export type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const tagProps = {
  /** 标签类型；info 为中性灰 */
  type: {
    type: String as PropType<TagType>,
    default: 'info',
  },
  /** 是否显示关闭按钮 */
  closable: {
    type: Boolean,
    default: false,
  },
  /** 受控显隐（传入即视为受控模式，配合 v-model:visible） */
  visible: {
    type: Boolean,
    default: undefined,
  },
  /** 非受控模式初始显隐 */
  defaultVisible: {
    type: Boolean,
    default: true,
  },
} as const;

export type TagProps = ExtractPropTypes<typeof tagProps>;

export type TagEmits = {
  (e: 'update:visible', value: boolean): void;
  (e: 'close', evt: MouseEvent): void;
};
