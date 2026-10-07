<template>
  <div :class="cls" role="alert">
    <span :class="prefixCls('message-icon')" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle v-if="iconShape === 'circle'" cx="12" cy="12" r="9" />
        <path v-else d="M12 3.5 21 19.5H3z" />
        <path :d="iconMark" />
      </svg>
    </span>

    <span :class="prefixCls('message-content')">{{ content }}</span>

    <button
      v-if="closable"
      type="button"
      :class="prefixCls('message-close')"
      aria-label="关闭"
      @click="$emit('close')"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura/shared';
import {
  semanticIconMark,
  semanticIconShape,
} from '../_internal/semantic-icon';
import { messageItemProps } from './types';
import './style/index.less';

defineOptions({ name: 'AMessageItem' });

const props = defineProps(messageItemProps);

defineEmits<{ (e: 'close'): void }>();

const iconShape = computed(() => semanticIconShape(props.type));
const iconMark = computed(() => semanticIconMark(props.type));

const cls = computed(() =>
  classNames(
    prefixCls('message'),
    pickPresetClass(
      props.type,
      ['info', 'success', 'warning', 'danger'],
      prefixCls('message--'),
    ),
    props.closable && prefixCls('message--closable'),
  ),
);
</script>
