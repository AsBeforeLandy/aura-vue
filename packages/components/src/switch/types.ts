import type { ExtractPropTypes } from 'vue';

export const switchProps = {
  /** 受控值（传入即视为受控模式） */
  modelValue: {
    type: Boolean,
    default: undefined
  },
  /** 非受控模式初始值 */
  defaultValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
} as const;

export type SwitchProps = ExtractPropTypes<typeof switchProps>;

export type SwitchEmits = {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change', value: boolean): void;
};
