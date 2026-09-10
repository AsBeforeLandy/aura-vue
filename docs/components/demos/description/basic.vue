<script setup lang="ts">
import { ref } from 'vue';
import { Description } from '@aura/business';
import type { DescriptionGroup } from '@aura/business';

const bordered = ref(true);

/** 数据由后端一次返回，详情页只做展示 */
const data = ref({
  orderNo: 'SO-20260910-0042',
  status: 'paid',
  amount: 12860.5,
  createdAt: '2026-09-10 09:58:02',
  customer: { name: '李振虎', phone: '138****8888' },
  remark: ''
});

const groups: DescriptionGroup[] = [
  {
    title: '订单信息',
    items: [
      { key: 'orderNo', label: '订单号' },
      {
        key: 'status',
        label: '状态',
        valueType: 'tag',
        valueEnum: {
          paid: { text: '已支付', color: 'success' },
          unpaid: { text: '待支付', color: 'warning' }
        }
      },
      { key: 'amount', label: '金额', valueType: 'money' },
      { key: 'createdAt', label: '创建时间', valueType: 'datetime' }
    ]
  },
  {
    title: '客户信息',
    items: [
      // key 支持 'a.b' 形式读取嵌套字段
      { key: 'customer.name', label: '客户姓名' },
      { key: 'customer.phone', label: '联系电话' },
      { key: 'remark', label: '备注', span: 2, emptyText: '无' }
    ]
  }
];
</script>

<template>
  <div>
    <label class="desc-demo__switch">
      <input v-model="bordered" type="checkbox" /> 显示边框
    </label>
    <Description
      :groups="groups"
      :data="data"
      :columns="2"
      :bordered="bordered"
      title="订单详情"
    />
  </div>
</template>

<style scoped>
.desc-demo__switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  cursor: pointer;
}
</style>
