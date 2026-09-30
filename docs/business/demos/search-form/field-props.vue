<script setup lang="ts">
import { h } from 'vue';
import { ElMessage } from 'element-plus';
import { SearchForm } from '@aura/business';
import type { SearchField } from '@aura/business';

const fields: SearchField[] = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'input',
    fieldProps: { maxlength: 10, 'show-word-limit': true },
  },
  {
    name: 'level',
    label: '优先级',
    type: 'select',
    options: [
      { label: 'P0', value: 'p0' },
      { label: 'P1', value: 'p1' },
    ],
    fieldProps: { multiple: true },
  },
  {
    name: 'custom',
    label: '自定义',
    type: 'custom',
    // render 逃生舱：返回任意 VNodeChild
    render: () =>
      h(
        'span',
        { style: 'color: var(--aura-text-secondary); font-size: 13px' },
        '该字段由外部组件托管',
      ),
  },
];

function onSearch(values: Record<string, unknown>) {
  ElMessage.info(`查询条件：${JSON.stringify(values)}`);
}
</script>

<template>
  <SearchForm :fields="fields" :collapse-after="2" @search="onSearch" />
</template>
