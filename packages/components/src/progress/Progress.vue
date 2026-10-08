<template>
  <div
    :class="cls"
    role="progressbar"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
  >
    <div
      :class="prefixCls('progress-track')"
      :style="{ height: `${strokeWidth}px` }"
    >
      <div
        :class="prefixCls('progress-bar')"
        :style="{ width: `${clamped}%` }"
      />
    </div>
    <span v-if="showInfo" :class="prefixCls('progress-info')">
      {{ infoText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura-vue/shared';
import { progressProps } from './types';
import './style/index.less';

defineOptions({ name: 'AProgress' });

const props = defineProps(progressProps);

/** 进度是「比例」语义，越界值钳位而不是报错——上游常拿平均值直接传进来 */
const clamped = computed(() => Math.min(100, Math.max(0, props.percent)));

const infoText = computed(() => `${Math.round(clamped.value)}%`);

const cls = computed(() =>
  classNames(
    prefixCls('progress'),
    pickPresetClass(
      props.status,
      ['normal', 'success', 'danger'],
      prefixCls('progress--'),
    ),
  ),
);
</script>
