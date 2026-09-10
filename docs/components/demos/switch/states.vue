<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@aura/components';

const on = ref(true);
const inner = ref(false);
const logs = ref<string[]>([]);

function onChange(v: boolean) {
  logs.value.unshift(`change: ${v}`);
  logs.value = logs.value.slice(0, 3);
}
</script>

<template>
  <div class="aura-switch-demo">
    <div class="aura-switch-row">
      <Switch v-model="on" />
      <span class="aura-switch-text">受控：{{ on ? '开启' : '关闭' }}</span>
    </div>
    <div class="aura-switch-row">
      <Switch :default-value="true" @change="onChange" />
      <span class="aura-switch-text">非受控（初始 true）</span>
    </div>
    <div class="aura-switch-row">
      <Switch disabled />
      <span class="aura-switch-text">禁用</span>
    </div>
    <div class="aura-switch-row">
      <Switch disabled :default-value="true" />
      <span class="aura-switch-text">禁用且开启</span>
    </div>
    <ul class="aura-logs">
      <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
    </ul>
  </div>
</template>

<style scoped>
.aura-switch-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.aura-switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.aura-switch-text {
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
.aura-logs {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--vp-c-text-3, #888);
}
</style>
