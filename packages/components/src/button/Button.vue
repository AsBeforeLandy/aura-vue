<template>
  <button :class="cls" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" :class="prefixCls('button-loading-dot')" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { buttonProps, type ButtonEmits } from './types';
import './style/index.less';

defineOptions({ name: 'AButton' });

const props = defineProps(buttonProps);
const emit = defineEmits<ButtonEmits>();

const KNOWN_TYPES: string[] = ['primary', 'default', 'dashed', 'text'];

const cls = computed(() =>
  classNames(
    prefixCls('button'),
    props.type !== 'default' &&
      KNOWN_TYPES.includes(props.type) &&
      prefixCls(`button--${props.type}`),
    props.size !== 'middle' && prefixCls(`button--${props.size}`),
    props.block && prefixCls('button--block'),
    (props.disabled || props.loading) && prefixCls('button--disabled')
  )
);

function handleClick(evt: MouseEvent) {
  if (props.disabled || props.loading) return;
  emit('click', evt);
}
</script>
