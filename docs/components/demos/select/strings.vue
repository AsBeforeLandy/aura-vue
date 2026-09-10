<script setup lang="ts">
import { ref } from 'vue';
import { Select } from '@aura/components';

const options = ['待处理', '进行中', '已完成', '已关闭'];
const status = ref('进行中');
</script>

<template>
  <div class="aura-select-demo">
    <Select v-model="status" :options="options" placeholder="请选择状态" />
    <p class="aura-tip">当前状态：{{ status }}</p>
  </div>
</template>

<style scoped>
.aura-select-demo {
  max-width: 320px;
}
.aura-tip {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
