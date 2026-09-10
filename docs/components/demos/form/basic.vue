<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Form, FormItem, Input, Button } from '@aura/components';

const model = reactive({ name: '', email: '' });
const formRef = ref();
const result = ref('');

async function submit() {
  const res = await formRef.value.validate();
  result.value = res.valid
    ? `提交成功：${JSON.stringify(model)}`
    : `校验失败：${Object.values(res.errors).join('；')}`;
}
</script>

<template>
  <div>
    <Form ref="formRef" :model="model">
      <FormItem label="姓名" prop="name" required :rules="[{ required: true, message: '请输入姓名' }]">
        <Input v-model="model.name" placeholder="请输入姓名" />
      </FormItem>
      <FormItem
        label="邮箱"
        prop="email"
        required
        :rules="[
          { required: true, message: '请输入邮箱' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' }
        ]"
      >
        <Input v-model="model.email" placeholder="请输入邮箱" />
      </FormItem>
      <Button type="primary" @click="submit">提交</Button>
    </Form>
    <p class="aura-tip">{{ result }}</p>
  </div>
</template>

<style scoped>
.aura-tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
