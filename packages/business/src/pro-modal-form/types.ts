import type { PropType } from 'vue';
import type { ProFormItem } from '../pro-form/types';

/** 弹窗表单的模式：新增 / 编辑 / 查看 */
export type ProModalFormMode = 'create' | 'edit' | 'view';

export type ProModalFormProps = {
  /** 是否可见（v-model） */
  modelValue: boolean;
  /** 表单字段配置 */
  items: ProFormItem[];
  /** 模式，决定标题与提交按钮的默认文案 */
  mode?: ProModalFormMode;
  /** 弹窗标题，缺省按 mode 推导（新增 / 编辑 / 查看） */
  title?: string;
  /** 提交函数。返回 Promise 时组件会等待其完成，失败时保持弹窗打开 */
  submit?: (values: Record<string, unknown>) => Promise<unknown> | unknown;
  /** 打开时用于回填的数据（编辑/查看模式） */
  initialValues?: Record<string, unknown>;
  /** 打开时是否重置为 initialValues（默认 true） */
  resetOnOpen?: boolean;
  /** 弹窗宽度 */
  width?: number | string;
  /** 表单列数 */
  columns?: number;
  /** 标签宽度 */
  labelWidth?: number | string;
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top';
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean;
  /** 按 ESC 是否关闭 */
  closeOnPressEscape?: boolean;
  /** 确认按钮文案 */
  okText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 弹窗挂载位置（Teleport） */
  appendToBody?: boolean;
};

export type ProModalFormEmits = {
  (e: 'update:modelValue', value: boolean): void;
  /** 提交成功（submit 未抛错） */
  (e: 'success', values: Record<string, unknown>): void;
  /** 提交失败 */
  (e: 'error', error: unknown): void;
  /** 取消 / 关闭 */
  (e: 'cancel'): void;
  /** 弹窗打开 */
  (e: 'open'): void;
  /** 弹窗关闭（含提交成功后的自动关闭） */
  (e: 'closed'): void;
};

export const proModalFormProps = {
  modelValue: { type: Boolean, default: false },
  items: { type: Array as PropType<ProFormItem[]>, required: true },
  mode: { type: String as PropType<ProModalFormMode>, default: 'create' },
  title: { type: String, default: '' },
  submit: { type: Function as PropType<ProModalFormProps['submit']>, default: undefined },
  initialValues: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  },
  resetOnOpen: { type: Boolean, default: true },
  width: { type: [Number, String] as PropType<number | string>, default: 640 },
  columns: { type: Number, default: 2 },
  labelWidth: { type: [Number, String] as PropType<number | string>, default: 96 },
  labelPosition: { type: String as PropType<'left' | 'right' | 'top'>, default: 'right' },
  closeOnClickModal: { type: Boolean, default: false },
  closeOnPressEscape: { type: Boolean, default: true },
  okText: { type: String, default: '' },
  cancelText: { type: String, default: '取消' },
  appendToBody: { type: Boolean, default: true }
} as const;

/** 按模式推导默认标题 */
export function resolveTitle(mode: ProModalFormMode, title?: string): string {
  if (title) return title;
  const map: Record<ProModalFormMode, string> = {
    create: '新增',
    edit: '编辑',
    view: '查看'
  };
  return map[mode];
}
