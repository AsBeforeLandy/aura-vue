<template>
  <div :class="cls">
    <label v-if="label || required" :class="prefixCls('form-item-label')">
      <span v-if="required" :class="prefixCls('form-item-required')" aria-hidden="true">*</span>
      {{ label }}
    </label>
    <div :class="prefixCls('form-item-control')">
      <slot />
      <div v-if="error" :class="prefixCls('form-item-error')" role="alert">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import {
  formContextKey,
  formItemHookKey,
  type FormItemContext
} from './context';
import { validateValue } from './validator';
import { formItemProps } from './types';
import './style/index.less';

defineOptions({ name: 'AFormItem' });

const props = defineProps(formItemProps);

const form = inject(formContextKey, null);
const error = ref('');

const cls = computed(() =>
  classNames(
    prefixCls('form-item'),
    error.value && prefixCls('form-item--error')
  )
);

/**
 * 按触发时机过滤规则后校验：
 * - submit 触发全部规则
 * - change / blur 只触发对应 trigger 或未声明 trigger 的规则
 */
async function validate(trigger: 'change' | 'blur' | 'submit'): Promise<string | null> {
  if (!form || !props.prop) return null;

  const rules = props.rules.filter(
    (rule) => trigger === 'submit' || !rule.trigger || rule.trigger === trigger
  );
  if (rules.length === 0) return null;

  const err = await validateValue(form.model[props.prop], rules);
  error.value = err ?? '';
  return err;
}

function resetValidation() {
  error.value = '';
}

provide(formItemHookKey, {
  onControlChange: () => {
    void validate('change');
  },
  onControlBlur: () => {
    void validate('blur');
  }
});

const context: FormItemContext = {
  prop: props.prop,
  validate,
  resetValidation
};

onMounted(() => form?.addItem(context));
onBeforeUnmount(() => form?.removeItem(context));

defineExpose({ validate, resetValidation });
</script>
