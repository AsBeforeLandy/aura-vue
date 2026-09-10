<script setup lang="ts">
import { Button, Input } from '@aura/components';
</script>

<template>
  <div class="aura-block-demo">
    <Input placeholder="搜索关键字" />
    <Button type="primary" block>撑满整行的按钮</Button>
  </div>
</template>

<style scoped>
.aura-block-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
}
</style>
