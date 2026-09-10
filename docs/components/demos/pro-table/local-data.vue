<script setup lang="ts">
import { ref } from 'vue';
import { ProTable } from '@aura/business';
import type { ProTableColumn } from '@aura/business';

interface OrderRow {
  id: string;
  product: string;
  qty: number;
}

/** 不传 request，直接给 data：适合本地数据或外层已请求好的场景 */
const data = ref<OrderRow[]>([
  { id: 'A-1001', product: '无线键盘', qty: 2 },
  { id: 'A-1002', product: '人体工学椅', qty: 1 },
  { id: 'A-1003', product: '27 寸显示器', qty: 4 }
]);

const columns: ProTableColumn<OrderRow>[] = [
  { key: 'id', title: '订单号', width: 140 },
  { key: 'product', title: '商品', minWidth: 180 },
  { key: 'qty', title: '数量', width: 100, align: 'right' }
];
</script>

<template>
  <div>
    <ProTable :columns="columns" :data="data" :search="false" :pagination="false" />
  </div>
</template>
