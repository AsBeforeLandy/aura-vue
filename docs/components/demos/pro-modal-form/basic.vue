<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { ProModalForm } from '@aura/business';
import type { ProFormItem } from '@aura/business';

const items: ProFormItem[] = [
  { name: 'projectName', label: '项目名称', valueType: 'text', span: 12, rules: [{ required: true, message: '请输入项目名称' }] },
  { name: 'owner', label: '负责人', valueType: 'text', span: 12, rules: [{ required: true, message: '请输入负责人' }] },
  { name: 'status', label: '状态', valueType: 'select', span: 12, options: [
    { label: '进行中', value: 'doing' },
    { label: '已完成', value: 'done' }
  ], rules: [{ required: true, message: '请选择状态' }] },
  { name: 'desc', label: '说明', valueType: 'textarea', fullWidth: true }
];

const visible = ref(false);
const mode = ref<'create' | 'edit' | 'view'>('create');
const initialValues = ref<Record<string, unknown>>({});

function openCreate() {
  mode.value = 'create';
  initialValues.value = {};
  visible.value = true;
}

function openEdit() {
  mode.value = 'edit';
  initialValues.value = { projectName: 'Aura 组件库', owner: '李振虎', status: 'doing', desc: '组件库二期' };
  visible.value = true;
}

function openView() {
  mode.value = 'view';
  initialValues.value = { projectName: 'Aura 组件库', owner: '李振虎', status: 'doing', desc: '组件库二期' };
  visible.value = true;
}

/** 模拟服务端提交：抛错时弹窗保持打开，成功则自动关闭 */
async function submit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 400));
  if (String(values.projectName).includes('fail')) {
    throw new Error('项目名称已存在');
  }
  ElMessage.success(`提交成功：${JSON.stringify(values)}`);
}
</script>

<template>
  <div class="pro-modal-demo">
    <el-button @click="openCreate">新增</el-button>
    <el-button @click="openEdit">编辑</el-button>
    <el-button @click="openView">查看</el-button>

    <ProModalForm
      v-model="visible"
      :items="items"
      :mode="mode"
      :initial-values="initialValues"
      :submit="submit"
      @success="() => console.log('success')"
      @error="(e) => ElMessage.error(String(e))"
    />
  </div>
</template>

<style scoped>
.pro-modal-demo {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
