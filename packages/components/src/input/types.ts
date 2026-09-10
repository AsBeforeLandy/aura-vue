import type { ExtractPropTypes, PropType } from 'vue';

export const inputProps = {
  /** 受控值（传入即视为受控模式） */
  modelValue: {
    type: String as PropType<string>,
    default: undefined
  },
  /** 非受控模式初始值 */
  defaultValue: {
    type: String as PropType<string>,
    default: undefined
  },
  /** 占位文案 */
  placeholder: {
    type: String,
    default: ''
  },
  /** 禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 显示清空按钮 */
  clearable: {
    type: Boolean,
    default: false
  }
} as const;

export type InputProps = ExtractPropTypes<typeof inputProps>;

export type InputEmits = {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'clear'): void;
};
