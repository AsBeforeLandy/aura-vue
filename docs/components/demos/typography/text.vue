<script setup lang="ts">
import { Typography } from '@aura-vue/components';
</script>

<template>
  <div class="stack">
    <p>语义色：</p>
    <Typography type="secondary">次要信息（secondary）</Typography>
    <Typography type="success">成功状态（success）</Typography>
    <Typography type="warning">警告提示（warning）</Typography>
    <Typography type="danger">危险 / 出错（danger）</Typography>

    <p>行内强调（可组合）：</p>
    <Typography strong>加粗文本</Typography>
    <Typography underline>下划线文本</Typography>
    <Typography delete>已废弃文本</Typography>
    <Typography underline delete>下划线 + 删除线</Typography>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

p {
  margin: 8px 0 2px;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
