<template>
  <div :class="prefixCls('skeleton')" :aria-busy="loading ? 'true' : 'false'">
    <template v-if="loading">
      <div
        v-if="avatar"
        :class="prefixCls('skeleton-header')"
        aria-hidden="true"
      >
        <span :class="prefixCls('skeleton-avatar')" />
      </div>
      <div :class="prefixCls('skeleton-content')" aria-hidden="true">
        <span v-if="title" :class="prefixCls('skeleton-title')" />
        <span v-for="i in rows" :key="i" :class="rowCls(i)" />
      </div>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
// aria-busy 告诉读屏「这块内容正在更新，先别急着读」；
// 骨架块本身是装饰（模板内 aria-hidden），真实内容由 loading 结束后的插槽承载。
// ⚠️ 模板根节点前不能写 HTML 注释——Vue 会把「注释 + 根节点」当多根组件，
// 破坏单根透传与测试工具对根元素的定位（Spin 批次已踩过一次）。
import { computed } from 'vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { skeletonProps } from './types';
import './style/index.less';

defineOptions({ name: 'ASkeleton' });

const props = defineProps(skeletonProps);

/** 骨架块行数钳位：负数按 0 处理，避免渲染出反直觉的负行 */
const safeRows = computed(() => Math.max(0, Math.floor(props.rows)));

const rowCls = (index: number) =>
  classNames(
    prefixCls('skeleton-row'),
    index === safeRows.value && prefixCls('skeleton-row--last'),
  );
</script>
