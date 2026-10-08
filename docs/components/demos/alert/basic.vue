<script setup lang="ts">
import { Alert } from '@aura-vue/components';
</script>

<template>
  <div class="stack">
    <Alert title="提示" type="info">这是一条中性提示。</Alert>
    <Alert title="成功" type="success">操作已保存。</Alert>
    <Alert title="警告" type="warning" show-icon>磁盘空间不足 10%。</Alert>
    <Alert title="错误" type="danger" show-icon closable>
      同步失败，请检查网络后重试。
    </Alert>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
