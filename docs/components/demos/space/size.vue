<script setup lang="ts">
import { Space } from '@aura/components';
</script>

<template>
  <div class="stack">
    <p>三档间距：small / middle / large</p>
    <Space size="small">
      <button class="demo-btn">小</button>
      <button class="demo-btn">间</button>
      <button class="demo-btn">距</button>
    </Space>
    <Space size="large">
      <button class="demo-btn">大</button>
      <button class="demo-btn">间</button>
      <button class="demo-btn">距</button>
    </Space>

    <p>数字间距（24px）与换行：</p>
    <Space :size="24" wrap>
      <button class="demo-btn">甲</button>
      <button class="demo-btn">乙</button>
      <button class="demo-btn">丙</button>
      <button class="demo-btn">丁</button>
      <button class="demo-btn">戊</button>
      <button class="demo-btn">己</button>
      <button class="demo-btn">庚</button>
      <button class="demo-btn">辛</button>
    </Space>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

p {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}

.demo-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
