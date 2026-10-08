<script setup lang="ts">
import { Spin } from '@aura-vue/components';
</script>

<template>
  <div class="row">
    <Spin size="small" />
    <Spin />
    <Spin size="large" />
    <Spin tip="数据加载中…" />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 40px;
  align-items: center;
  min-height: 80px;
}
</style>
