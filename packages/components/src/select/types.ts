import type { ExtractPropTypes, PropType } from 'vue';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export const selectProps = {
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
  /** 选项，支持 { label, value } 对象或字符串 */
  options: {
    type: Array as PropType<Array<SelectOption | string>>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
} as const;

export type SelectProps = ExtractPropTypes<typeof selectProps>;

export type SelectEmits = {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
};
