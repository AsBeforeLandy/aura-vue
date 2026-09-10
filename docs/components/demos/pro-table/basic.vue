<script setup lang="ts">
import { ref } from 'vue';
import { ProTable } from '@aura/business';
import type { ProTableColumn, ProTableRequest } from '@aura/business';

interface UserRow {
  id: number;
  name: string;
  status: 'active' | 'pending' | 'disabled';
  amount: number;
  createdAt: string;
}

/** 模拟后端：用内存数据扮演一个带分页/查询/排序的接口 */
const ALL: UserRow[] = Array.from({ length: 46 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${String(i + 1).padStart(2, '0')}`,
  status: (['active', 'pending', 'disabled'] as const)[i % 3],
  amount: 1200 + i * 137,
  createdAt: `2026-0${(i % 9) + 1}-1${i % 9}`
}));

const request: ProTableRequest<UserRow> = async ({ current, pageSize, search, sort }) => {
  let rows = [...ALL];
  if (search.name) rows = rows.filter((r) => r.name.includes(String(search.name)));
  if (search.status) rows = rows.filter((r) => r.status === search.status);
  if (sort) {
    const dir = sort.order === 'asc' ? 1 : -1;
    rows.sort((a, b) =>
      dir * String(a[sort.field as keyof UserRow]).localeCompare(String(b[sort.field as keyof UserRow]))
    );
  }
  const start = (current - 1) * pageSize;
  // 模拟网络延迟，便于观察 loading
  await new Promise((r) => setTimeout(r, 260));
  return { data: rows.slice(start, start + pageSize), total: rows.length };
};

const columns: ProTableColumn<UserRow>[] = [
  { key: 'name', title: '用户名', minWidth: 140, searchType: 'text' },
  {
    key: 'status',
    title: '状态',
    width: 110,
    valueType: 'tag',
    searchType: 'select',
    valueEnum: {
      active: { text: '启用', color: 'success' },
      pending: { text: '待审核', color: 'warning' },
      disabled: { text: '停用', color: 'info' }
    }
  },
  { key: 'amount', title: '金额', width: 140, align: 'right', valueType: 'money', sortable: true },
  { key: 'createdAt', title: '创建日期', width: 140, valueType: 'date', hideInSearch: true }
];

const tableRef = ref();
const selectedCount = ref(0);
</script>

<template>
  <div class="pro-table-demo">
    <ProTable
      ref="tableRef"
      title="用户列表"
      :columns="columns"
      :request="request"
      row-key="id"
      row-selection
      stripe
      border
      :pagination="{ current: 1, pageSize: 8, pageSizes: [8, 16, 32] }"
      @selection-change="(rows) => (selectedCount = rows.length)"
    />
    <p class="pro-table-demo__tip">
      已选 {{ selectedCount }} 项 · 点击右上角「列设置」可切换列显隐，点击「刷新」重新拉取
    </p>
  </div>
</template>

<style scoped>
.pro-table-demo__tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
