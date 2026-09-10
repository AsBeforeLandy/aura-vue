import type { PropType, VNodeChild } from 'vue';

/** 内置支持的控件类型 */
export type ProFormValueType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'dateRange'
  | 'time'
  | 'slot';

/** 选项项（select / radio / checkbox 共用） */
export interface ProFormOption {
  label: string;
  value: string | number | boolean;
  /** 是否禁用该选项 */
  disabled?: boolean;
}

/** 校验规则，结构对齐 Element Plus 的 FormItemRule，这里做窄化以保持类型自洽 */
export interface ProFormRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  /** 正则或 Element Plus 的内置 pattern 名 */
  pattern?: RegExp | string;
  /** 触发时机 */
  trigger?: 'blur' | 'change' | Array<'blur' | 'change'>;
  /** 自定义校验器，返回 true 通过，返回字符串作为错误文案 */
  validator?: (
    value: unknown,
    rule: ProFormRule
  ) => boolean | string | Promise<boolean | string>;
  /** 值类型，用于 min/max 的长度或数值校验 */
  type?: 'string' | 'number' | 'array' | 'email' | 'url';
}

/** 单个表单字段配置 */
export interface ProFormItem {
  /** 字段名，同时作为 model 的键名 */
  name: string;
  /** 标签文案 */
  label?: string;
  /** 控件类型 */
  valueType?: ProFormValueType;
  /** 占位提示 */
  placeholder?: string;
  /** 辅助说明文字（显示在控件下方） */
  extra?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读（只读模式下整体生效，此项可单独豁免） */
  readonly?: boolean;
  /** 选项列表 */
  options?: ProFormOption[];
  /** 校验规则 */
  rules?: ProFormRule | ProFormRule[];
  /**
   * 栅格占比：一行 24 份。不传时按 `columns` 平均分配。
   * 例：`span: 12` 表示占一行的一半。
   */
  span?: number;
  /** 是否独占一行（等价于 span 24） */
  fullWidth?: boolean;
  /** 控件透传属性，如 `{ clearable: true, rows: 4 }` */
  props?: Record<string, unknown>;
  /** 该字段在查询场景下是否折叠隐藏 */
  hidden?: boolean | (() => boolean);
  /** 字段提示文案（label 旁的问号） */
  tip?: string;
  /** 自定义渲染整个表单项（逃生舱） */
  render?: (params: { model: Record<string, unknown> }) => VNodeChild;
}

/** 表单标签位置 */
export type ProFormLabelPosition = 'left' | 'right' | 'top';

/** 表单布局模式 */
export type ProFormLayout = 'horizontal' | 'vertical' | 'inline';

export type ProFormProps = {
  /** 字段配置 */
  items: ProFormItem[];
  /** 表单数据。传入即为受控（v-model） */
  modelValue?: Record<string, unknown>;
  /** 非受控初始值 */
  defaultValue?: Record<string, unknown>;
  /** 每行显示的字段数（未指定 span 时生效） */
  columns?: number;
  /** 标签位置 */
  labelPosition?: ProFormLabelPosition;
  /** 标签宽度 */
  labelWidth?: number | string;
  /** 整体只读 */
  readonly?: boolean;
  /** 整体禁用 */
  disabled?: boolean;
  /** 表单尺寸 */
  size?: 'large' | 'default' | 'small';
  /** 是否显示底部操作区 */
  showActions?: boolean;
  /** 提交按钮文案 */
  submitText?: string;
  /** 重置按钮文案 */
  resetText?: string;
  /** 提交中状态（阻断重复提交） */
  submitting?: boolean;
  /** 每行字段间距 */
  gutter?: number;
};

export type ProFormEmits = {
  (e: 'update:modelValue', value: Record<string, unknown>): void;
  (e: 'change', payload: { name: string; value: unknown; model: Record<string, unknown> }): void;
  (e: 'submit', value: Record<string, unknown>): void;
  (e: 'reset'): void;
  /** 校验失败 */
  (e: 'validate-error', errors: unknown): void;
};

/** 组件对外暴露的方法 */
export interface ProFormInstance {
  /** 触发校验，返回是否通过 */
  validate: () => Promise<boolean>;
  /** 清空校验状态 */
  clearValidate: () => void;
  /** 重置为初始值 */
  reset: () => void;
  /** 获取当前表单值 */
  getValues: () => Record<string, unknown>;
  /** 批量设置表单值 */
  setValues: (values: Record<string, unknown>) => void;
  /** 获取单个字段值 */
  getValue: (name: string) => unknown;
  /** 设置单个字段值 */
  setValue: (name: string, value: unknown) => void;
}

/** 内部使用的 props 定义 */
export const proFormProps = {
  items: { type: Array as PropType<ProFormItem[]>, required: true },
  modelValue: { type: Object as PropType<Record<string, unknown>>, default: undefined },
  defaultValue: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  columns: { type: Number, default: 2 },
  labelPosition: { type: String as PropType<ProFormLabelPosition>, default: 'right' },
  labelWidth: { type: [Number, String] as PropType<number | string>, default: 96 },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' },
  showActions: { type: Boolean, default: false },
  submitText: { type: String, default: '提交' },
  resetText: { type: String, default: '重置' },
  submitting: { type: Boolean, default: false },
  gutter: { type: Number, default: 20 }
} as const;
