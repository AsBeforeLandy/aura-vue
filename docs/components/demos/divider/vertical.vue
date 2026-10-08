<script setup lang="ts">
import { Divider } from '@aura-vue/components';
</script>

<template>
  <div class="toolbar">
    <span>复制</span>
    <Divider direction="vertical" />
    <span>粘贴</span>
    <Divider direction="vertical" dashed />
    <span>剪切</span>
    <Divider direction="vertical" />
    <span>删除</span>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  font-size: 14px;
}
</style>
