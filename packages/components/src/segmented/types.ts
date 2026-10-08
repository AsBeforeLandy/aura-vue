import type { ExtractPropTypes, PropType } from 'vue';

/** 选项对象形态；字符串选项会自动转成 { label, value } */
export interface SegmentedOption {
  /** 选项文案 */
  label: string;
  /** 选项值 */
  value: string;
}

export const segmentedProps = {
  /** 选项列表；字符串项等价于 { label: s, value: s } */
  options: {
    type: Array as PropType<Array<string | SegmentedOption>>,
    default: () => [],
  },
  /** 受控值（传入即视为受控模式，配合 v-model） */
  modelValue: {
    type: String,
    default: undefined,
  },
  /** 非受控模式初始值；不传时默认选中第一个选项 */
  defaultValue: {
    type: String,
    default: undefined,
  },
  /** 是否整体禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const;

export type SegmentedProps = ExtractPropTypes<typeof segmentedProps>;

export type SegmentedEmits = {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
};
