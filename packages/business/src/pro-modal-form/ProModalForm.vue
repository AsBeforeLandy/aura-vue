<template>
  <ElDialog
    :model-value="modelValue"
    :title="resolvedTitle"
    :width="resolvedWidth"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :append-to-body="appendToBody"
    destroy-on-close
    :class="prefixCls('pro-modal-form')"
    @update:model-value="handleVisibleChange"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <ProForm
      ref="formRef"
      v-model="formValues"
      :items="items"
      :columns="columns"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :readonly="isViewMode"
      @submit="handleFormSubmit"
    />

    <template #footer>
      <slot name="footer" :ok="handleOk" :cancel="handleCancel" :submitting="submitting">
        <ElButton @click="handleCancel">{{ cancelText }}</ElButton>
        <ElButton
          v-if="!isViewMode"
          type="primary"
          :loading="submitting"
          @click="handleOk"
        >
          {{ resolvedOkText }}
        </ElButton>
      </slot>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElButton, ElDialog } from 'element-plus';
import { prefixCls } from '@aura/shared';
import { ProForm } from '../pro-form';
import type { ProFormInstance } from '../pro-form/types';
import {
  proModalFormProps,
  resolveTitle,
  type ProModalFormEmits
} from './types';
import './style/index.less';

defineOptions({ name: 'AProModalForm' });

const props = defineProps(proModalFormProps);
const emit = defineEmits<ProModalFormEmits>();

const formRef = ref<ProFormInstance>();
const formValues = ref<Record<string, unknown>>({});
const submitting = ref(false);

const isViewMode = computed(() => props.mode === 'view');
const resolvedTitle = computed(() => resolveTitle(props.mode, props.title));
const resolvedOkText = computed(() => props.okText || (props.mode === 'edit' ? '保存' : '确定'));

const resolvedWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width
);

/**
 * 回填表单值。
 *
 * 关键时序：必须在 ProForm 完成首次渲染之前就把值写进 formValues，
 * 否则 ProForm 会以空对象走受控分支并渲染出空表单（formValues 是 v-model，
 * 传入即视为受控模式，ProForm 内部的 defaultValue 不会再生效）。
 * 因此这里用 watch 的 immediate + flush: 'sync' 在挂载前同步求值。
 */
function syncValues() {
  formValues.value = { ...props.initialValues };
}

// initialValues 变化时同步（deep 保证对象内部字段被就地修改也能感知）
watch(
  () => props.initialValues,
  () => {
    if (props.modelValue) syncValues();
  },
  { deep: true }
);

// 打开时回填。flush: 'sync' 让赋值在渲染前生效，
// 避免 ProForm 先以空值渲染一帧再被覆盖。
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.resetOnOpen) syncValues();
  },
  { immediate: true, flush: 'sync' }
);

function handleOpen() {
  emit('open');
}

function handleClosed() {
  emit('closed');
}

function handleVisibleChange(visible: boolean) {
  // 提交中禁止通过关闭按钮/遮罩中断，避免请求与 UI 状态不一致
  if (submitting.value) return;
  emit('update:modelValue', visible);
  if (!visible) emit('cancel');
}

function handleCancel() {
  if (submitting.value) return;
  emit('update:modelValue', false);
  emit('cancel');
}

/** 确认：先校验，再提交，成功才关闭 */
async function handleOk() {
  if (isViewMode.value) {
    emit('update:modelValue', false);
    return;
  }
  const valid = await formRef.value?.validate();
  if (!valid) return;

  const values = { ...formValues.value };

  if (!props.submit) {
    // 无 submit 时退化为受控用法，由外部监听 ok 自行处理
    emit('success', values);
    emit('update:modelValue', false);
    return;
  }

  submitting.value = true;
  try {
    await props.submit(values);
    emit('success', values);
    emit('update:modelValue', false);
  } catch (error) {
    // 提交失败保持弹窗打开，让用户修正后重试
    emit('error', error);
  } finally {
    submitting.value = false;
  }
}

/** ProForm 内部触发的 submit（回车提交等场景）转交给统一的确认流程 */
function handleFormSubmit() {
  handleOk();
}

defineExpose({
  /** 获取当前表单值 */
  getValues: () => ({ ...formValues.value }),
  /** 手动设置表单值 */
  setValues: (values: Record<string, unknown>) => {
    formValues.value = { ...formValues.value, ...values };
  },
  /** 触发校验 */
  validate: () => formRef.value?.validate(),
  /** 当前是否处于提交中 */
  isSubmitting: () => submitting.value
});
</script>
