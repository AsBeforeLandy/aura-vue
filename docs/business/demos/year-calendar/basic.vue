<script setup lang="ts">
import { ref } from 'vue';
import { YearCalendar } from '@aura-vue/business';

const selected = ref<string[]>(['2026-01-01', '2026-05-01', '2026-10-01']);
</script>

<template>
  <div>
    <YearCalendar v-model="selected" :year="2026" />
    <p class="aura-tip">
      当前选中 {{ selected.length }} 天：{{ selected.join('、') || '（无）' }}
    </p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
