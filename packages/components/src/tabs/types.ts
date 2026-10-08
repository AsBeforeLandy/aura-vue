import type { ExtractPropTypes, PropType } from 'vue';

/** 单个标签页 */
export interface TabItem {
  /** 标签文案 */
  label: string;
  /** 标签值（唯一） */
  value: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export const tabsProps = {
  /** 标签列表 */
  items: {
    type: Array as PropType<TabItem[]>,
    default: () => [],
  },
  /** 受控值（传入即视为受控模式，配合 v-model） */
  modelValue: {
    type: String,
    default: undefined,
  },
  /** 非受控模式初始值；不传时默认选中第一个可用项 */
  defaultValue: {
    type: String,
    default: undefined,
  },
} as const;

export type TabsProps = ExtractPropTypes<typeof tabsProps>;

export type TabsEmits = {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
};
