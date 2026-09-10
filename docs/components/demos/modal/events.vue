<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button } from '@aura/components';

const open = ref(false);
const events = ref<string[]>([]);

function log(name: string) {
  events.value.unshift(`@${name}`);
  events.value = events.value.slice(0, 4);
}
</script>

<template>
  <div>
    <Button type="primary" @click="open = true">打开弹窗（监听全部事件）</Button>
    <Modal
      v-model="open"
      title="事件演示"
      @ok="log('ok')"
      @cancel="log('cancel')"
      @close="log('close')"
    >
      <p>点击底部按钮、遮罩、按 ESC 或右上角 ×，都会触发对应的回调。</p>
      <p class="aura-tip">已触发：{{ events.join('、') || '（暂无）' }}</p>
    </Modal>
  </div>
</template>

<style scoped>
.aura-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
