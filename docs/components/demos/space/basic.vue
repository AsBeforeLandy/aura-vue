<script setup lang="ts">
import { Space } from '@aura/components';
</script>

<template>
  <div class="stack">
    <Space>
      <button class="demo-btn">按钮一</button>
      <button class="demo-btn">按钮二</button>
      <button class="demo-btn">按钮三</button>
    </Space>

    <Space direction="vertical">
      <button class="demo-btn">垂直一</button>
      <button class="demo-btn">垂直二</button>
    </Space>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
