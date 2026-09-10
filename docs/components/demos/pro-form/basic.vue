<script setup lang="ts">
import { ref } from 'vue';
import { ProForm } from '@aura/business';
import type { ProFormInstance, ProFormItem } from '@aura/business';

const formRef = ref<ProFormInstance>();
const result = ref('');

const items: ProFormItem[] = [
  {
    name: 'projectName',
    label: '项目名称',
    valueType: 'text',
    span: 12,
    rules: [{ required: true, message: '请输入项目名称' }]
  },
  {
    name: 'owner',
    label: '负责人',
    valueType: 'text',
    span: 12,
    rules: [{ required: true, message: '请输入负责人' }]
  },
  {
    name: 'priority',
    label: '优先级',
    valueType: 'radio',
    span: 12,
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'mid' },
      { label: '低', value: 'low' }
    ],
    rules: [{ required: true, message: '请选择优先级' }]
  },
  {
    name: 'online',
    label: '是否上线',
    valueType: 'switch',
    span: 12
  },
  {
    name: 'range',
    label: '周期',
    valueType: 'dateRange',
    span: 12
  },
  {
    name: 'desc',
    label: '项目说明',
    valueType: 'textarea',
    fullWidth: true,
    tip: '不超过 200 字',
    rules: [{ required: true, message: '请填写项目说明' }]
  }
];

async function submit() {
  const values = await formRef.value?.validate();
  result.value = values ? `校验通过，提交数据：${JSON.stringify(values)}` : '校验未通过，请检查标红项';
}
</script>

<template>
  <div class="pro-form-demo">
    <ProForm
      ref="formRef"
      :items="items"
      :columns="2"
      label-width="90px"
      submit-text="提交"
      @submit="(v) => (result = `收到 submit 事件：${JSON.stringify(v)}`)"
      @validate-error="() => (result = '有字段未通过校验')"
    />
    <p class="pro-form-demo__tip">{{ result }}</p>
    <button class="pro-form-demo__btn" @click="submit">外部触发校验</button>
  </div>
</template>

<style scoped>
.pro-form-demo__tip {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
  word-break: break-all;
}
.pro-form-demo__btn {
  margin-top: 10px;
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
}
</style>
