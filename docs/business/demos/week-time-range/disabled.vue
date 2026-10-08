<script setup lang="ts">
import { ref } from 'vue';
import { WeekTimeRange } from '@aura-vue/business';
import type { WeekTimeRangeValue } from '@aura-vue/business';

const value = ref<WeekTimeRangeValue>([
  [{ start: '09:00', end: '18:00' }],
  [],
  [{ start: '09:00', end: '18:00' }],
  [],
  [{ start: '09:00', end: '18:00' }],
  [],
  [],
]);
</script>

<template>
  <WeekTimeRange v-model="value" disabled :cell-width="14" :cell-height="30" />
</template>
