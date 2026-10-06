<script setup lang="ts">
import { Tooltip } from '@aura/components';
</script>

<template>
  <div class="row">
    <Tooltip content="默认出现在上方">
      <button class="demo-btn">上方</button>
    </Tooltip>
    <Tooltip content="也可以出现在下方" placement="bottom">
      <button class="demo-btn">下方</button>
    </Tooltip>
    <Tooltip content="键盘 Tab 聚焦同样会弹出">
      <button class="demo-btn">键盘可达</button>
    </Tooltip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 16px;
}

.demo-btn {
  padding: 5px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
