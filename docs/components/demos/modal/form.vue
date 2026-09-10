<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button, Input, Switch } from '@aura/components';

const open = ref(false);
const form = ref({ name: '', notify: true });
</script>

<template>
  <div>
    <Button type="primary" @click="open = true">新建项目</Button>
    <Modal v-model="open" title="新建项目" :width="600">
      <div class="aura-modal-form">
        <label class="aura-field">
          <span>项目名称</span>
          <Input v-model="form.name" placeholder="请输入项目名称" />
        </label>
        <label class="aura-field aura-field-inline">
          <span>开启通知</span>
          <Switch v-model="form.notify" />
        </label>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.aura-modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.aura-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
.aura-field-inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
