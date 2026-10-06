<template>
  <div :class="cls" :style="gapStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura/shared';
import { spaceProps } from './types';
import './style/index.less';

defineOptions({ name: 'ASpace' });

const props = defineProps(spaceProps);

const sizeClass = computed(() =>
  typeof props.size === 'string'
    ? pickPresetClass(
        props.size,
        ['small', 'middle', 'large'],
        prefixCls('space--size-'),
      )
    : '',
);

const cls = computed(() =>
  classNames(
    prefixCls('space'),
    pickPresetClass(
      props.direction,
      ['horizontal', 'vertical'],
      prefixCls('space--'),
    ),
    sizeClass.value,
    props.wrap && prefixCls('space--wrap'),
    pickPresetClass(
      props.align ?? '',
      ['start', 'center', 'end', 'baseline'],
      prefixCls('space--align-'),
    ),
  ),
);

const gapStyle = computed(() =>
  typeof props.size === 'number' ? { gap: `${props.size}px` } : undefined,
);
</script>
