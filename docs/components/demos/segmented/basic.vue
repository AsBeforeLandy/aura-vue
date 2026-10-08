<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from '@aura/components';

const view = ref('day');
const sort = ref('hot');
</script>

<template>
  <div class="stack">
    <p>字符串选项：</p>
    <Segmented v-model="view" :options="['日', '周', '月']" />

    <p>对象选项（文案与值分离）：</p>
    <Segmented
      v-model="sort"
      :options="[
        { label: '最热', value: 'hot' },
        { label: '最新', value: 'new' },
      ]"
    />

    <p>当前值：view = {{ view }} · sort = {{ sort }}</p>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

p {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
