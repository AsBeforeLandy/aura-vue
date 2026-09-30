import type { FormInstance } from 'element-plus';
import type { PropType, VNodeChild } from 'vue';

/** 查询字段支持的控件类型 */
export type SearchFieldType =
  'input' | 'select' | 'number' | 'date' | 'dateRange' | 'custom';

/** select 字段的选项 */
export interface SearchFieldOption {
  label: string;
  value: string | number | boolean;
}

/** 单个查询字段的配置 */
export interface SearchField {
  /** 字段名（对应表单值 key） */
  name: string;
  /** 字段标签 */
  label: string;
  /** 控件类型 */
  type: SearchFieldType;
  /** select 的选项 */
  options?: SearchFieldOption[];
  /** 占位符（dateRange 请在 fieldProps 中传 startPlaceholder / endPlaceholder） */
  placeholder?: string;
  /**
   * 栅格占比（24 栅格制，md 及以上生效）
   * @default 8
   */
  span?: number;
  /** 透传给控件的额外属性（类型交由使用者保证，与 EP 生态惯例一致） */
  fieldProps?: Record<string, unknown>;
  /** type 为 custom 时的自定义渲染（逃生舱） */
  render?: () => VNodeChild;
}

export type SearchFormProps = {
  /** 查询字段配置 */
  fields: SearchField[];
  /** 提交按钮 loading */
  loading?: boolean;
  /**
   * 是否默认折叠
   * @default true
   */
  defaultCollapsed?: boolean;
  /**
   * 超过多少个字段后启用折叠
   * @default 3
   */
  collapseAfter?: number;
  /** 查询按钮文案 */
  submitText?: string;
  /** 重置按钮文案 */
  resetText?: string;
  /** 表单初始值 */
  initialValues?: Record<string, unknown>;
};

export const searchFormProps = {
  fields: { type: Array as PropType<SearchField[]>, required: true },
  loading: { type: Boolean, default: false },
  defaultCollapsed: { type: Boolean, default: true },
  collapseAfter: { type: Number, default: 3 },
  submitText: { type: String, default: '查询' },
  resetText: { type: String, default: '重置' },
  initialValues: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
} as const;

export interface SearchFormEmits {
  (e: 'search', values: Record<string, unknown>): void;
  (e: 'reset'): void;
}

/** 对外暴露的实例（替代 React 版的 form 受控实例 prop，Vue 惯例走 ref） */
export interface SearchFormInstance {
  /** Element Plus 表单实例，可用于 validate / resetFields / clearValidate */
  formRef: FormInstance;
}
