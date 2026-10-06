<script setup lang="ts">
import { Typography } from '@aura/components';
</script>

<template>
  <div class="stack">
    <Typography level="1">h1 一级标题</Typography>
    <Typography level="2">h2 二级标题</Typography>
    <Typography level="3">h3 三级标题</Typography>
    <Typography level="4">h4 四级标题</Typography>
    <Typography>
      段落文本：不传 level 时渲染为 p 标签，字号与正文一致，
      适合展示说明性内容。
    </Typography>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
