<script setup lang="ts">
import { ref } from 'vue';
import { WeekTimeRange } from '@aura/business';
import type { WeekTimeRangeValue } from '@aura/business';

const value = ref<WeekTimeRangeValue>([
  [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '18:00' },
  ],
  [{ start: '09:00', end: '12:00' }],
  [],
  [{ start: '10:00', end: '16:00' }],
  [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '18:00' },
  ],
  [],
  [],
]);
</script>

<template>
  <div>
    <WeekTimeRange v-model="value" />
    <p class="aura-tip">支持单击切换、按住鼠标拖拽框选；相邻时段会自动合并。</p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
