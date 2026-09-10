<script setup lang="ts">
import { Button } from '@aura/components';
</script>

<template>
  <div class="aura-row">
    <Button>默认按钮</Button>
    <Button type="primary">主要按钮</Button>
    <Button type="dashed">虚线按钮</Button>
    <Button type="text">文本按钮</Button>
    <Button disabled>禁用按钮</Button>
    <Button loading>加载中</Button>
  </div>
</template>

<style scoped>
.aura-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
