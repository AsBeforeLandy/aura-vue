<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from '@aura-vue/components';

const active = ref('base');
</script>

<template>
  <div class="stack">
    <Tabs
      v-model="active"
      :items="[
        { label: '基本信息', value: 'base' },
        { label: '安全设置', value: 'security' },
        { label: '高级（禁用）', value: 'advanced', disabled: true },
      ]"
    >
      <template #panel-base>
        <p class="tip">基本信息面板：用户名、邮箱等。</p>
      </template>
      <template #panel-security>
        <p class="tip">安全设置面板：密码、两步验证等。</p>
      </template>
    </Tabs>

    <p class="tip">当前值：{{ active }}（面板按 value 懒渲染，切换即重建）</p>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
