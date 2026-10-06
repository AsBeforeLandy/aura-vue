<script setup lang="ts">
import { Divider } from '@aura/components';
</script>

<template>
  <div>
    <p>默认居中文字：</p>
    <Divider>分段一</Divider>
    <p>虚线：</p>
    <Divider dashed>分段二</Divider>
    <p>文字靠左 / 靠右：</p>
    <Divider orientation="left">左侧标题</Divider>
    <Divider orientation="right">右侧备注</Divider>
    <p>不带文字：</p>
    <Divider />
  </div>
</template>

<style scoped>
p {
  margin: 8px 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
