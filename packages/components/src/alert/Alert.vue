<template>
  <div v-if="visible" :class="cls" role="alert">
    <!--
      图标是纯装饰（状态语义已由 role="alert" 与配色承载），对读屏隐藏；
      warning 用三角底，其余三类共用圆底，靠中间的路径区分。
    -->
    <span v-if="showIcon" :class="prefixCls('alert-icon')" aria-hidden="true">
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

    <div :class="prefixCls('alert-content')">
      <div v-if="hasTitle" :class="prefixCls('alert-title')">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="hasDesc" :class="prefixCls('alert-desc')">
        <slot />
      </div>
    </div>

    <!-- 原生 button：自带可聚焦性、Enter/Space 激活（与 Modal / Tag 关闭控件同一约定） -->
    <button
      v-if="closable"
      type="button"
      :class="prefixCls('alert-close')"
      aria-label="关闭"
      @click.stop="onClose"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura/shared';
import { alertProps, type AlertEmits } from './types';
import {
  semanticIconMark,
  semanticIconShape,
} from '../_internal/semantic-icon';
import './style/index.less';

defineOptions({ name: 'AAlert' });

const props = defineProps(alertProps);
const emit = defineEmits<AlertEmits>();
const slots = useSlots();

/** 显隐双轨受控：属性名是 visible（与 Tag 同款），无法直接复用 useControllable */
const innerVisible = ref(props.defaultVisible);
const isControlled = computed(() => props.visible !== undefined);
const visible = computed(() =>
  isControlled.value ? props.visible : innerVisible.value,
);

const hasTitle = computed(() => Boolean(props.title) || Boolean(slots.title));
const hasDesc = computed(() => Boolean(slots.default));

// 图标形状数据来自内部共享模块（Message 同款），不在组件里各写一份
const iconShape = computed(() => semanticIconShape(props.type));
const iconMark = computed(() => semanticIconMark(props.type));

const cls = computed(() =>
  classNames(
    prefixCls('alert'),
    pickPresetClass(
      props.type,
      ['info', 'success', 'warning', 'danger'],
      prefixCls('alert--'),
    ),
    props.showIcon && prefixCls('alert--show-icon'),
    hasTitle.value && prefixCls('alert--with-title'),
  ),
);

function onClose(evt: MouseEvent) {
  emit('close', evt);
  if (!isControlled.value) innerVisible.value = false;
  emit('update:visible', false);
}
</script>
