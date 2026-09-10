<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@aura/components';

const value = ref('');
</script>

<template>
  <div class="aura-input-demo">
    <Input v-model="value" placeholder="请输入内容" />
    <p class="aura-tip">当前值：{{ value || '（空）' }}</p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
