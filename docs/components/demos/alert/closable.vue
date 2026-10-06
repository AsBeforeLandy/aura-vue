<script setup lang="ts">
import { ref } from 'vue';
import { Alert } from '@aura/components';

/** 非受控：内部自持显隐 */
const showUncontrolled = ref(true);
/** 受控：显隐完全由外部驱动 */
const visible = ref(true);
</script>

<template>
  <div class="stack">
    <p>非受控（default-visible）：关闭后不可恢复，除非外部重置：</p>
    <Alert
      v-if="showUncontrolled"
      closable
      type="warning"
      title="维护通知"
      @close="showUncontrolled = false"
    >
      服务将于今晚 22:00 维护。
    </Alert>
    <button class="demo-btn" @click="showUncontrolled = true">恢复显示</button>

    <p>受控（v-model:visible）：是否隐藏由外部决定：</p>
    <Alert v-model:visible="visible" closable type="info" title="受控提示">
      是否关闭由外部按钮决定。
    </Alert>
    <button class="demo-btn" @click="visible = !visible">
      {{ visible ? '隐藏' : '显示' }}
    </button>
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
  align-self: flex-start;
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
