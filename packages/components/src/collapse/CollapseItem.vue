<template>
  <div :class="itemCls">
    <!--
      标题行是原生 button：自带 Enter / Space 激活与焦点环，
      aria-expanded 表达展开态，aria-controls 关联面板（region）。
    -->
    <button
      :id="context?.headerId(value)"
      type="button"
      :class="prefixCls('collapse-header')"
      :aria-expanded="open"
      :aria-controls="context?.panelId(value)"
      :disabled="disabled"
      @click="onClick"
    >
      <span :class="prefixCls('collapse-title')">
        <slot name="title">{{ title }}</slot>
      </span>
      <svg
        :class="prefixCls('collapse-arrow')"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!--
      展开动画用 grid-template-rows 0fr -> 1fr（纯 CSS，无需测量内容高度）；
      内容保持挂载（v-show），收起只是折叠不销毁。
    -->
    <div
      v-show="open"
      :id="context?.panelId(value)"
      role="region"
      :aria-labelledby="context?.headerId(value)"
      :class="prefixCls('collapse-content')"
    >
      <div :class="prefixCls('collapse-content-inner')">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { collapseItemProps, type CollapseContext } from './types';
import './style/index.less';

defineOptions({ name: 'ACollapseItem' });

const props = defineProps(collapseItemProps);

const context = inject<CollapseContext | null>('aura-collapse', null);
const open = computed(() => context?.isOpen(props.value) ?? false);

function onClick() {
  if (props.disabled) return;
  context?.toggle(props.value);
}

const itemCls = computed(() =>
  classNames(
    prefixCls('collapse-item'),
    open.value && prefixCls('collapse-item--open'),
    props.disabled && prefixCls('collapse-item--disabled'),
  ),
);
</script>
