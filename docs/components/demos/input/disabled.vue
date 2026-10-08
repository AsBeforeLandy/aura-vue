<script setup lang="ts">
import { Input } from '@aura-vue/components';
</script>

<template>
  <div class="aura-input-demo">
    <Input disabled placeholder="禁用状态" />
    <Input model-value="禁用但有初始值" disabled clearable />
    <p class="aura-tip">
      禁用态不响应输入；即使开启 clearable，清空按钮也不会出现。
    </p>
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
