import type { ExtractPropTypes, PropType } from 'vue';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export const alertProps = {
  /** 提示类型；info 为中性 */
  type: {
    type: String as PropType<AlertType>,
    default: 'info',
  },
  /** 标题（也可用 title 插槽自定义） */
  title: {
    type: String,
    default: '',
  },
  /** 是否显示类型图标 */
  showIcon: {
    type: Boolean,
    default: false,
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

export type AlertProps = ExtractPropTypes<typeof alertProps>;

export type AlertEmits = {
  (e: 'update:visible', value: boolean): void;
  (e: 'close', evt: MouseEvent): void;
};
