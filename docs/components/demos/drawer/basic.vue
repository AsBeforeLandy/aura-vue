<script setup lang="ts">
import { ref } from 'vue';
import { Drawer } from '@aura/components';

const visible = ref(false);
const bottomVisible = ref(false);
</script>

<template>
  <div class="row">
    <button class="demo-btn" @click="visible = true">右侧抽屉</button>
    <button class="demo-btn" @click="bottomVisible = true">底部抽屉</button>
  </div>

  <Drawer v-model="visible" title="筛选条件" :size="360">
    <p class="tip">内容区支持滚动，Esc / 遮罩 / 关闭按钮均可关闭。</p>
    <template #footer>
      <button class="demo-btn" @click="visible = false">取消</button>
      <button class="demo-btn demo-btn--primary" @click="visible = false">
        应用
      </button>
    </template>
  </Drawer>

  <Drawer
    v-model="bottomVisible"
    placement="bottom"
    :size="200"
    title="底部抽屉"
  >
    <p class="tip">placement="bottom" 时 size 表示高度。</p>
  </Drawer>
</template>

<style scoped>
.row {
  display: flex;
  gap: 12px;
}

.tip {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}

.demo-btn {
  padding: 5px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.demo-btn--primary {
  border-color: #7c3aed;
  background: #7c3aed;
  color: #fff;
}
</style>
