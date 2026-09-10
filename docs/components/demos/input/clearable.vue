<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@aura/components';

const value = ref('可清空的内容');
const logs = ref<string[]>([]);

function onChange(v: string) {
  logs.value.unshift(`change: ${v || '（空）'}`);
  logs.value = logs.value.slice(0, 3);
}
</script>

<template>
  <div class="aura-input-demo">
    <Input v-model="value" placeholder="请输入内容" clearable @change="onChange" @clear="logs.unshift('clear')" />
    <p class="aura-tip">当前值：{{ value || '（空）' }}</p>
    <ul class="aura-logs">
      <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
    </ul>
  </div>
</template>

<style scoped>
.aura-input-demo {
  max-width: 320px;
}
.aura-tip {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
.aura-logs {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--vp-c-text-3, #888);
}
.aura-logs li {
  line-height: 1.7;
}
</style>
