<script setup lang="ts">
import { ref } from 'vue';
import { WeekTimeRange } from '@aura-vue/business';
import type { WeekTimeRangeValue } from '@aura-vue/business';

const value = ref<WeekTimeRangeValue>(Array.from({ length: 7 }, () => []));
</script>

<template>
  <WeekTimeRange v-model="value" :step-minutes="60" :week-starts-on="0" />
</template>
