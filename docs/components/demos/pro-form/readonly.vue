<script setup lang="ts">
import { ref } from 'vue';
import { ProForm } from '@aura/business';
import type { ProFormItem } from '@aura/business';

const readonly = ref(true);

const items: ProFormItem[] = [
  { name: 'name', label: '姓名', valueType: 'text', span: 12 },
  { name: 'gender', label: '性别', valueType: 'select', span: 12, options: [{ label: '女', value: 'f' }] },
  { name: 'skills', label: '技能', valueType: 'checkbox', fullWidth: true, options: [
    { label: 'Vue', value: 'vue' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Node', value: 'node' }
  ] }
];

/** 只读模式下：枚举显示文案、数组用顿号连接、空值显示 '-'，且不渲染任何可交互控件 */
const model = ref<Record<string, unknown>>({
  name: '李振虎',
  gender: 'f',
  skills: ['vue', 'ts']
});
</script>

<template>
  <div>
    <label class="pro-form-readonly-demo__switch">
      <input v-model="readonly" type="checkbox" /> 只读模式
    </label>
    <ProForm :items="items" v-model="model" :columns="2" :readonly="readonly" />
  </div>
</template>

<style scoped>
.pro-form-readonly-demo__switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  cursor: pointer;
}
</style>
