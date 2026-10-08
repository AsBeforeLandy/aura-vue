<script setup lang="ts">
import { ref } from 'vue';
import { Popover } from '@aura-vue/components';

const saved = ref(false);
</script>

<template>
  <div class="row">
    <Popover title="确认操作">
      <button class="demo-btn">带标题与动作区</button>
      <template #content>
        <p class="tip">删除后不可恢复，确定要继续吗？</p>
      </template>
      <template #footer>
        <button class="demo-btn" @click="saved = true">确定</button>
      </template>
    </Popover>

    <Popover placement="bottom" disabled>
      <button class="demo-btn">禁用状态</button>
      <template #content>
        <p class="tip">禁用后点击不再弹出。</p>
      </template>
    </Popover>

    <p v-if="saved" class="tip">已确定 ✓</p>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.tip {
  margin: 0;
}

.demo-btn {
  padding: 5px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
