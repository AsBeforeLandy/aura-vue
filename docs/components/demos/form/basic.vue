<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Form, FormItem, Input, Button } from '@aura/components';

const model = reactive({ name: '', email: '' });
const formRef = ref();
const result = ref('');
const errors = ref<Record<string, string>>({});

async function submit() {
  const res = await formRef.value.validate();
  errors.value = res.errors;
  result.value = res.valid
    ? `提交成功：${JSON.stringify(model)}`
    : `校验失败：${Object.values(res.errors).join('；')}`;
}
</script>

<template>
  <div class="aura-form-demo">
    <Form ref="formRef" :model="model">
      <FormItem
        label="姓名"
        prop="name"
        required
        :rules="[{ required: true, message: '请输入姓名' }]"
      >
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
    <pre v-if="Object.keys(errors).length" class="aura-errors">{{ JSON.stringify(errors, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.aura-form-demo {
  max-width: 400px;
}
.aura-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
.aura-errors {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft, #f6f6f7);
  font-size: 12px;
  line-height: 1.6;
}
</style>
