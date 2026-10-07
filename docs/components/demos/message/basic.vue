<script setup lang="ts">
import { Message } from '@aura/components';

function demo(type: 'info' | 'success' | 'warning' | 'danger') {
  const texts = {
    info: '这是一条普通消息',
    success: '设置已保存',
    warning: '配额即将用尽',
    danger: '同步失败，请重试',
  };
  Message[type](texts[type]);
}
</script>

<template>
  <div class="row">
    <button class="demo-btn" @click="demo('info')">普通</button>
    <button class="demo-btn" @click="demo('success')">成功</button>
    <button class="demo-btn" @click="demo('warning')">警告</button>
    <button class="demo-btn" @click="demo('danger')">失败</button>
    <button
      class="demo-btn"
      @click="Message.danger('手动关闭的消息', { duration: 0, closable: true })"
    >
      不自动关闭
    </button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 5px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
