<script setup lang="ts">
import { ref } from 'vue';
import { PageContainer, ProTable } from '@aura/business';
import type { ProTableColumn } from '@aura/business';

const loading = ref(false);

const columns: ProTableColumn[] = [
  { key: 'name', title: '名称', minWidth: 160 },
  { key: 'owner', title: '负责人', width: 120 }
];

const data = ref([
  { id: 1, name: 'Aura 组件库', owner: '李振虎' },
  { id: 2, name: 'AIChat Pro', owner: '李振虎' }
]);

const breadcrumbs = [
  { text: '首页', link: '/' },
  { text: '项目管理' },
  { text: '项目列表' }
];

async function refresh() {
  loading.value = true;
  await new Promise((r) => setTimeout(r, 600));
  loading.value = false;
}
</script>

<template>
  <PageContainer
    title="项目列表"
    sub-title="共 2 个项目"
    :breadcrumbs="breadcrumbs"
    :loading="loading"
    back
    @back="() => console.log('返回上一页')"
  >
    <template #extra>
      <el-button size="small" @click="refresh">刷新</el-button>
    </template>

    <ProTable :columns="columns" :data="data" :search="false" :pagination="false" />
  </PageContainer>
</template>
