<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@aura/components';

const enabled = ref(false);
</script>

<template>
  <div class="aura-switch-demo">
    <Switch v-model="enabled" />
    <p class="aura-tip">当前状态：{{ enabled ? '开启' : '关闭' }}</p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
