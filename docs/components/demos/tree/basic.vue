<script setup lang="ts">
import { ref } from 'vue';
import { Tree } from '@aura/components';

const selected = ref('ui');

const data = [
  {
    label: '前端',
    value: 'fe',
    children: [
      { label: '组件库', value: 'ui' },
      {
        label: '工具链',
        value: 'tooling',
        children: [{ label: 'Vite', value: 'vite' }],
      },
    ],
  },
  {
    label: '后端',
    value: 'be',
    children: [{ label: '数据库', value: 'db' }],
  },
];
</script>

<template>
  <div class="row">
    <Tree v-model="selected" :data="data" :default-expanded-keys="['fe']" />
    <Tree :data="data" expand-all />
  </div>

  <p class="tip">左：默认展开 fe，当前选中 {{ selected }}；右：全部展开</p>
</template>

<style scoped>
.row {
  display: flex;
  gap: 40px;
}

.tip {
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
