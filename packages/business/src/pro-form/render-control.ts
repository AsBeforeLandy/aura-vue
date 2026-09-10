import { h, type Component, type VNodeChild } from 'vue';
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSwitch
} from 'element-plus';
import type { ProFormItem, ProFormOption } from './types';

/**
 * Element Plus 的组件由 defineComponent 生成，其 props 类型里大量字段被推断为
 * 「必填」，直接用 h(ElInput, {...}) 会触发 TS2769（No overload matches）。
 *
 * 这里统一收窄成 Vue 的 Component 类型，把 props 校验交给运行时。
 * 这是动态渲染第三方组件库时的常规处理——类型安全退让给编译期的
 * `ProFormItem.valueType → 控件` 映射（那层是强类型的）。
 */
const asComponent = (comp: unknown) => comp as Component;

/** 按字段配置生成对应的 Element Plus 控件 VNode */
export function renderControl(
  item: ProFormItem,
  ctx: {
    value: unknown;
    disabled: boolean;
    onUpdate: (value: unknown) => void;
  }
): VNodeChild {
  const { value, disabled, onUpdate } = ctx;
  const passthrough = (item.props ?? {}) as Record<string, unknown>;

  const common: Record<string, unknown> = {
    modelValue: value,
    'onUpdate:modelValue': onUpdate,
    disabled,
    placeholder: item.placeholder ?? defaultPlaceholder(item),
    ...passthrough
  };

  switch (item.valueType) {
    case 'textarea':
      return h(asComponent(ElInput), { ...common, type: 'textarea', rows: passthrough.rows ?? 3 });

    case 'password':
      return h(asComponent(ElInput), { ...common, type: 'password', showPassword: true });

    case 'number':
      return h(asComponent(ElInputNumber), {
        ...common,
        controlsPosition: 'right',
        style: 'width: 100%'
      });

    case 'select':
      return h(
        asComponent(ElSelect),
        { ...common, clearable: passthrough.clearable ?? true, style: 'width: 100%' },
        {
          default: () => (item.options ?? []).map(renderOption)
        }
      );

    case 'radio':
      return h(asComponent(ElRadioGroup), common, {
        default: () => (item.options ?? []).map((opt) => renderRadio(opt, disabled))
      });

    case 'checkbox':
      return h(asComponent(ElCheckboxGroup), common, {
        default: () => (item.options ?? []).map((opt) => renderCheckbox(opt, disabled))
      });

    case 'switch':
      return h(asComponent(ElSwitch), common);

    case 'date':
      return h(asComponent(ElDatePicker), {
        ...common,
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        style: 'width: 100%'
      });

    case 'datetime':
      return h(asComponent(ElDatePicker), {
        ...common,
        type: 'datetime',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        style: 'width: 100%'
      });

    case 'dateRange':
      return h(asComponent(ElDatePicker), {
        ...common,
        type: 'daterange',
        valueFormat: 'YYYY-MM-DD',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        style: 'width: 100%'
      });

    case 'time':
      return h(asComponent(ElDatePicker), {
        ...common,
        type: 'time',
        valueFormat: 'HH:mm:ss',
        style: 'width: 100%'
      });

    // slot 类型的控件由外部具名插槽提供，这里返回 null 占位
    case 'slot':
      return null;

    case 'text':
    default:
      return h(asComponent(ElInput), { ...common, clearable: passthrough.clearable ?? true });
  }
}

function renderOption(opt: ProFormOption) {
  return h(asComponent(ElOption), { key: String(opt.value), label: opt.label, value: opt.value });
}

function renderRadio(opt: ProFormOption, groupDisabled: boolean) {
  return h(
    asComponent(ElRadio),
    { key: String(opt.value), value: opt.value, disabled: groupDisabled || opt.disabled },
    () => opt.label
  );
}

function renderCheckbox(opt: ProFormOption, groupDisabled: boolean) {
  return h(
    asComponent(ElCheckbox),
    { key: String(opt.value), value: opt.value, disabled: groupDisabled || opt.disabled },
    () => opt.label
  );
}

function defaultPlaceholder(item: ProFormItem): string {
  const selectLike = ['select', 'date', 'datetime', 'dateRange', 'time'];
  return selectLike.includes(item.valueType ?? 'text')
    ? `请选择${item.label ?? ''}`
    : `请输入${item.label ?? ''}`;
}

/** 把业务侧的 ProFormRule 转成 Element Plus 可消费的 rule 数组 */
export function normalizeRules(
  rules?: ProFormItem['rules']
): Array<Record<string, unknown>> | undefined {
  if (!rules) return undefined;
  const list = Array.isArray(rules) ? rules : [rules];
  return list.map((rule) => {
    const base: Record<string, unknown> = { trigger: rule.trigger ?? ['blur', 'change'] };
    if (rule.required !== undefined) base.required = rule.required;
    if (rule.message !== undefined) base.message = rule.message;
    if (rule.min !== undefined) base.min = rule.min;
    if (rule.max !== undefined) base.max = rule.max;
    if (rule.pattern !== undefined) base.pattern = rule.pattern;
    if (rule.type !== undefined) base.type = rule.type;
    if (rule.validator) {
      // EP 的 validator 回调签名为 (rule, value, callback)，
      // 这里适配成「返回 string 视为错误文案」的简化形式，降低使用方心智负担。
      base.validator = (
        _r: unknown,
        value: unknown,
        callback: (error?: Error) => void
      ) => {
        const result = rule.validator!(value, rule);
        if (typeof result === 'boolean') {
          result ? callback() : callback(new Error(rule.message ?? '校验未通过'));
          return;
        }
        if (typeof result === 'string') {
          callback(new Error(result));
          return;
        }
        Promise.resolve(result)
          .then((res) => {
            if (res === true) callback();
            else if (typeof res === 'string') callback(new Error(res));
            else callback(new Error(rule.message ?? '校验未通过'));
          })
          .catch((err: Error) => callback(err));
      };
    }
    return base;
  });
}
