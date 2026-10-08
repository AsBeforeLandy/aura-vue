<template>
  <ol :class="cls">
    <li
      v-for="(item, i) in items"
      :key="i"
      :class="itemCls(i)"
      :aria-current="i === clampedCurrent ? 'step' : undefined"
    >
      <span :class="prefixCls('steps-marker')" aria-hidden="true">
        <svg
          v-if="i < clampedCurrent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m7 12.5 3.2 3.2L17 9" />
        </svg>
        <span v-else>{{ i + 1 }}</span>
      </span>
      <span :class="prefixCls('steps-body')">
        <span :class="prefixCls('steps-title')">{{ item.title }}</span>
        <span v-if="item.description" :class="prefixCls('steps-desc')">
          {{ item.description }}
        </span>
      </span>
    </li>
  </ol>
</template>

<script setup lang="ts">
// 步骤条本质是有序列表：ol / li 承载语义，active 项用 aria-current="step"
// 标记，读屏用户能直接听到「当前是哪步」。圆圈里的对勾是装饰
// （状态已由 aria-current 与配色承载），对读屏隐藏。
// ⚠️ 模板根节点前不能写 HTML 注释（Vue 会当多根组件，Spin 批次已踩过）。
import { computed } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { stepsProps } from './types';
import './style/index.less';

defineOptions({ name: 'ASteps' });

const props = defineProps(stepsProps);

/**
 * current 钳位到 [-1, items.length]：
 * -1 表示还没开始（全部是 wait），length 表示全部完成；
 * 中间越界值同样只影响状态推断，不让样式层拿到离谱下标。
 */
const clampedCurrent = computed(() =>
  Math.min(props.items.length, Math.max(-1, props.current)),
);

const stateOf = (index: number): 'finish' | 'process' | 'error' | 'wait' => {
  if (index < clampedCurrent.value) return 'finish';
  if (index === clampedCurrent.value) {
    return props.status === 'error' ? 'error' : 'process';
  }
  return 'wait';
};

const itemCls = (index: number) =>
  classNames(
    prefixCls('steps-item'),
    prefixCls(`steps-item--${stateOf(index)}`),
    index === props.items.length - 1 && prefixCls('steps-item--last'),
  );

const cls = computed(() => prefixCls('steps'));
</script>
