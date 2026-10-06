<script setup lang="ts">
import { ref } from 'vue';
import { Tag } from '@aura/components';

/** 非受控：内部自持显隐 */
const showUncontrolled = ref(true);
/** 受控：显隐完全由外部驱动 */
const visible = ref(true);

const logs = ref<string[]>([]);
function onClose(name: string) {
  logs.value.unshift(`关闭了「${name}」`);
  if (logs.value.length > 3) logs.value.pop();
}
</script>

<template>
  <div class="stack">
    <p>非受控（default-visible）：关闭后内部自持，不可恢复：</p>
    <div class="row">
      <Tag
        v-if="showUncontrolled"
        closable
        type="primary"
        @close="onClose('非受控标签')"
      >
        可关闭标签
      </Tag>
      <button class="demo-btn" @click="showUncontrolled = true">恢复</button>
    </div>

    <p>受控（v-model:visible）：是否隐藏由外部决定：</p>
    <div class="row">
      <Tag
        v-model:visible="visible"
        closable
        type="warning"
        @close="onClose('受控标签')"
      >
        受控标签
      </Tag>
      <button class="demo-btn" @click="visible = !visible">
        {{ visible ? '隐藏' : '显示' }}
      </button>
    </div>

    <p v-if="logs.length" class="logs">事件记录：{{ logs.join(' · ') }}</p>
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

.row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.logs {
  color: var(--vp-c-text-2, #666);
}

.demo-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
