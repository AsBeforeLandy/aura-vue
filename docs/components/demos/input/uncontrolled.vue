<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@aura/components';

/** 非受控模式：只给初始值，值由组件内部自持 */
const inner = ref('');

function onChange(v: string) {
  inner.value = v;
}
</script>

<template>
  <div class="aura-input-demo">
    <Input :default-value="'非受控初始值'" placeholder="请输入内容" @change="onChange" />
    <p class="aura-tip">内部自持，通过 change 外抛：{{ inner || '（尚未输入）' }}</p>
    <Input disabled placeholder="禁用状态" />
    <Input model-value="只读的受控值" disabled />
  </div>
</template>

<style scoped>
.aura-input-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
}
.aura-tip {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
