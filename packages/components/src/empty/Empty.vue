<template>
  <div :class="prefixCls('empty')">
    <!-- 占位图是纯装饰，语义由下方描述文字承载 -->
    <div :class="prefixCls('empty-image')" aria-hidden="true">
      <svg viewBox="0 0 64 41" fill="none">
        <ellipse
          class="aura-empty-svg-ground"
          cx="32"
          cy="35"
          rx="24"
          ry="4.5"
        />
        <path
          class="aura-empty-svg-body"
          d="M12 13h40v15a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z"
        />
        <path class="aura-empty-svg-body" d="M12 13l5-7h30l5 7" />
        <path class="aura-empty-svg-slot" d="M27 20.5h10" />
      </svg>
    </div>

    <p :class="prefixCls('empty-description')">
      <slot name="description">{{ description || '暂无数据' }}</slot>
    </p>

    <div v-if="hasAction" :class="prefixCls('empty-footer')">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { prefixCls } from '@aura/shared';
import { emptyProps } from './types';
import './style/index.less';

defineOptions({ name: 'AEmpty' });

// description 由模板直接引用 prop 名，无需在脚本中解构
defineProps(emptyProps);

const slots = useSlots();

const hasAction = computed(() => Boolean(slots.default));
</script>
