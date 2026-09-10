import ProForm from './ProForm.vue';

export { ProForm };
export type {
  ProFormProps,
  ProFormEmits,
  ProFormInstance,
  ProFormItem,
  ProFormOption,
  ProFormRule,
  ProFormValueType,
  ProFormLabelPosition,
  ProFormLayout
} from './types';
export { proFormProps } from './types';
export { renderControl, normalizeRules } from './render-control';
