import type { ExtractPropTypes, PropType } from 'vue';
import type { Rule } from './validator';

export const formProps = {
  /** 表单数据源（响应式对象） */
  model: {
    type: Object as PropType<Record<string, unknown>>,
    required: true
  }
} as const;

export type FormProps = ExtractPropTypes<typeof formProps>;

export const formItemProps = {
  /** 标签文本 */
  label: {
    type: String,
    default: ''
  },
  /** 对应 model 的字段名 */
  prop: {
    type: String as PropType<string>,
    default: undefined
  },
  /** 校验规则 */
  rules: {
    type: Array as PropType<Rule[]>,
    default: () => []
  },
  /** 是否必填（仅影响标红星展示，实际校验靠 rules） */
  required: {
    type: Boolean,
    default: false
  }
} as const;

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;

export type { Rule, FormRules } from './validator';
