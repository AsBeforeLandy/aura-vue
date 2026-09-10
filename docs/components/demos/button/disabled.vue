<script setup lang="ts">
import { Button } from '@aura/components';
</script>

<template>
  <div class="aura-row">
    <Button disabled>禁用按钮</Button>
    <Button type="primary" disabled>禁用的主按钮</Button>
    <Button type="dashed" disabled>禁用的虚线按钮</Button>
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
