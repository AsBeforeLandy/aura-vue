<script setup lang="ts">
import { Empty } from '@aura-vue/components';
</script>

<template>
  <div class="grid">
    <Empty />
    <Empty description="没有匹配的结果" />
    <Empty description="还没有项目">
      <button class="demo-btn">新建项目</button>
    </Empty>
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-btn {
  padding: 5px 16px;
  border: 1px solid #7c3aed;
  border-radius: 6px;
  background: #7c3aed;
  color: #fff;
  cursor: pointer;
}
</style>
