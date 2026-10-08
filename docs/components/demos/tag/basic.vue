<script setup lang="ts">
import { Tag } from '@aura-vue/components';
</script>

<template>
  <div class="row">
    <Tag>默认</Tag>
    <Tag type="primary">进行中</Tag>
    <Tag type="success">已启用</Tag>
    <Tag type="warning">待审核</Tag>
    <Tag type="danger">已停用</Tag>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
