<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@aura/components';

const keyword = ref('');
</script>

<template>
  <div class="aura-toolbar">
    <Input v-model="keyword" placeholder="搜索任务名称" clearable style="max-width: 280px" />
  </div>
</template>

<style scoped>
.aura-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
