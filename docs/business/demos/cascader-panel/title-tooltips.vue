<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CascaderPanel } from '@aura/business';
import type { CascaderOption } from '@aura/business';

const selected = ref<string[]>([]);

const options: CascaderOption[] = [
  {
    label: '研发部',
    value: 'rd',
    tooltips: '含前端、后端、测试三个小组',
    children: [
      { label: '前端组', value: 'fe' },
      { label: '后端组', value: 'be' },
      { label: '测试组', value: 'qa' },
    ],
  },
  {
    label: '产品部',
    value: 'pm',
    tooltips: '含产品与设计',
    children: [
      { label: '产品组', value: 'pd' },
      { label: '设计组', value: 'ui' },
    ],
  },
];

function onCurrentClick(option: CascaderOption) {
  ElMessage.info(`展开：${option.label}`);
}
</script>

<template>
  <CascaderPanel
    v-model="selected"
    :options="options"
    title="全部部门"
    @current-click="onCurrentClick"
  />
</template>
