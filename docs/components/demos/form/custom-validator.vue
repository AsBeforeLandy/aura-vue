<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Form, FormItem, Input, Button } from '@aura/components';

const model = reactive({ username: '', age: '' });
const formRef = ref();

async function submit() {
  const res = await formRef.value.validate();
  console.log(res);
}

/** 自定义异步校验器：模拟远程重名校验 */
async function checkNameTaken(value: unknown): Promise<boolean | string> {
  await new Promise((r) => setTimeout(r, 300));
  return value === 'admin' ? '该用户名已被占用' : true;
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' as const },
    { min: 3, max: 12, message: '用户名长度为 3-12 个字符', trigger: 'blur' as const },
    { validator: checkNameTaken }
  ],
  age: [{ pattern: /^\d+$/, message: '年龄必须为数字', trigger: 'blur' as const }]
};
</script>

<template>
  <div class="aura-form-demo">
    <Form ref="formRef" :model="model">
      <FormItem label="用户名" prop="username" required :rules="rules.username">
        <Input v-model="model.username" placeholder="3-12 位，试试输入 admin" />
      </FormItem>
      <FormItem label="年龄" prop="age" :rules="rules.age">
        <Input v-model="model.age" placeholder="请输入数字" />
      </FormItem>
      <div class="aura-form-actions">
        <Button type="primary" @click="submit">提交校验</Button>
        <Button @click="formRef?.resetValidation()">清空错误</Button>
      </div>
    </Form>
  </div>
</template>

<style scoped>
.aura-form-demo {
  max-width: 400px;
}
.aura-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}
</style>
