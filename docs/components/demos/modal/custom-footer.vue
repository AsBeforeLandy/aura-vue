<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button } from '@aura/components';

const open = ref(false);
</script>

<template>
  <div>
    <Button @click="open = true">打开自定义底部弹窗</Button>
    <Modal v-model="open" title="删除确认">
      <p>确认删除这条数据吗？</p>
      <template #footer>
        <Button @click="open = false">再想想</Button>
        <Button type="primary" @click="open = false">确认删除</Button>
      </template>
    </Modal>
  </div>
</template>
