<script setup lang="ts">
import { Progress } from '@aura-vue/components';
</script>

<template>
  <div class="stack">
    <Progress :percent="40" label="上传进度" />
    <Progress :percent="80" status="success" label="处理进度" />
    <Progress :percent="65" status="danger" label="配额使用" />
    <Progress :percent="55" :stroke-width="4" label="细轨道" />
    <Progress :percent="70" :show-info="false" label="无文字" />
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
