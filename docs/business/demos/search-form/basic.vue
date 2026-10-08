<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { SearchForm } from '@aura-vue/business';
import type { SearchField } from '@aura-vue/business';

const loading = ref(false);

const fields: SearchField[] = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '用户名 / 手机号',
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'disabled' },
    ],
  },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
    ],
  },
  { name: 'createdAt', label: '创建时间', type: 'dateRange' },
  { name: 'age', label: '年龄', type: 'number', placeholder: '请输入' },
];

async function onSearch(values: Record<string, unknown>) {
  loading.value = true;
  // 模拟请求耗时后收起 loading
  await new Promise((resolve) => setTimeout(resolve, 600));
  loading.value = false;
  ElMessage.info(`查询条件：${JSON.stringify(values)}`);
}

function onReset() {
  ElMessage.info('已重置');
}
</script>

<template>
  <SearchForm
    :fields="fields"
    :loading="loading"
    @search="onSearch"
    @reset="onReset"
  />
</template>
