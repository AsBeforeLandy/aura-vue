<template>
  <div :class="cls" role="separator" :aria-orientation="direction">
    <span v-if="hasText" :class="prefixCls('divider-text')">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura-vue/shared';
import { dividerProps } from './types';
import './style/index.less';

defineOptions({ name: 'ADivider' });

const props = defineProps(dividerProps);
const slots = useSlots();

/** 只有水平方向才渲染文字；垂直分割线在工具栏里夹在图标之间，文字没有意义 */
const hasText = computed(
  () => props.direction === 'horizontal' && Boolean(slots.default),
);

const cls = computed(() =>
  classNames(
    prefixCls('divider'),
    pickPresetClass(
      props.direction,
      ['horizontal', 'vertical'],
      prefixCls('divider--'),
    ),
    props.dashed && prefixCls('divider--dashed'),
    hasText.value && prefixCls('divider--with-text'),
    hasText.value &&
      pickPresetClass(
        props.orientation,
        ['left', 'center', 'right'],
        prefixCls('divider--'),
      ),
  ),
);
</script>
