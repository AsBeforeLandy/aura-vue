<script setup lang="ts">
import { ref } from 'vue';
import { Select } from '@aura/components';

const city = ref('');

const options = [
  { label: '杭州', value: 'hangzhou' },
  { label: '上海', value: 'shanghai' },
  { label: '深圳（暂不可选）', value: 'shenzhen', disabled: true }
];
</script>

<template>
  <div>
    <Select v-model="city" placeholder="请选择城市" :options="options" />
    <p class="aura-tip">当前选择：{{ city || '（未选择）' }}</p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
