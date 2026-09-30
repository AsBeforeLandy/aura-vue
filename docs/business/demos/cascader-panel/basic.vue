<script setup lang="ts">
import { ref } from 'vue';
import { CascaderPanel } from '@aura/business';
import type { CascaderOption } from '@aura/business';

const selected = ref<string[]>([]);

const options: CascaderOption[] = [
  {
    label: '华东',
    value: 'east',
    children: [
      {
        label: '浙江',
        value: 'zj',
        children: [
          { label: '杭州', value: 'hz' },
          { label: '宁波', value: 'nb' },
        ],
      },
      { label: '江苏', value: 'js' },
    ],
  },
  {
    label: '华南',
    value: 'south',
    children: [{ label: '广东', value: 'gd' }],
  },
  { label: '西南', value: 'southwest' },
];
</script>

<template>
  <div>
    <CascaderPanel v-model="selected" :options="options" title="全部大区" />
    <p class="aura-tip">当前选中：{{ selected.join(', ') || '（无）' }}</p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
