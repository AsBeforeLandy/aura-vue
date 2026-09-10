<template>
  <form :class="prefixCls('form')" @submit.prevent>
    <slot />
  </form>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { prefixCls } from '@aura/shared';
import { formContextKey, type FormItemContext } from './context';
import { formProps } from './types';
import './style/index.less';

defineOptions({ name: 'AForm' });

const props = defineProps(formProps);

const items = new Set<FormItemContext>();

provide(formContextKey, {
  model: props.model,
  addItem: (item) => {
    items.add(item);
  },
  removeItem: (item) => {
    items.delete(item);
  }
});

/** 触发全部表单项校验，聚合错误信息 */
async function validate(): Promise<{
  valid: boolean;
  errors: Record<string, string>;
}> {
  const errors: Record<string, string> = {};

  await Promise.all(
    [...items].map(async (item) => {
      const err = await item.validate('submit');
      if (err && item.prop) {
        errors[item.prop] = err;
      }
    })
  );

  return { valid: Object.keys(errors).length === 0, errors };
}

function resetValidation() {
  items.forEach((item) => item.resetValidation());
}

defineExpose({ validate, resetValidation });
</script>
