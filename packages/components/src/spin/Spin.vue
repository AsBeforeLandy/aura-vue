<template>
  <div v-if="spinning" :class="cls" role="status" aria-live="polite">
    <span :class="prefixCls('spin-indicator')" aria-hidden="true" />
    <span v-if="hasTip" :class="prefixCls('spin-tip')">
      <slot name="tip">{{ tip || '加载中…' }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
// role="status" + aria-live="polite"：加载状态出现 / 消失时读屏会播报，
// 文案是唯一的信息载体，因此指示器对读屏隐藏（aria-hidden）。
// 注意：模板根节点前不要写 HTML 注释——Vue 会把「注释 + v-if 根」当作
// 多根组件，破坏单根透传与测试工具对根元素的定位（第一版就栽在这里）。
import { computed, useSlots } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura/shared';
import { spinProps } from './types';
import './style/index.less';

defineOptions({ name: 'ASpin' });

const props = defineProps(spinProps);
const slots = useSlots();

const hasTip = computed(() => Boolean(props.tip) || Boolean(slots.tip));

const cls = computed(() =>
  classNames(
    prefixCls('spin'),
    pickPresetClass(
      props.size,
      ['small', 'middle', 'large'],
      prefixCls('spin--'),
    ),
  ),
);
</script>
