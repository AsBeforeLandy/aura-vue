<template>
  <component :is="tag" :class="cls">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { typographyProps } from './types';
import './style/index.less';

defineOptions({ name: 'ATypography' });

const props = defineProps(typographyProps);

/** level 只认 1~4；超出范围（或未传）一律按段落渲染，避免渲染出无样式约定的标题 */
const tag = computed(() => {
  const level = props.level;
  return level === 1 || level === 2 || level === 3 || level === 4
    ? `h${level}`
    : 'p';
});

const cls = computed(() =>
  classNames(
    prefixCls('typography'),
    tag.value !== 'p' && prefixCls(`typography--h${props.level}`),
    props.type && prefixCls(`typography--${props.type}`),
    props.strong && prefixCls('typography--strong'),
    props.underline && prefixCls('typography--underline'),
    props.delete && prefixCls('typography--delete'),
  ),
);
</script>
