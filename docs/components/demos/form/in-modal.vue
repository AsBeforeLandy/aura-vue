<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Form, FormItem, Input, Button, Modal } from '@aura/components';

const model = reactive({ project: '', owner: '' });
const formRef = ref();
const open = ref(false);
const errorMsg = ref('');

/** 打开时清空上一次的错误态，避免残留 */
function show() {
  formRef.value?.resetValidation();
  errorMsg.value = '';
  open.value = true;
}

async function confirm() {
  const res = await formRef.value.validate();
  if (!res.valid) {
    errorMsg.value = Object.values(res.errors).join('；');
    return;
  }
  errorMsg.value = '';
  open.value = false;
}
</script>

<template>
  <div>
    <Button type="primary" @click="show">新建项目</Button>

    <Modal v-model="open" title="新建项目" :width="560">
      <Form ref="formRef" :model="model" class="aura-dialog-form">
        <FormItem
          label="项目名称"
          prop="project"
          required
          :rules="[{ required: true, message: '请输入项目名称' }]"
        >
          <Input v-model="model.project" placeholder="请输入项目名称" />
        </FormItem>
        <FormItem
          label="负责人"
          prop="owner"
          required
          :rules="[{ required: true, message: '请输入负责人' }]"
        >
          <Input v-model="model.owner" placeholder="请输入负责人" />
        </FormItem>
      </Form>
      <p v-if="errorMsg" class="aura-error-tip">{{ errorMsg }}</p>

      <template #footer>
        <Button @click="open = false">取消</Button>
        <Button type="primary" @click="confirm">确定</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.aura-dialog-form {
  display: block;
}
.aura-error-tip {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--aura-color-danger, #ef4444);
}
</style>
