<template>
  <span :class="cls">
    <input
      ref="inputRef"
      :class="prefixCls('input-inner')"
      :value="model ?? ''"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="onInput"
      @change="onChange"
      @blur="onBlur"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    />
    <span
      v-if="clearable && !disabled && !!model"
      :class="prefixCls('input-clear')"
      role="button"
      aria-label="清空"
      @click="onClear"
    >×</span>
  </span>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { useControllable } from '../composables/use-controllable';
import { formItemHookKey } from '../form/context';
import { inputProps, type InputEmits } from './types';
import './style/index.less';

defineOptions({ name: 'AInput' });

const props = defineProps(inputProps);
const emit = defineEmits<InputEmits>();

const model = useControllable<string>(props, emit);
/** 处于 FormItem 内时自动接入表单校验 */
const formItemHook = inject(formItemHookKey, null);

const cls = computed(() =>
  classNames(
    prefixCls('input'),
    props.disabled && prefixCls('input--disabled')
  )
);

const inputRef = ref<HTMLInputElement>();

/** 受控模式下 DOM 值必须立即复位为外部值，保证"外部不更新则显示不变" */
function syncDomValue() {
  if (props.modelValue !== undefined && inputRef.value) {
    inputRef.value.value = props.modelValue ?? '';
  }
}

/**
 * IME 组合输入守卫：中文/日文等输入法组词期间会持续触发 input 事件，
 * 此期间同步值或复位 DOM 会打断组词（表现为"输入不了中文"）。
 * 与 Vue 原生 v-model 策略一致：合成中不更新，compositionend 后再取最终文本。
 */
const isComposing = ref(false);

function onCompositionStart() {
  isComposing.value = true;
}

function onCompositionEnd(evt: Event) {
  isComposing.value = false;
  onInput(evt);
}

function onInput(evt: Event) {
  if (isComposing.value) return;
  model.value = (evt.target as HTMLInputElement).value;
  syncDomValue();
  formItemHook?.onControlChange();
}

function onBlur() {
  formItemHook?.onControlBlur();
}

function onChange(evt: Event) {
  emit('change', (evt.target as HTMLInputElement).value);
}

function onClear() {
  model.value = '';
  syncDomValue();
  emit('clear');
}
</script>
