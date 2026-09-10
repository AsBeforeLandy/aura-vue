<script setup lang="ts">
import { ref } from 'vue';
import { Select } from '@aura/components';

const city = ref('');
const assigned = ref('design');

const options = [
  { label: '杭州', value: 'hangzhou' },
  { label: '上海', value: 'shanghai' },
  { label: '深圳（暂不可选）', value: 'shenzhen', disabled: true }
];

const roles = [
  { label: '产品设计', value: 'design' },
  { label: '前端开发', value: 'frontend' },
  { label: '后端开发', value: 'backend' }
];

function onChange(v: string) {
  console.log('change:', v);
}
</script>

<template>
  <div class="aura-select-demo">
    <div class="aura-field">
      <span class="aura-field-label">受控 + 禁用项</span>
      <Select v-model="city" placeholder="请选择城市" :options="options" @change="onChange" />
    </div>
    <div class="aura-field">
      <span class="aura-field-label">非受控（初始值 design）</span>
      <Select :default-value="assigned" :options="roles" />
    </div>
    <div class="aura-field">
      <span class="aura-field-label">整体禁用</span>
      <Select disabled placeholder="不可操作" :options="roles" />
    </div>
  </div>
</template>

<style scoped>
.aura-select-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 320px;
}
.aura-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.aura-field-label {
  font-size: 12px;
  color: var(--vp-c-text-3, #888);
}
</style>
