import type { PropType } from 'vue';
import type { CascaderOption } from './utils';

export type { CascaderOption, TreeCheckState } from './utils';

export type CascaderPanelProps = {
  /** 级联选项数据 */
  options: CascaderOption[];
  /** 首列标题 */
  title?: string;
  /** 受控选中值（勾选父级时自动包含其全部子孙） */
  modelValue?: string[];
};

export const cascaderPanelProps = {
  options: { type: Array as PropType<CascaderOption[]>, required: true },
  title: { type: String, default: '' },
  modelValue: { type: Array as PropType<string[]>, default: undefined },
} as const;

export interface CascaderPanelEmits {
  (e: 'update:modelValue', selectedValues: string[]): void;
  /** 每次交互只触发一次；整树选中时由父级代表子孙 */
  (
    e: 'change',
    selectedValues: string[],
    selectedOptions: CascaderOption[],
  ): void;
  (e: 'current-click', option: CascaderOption): void;
}
