<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button } from '@aura/components';

const open = ref(false);
</script>

<template>
  <div>
    <Button type="primary" @click="open = true">打开弹窗</Button>
    <Modal v-model="open" title="提示">
      <p>这是一个基础弹窗</p>
    </Modal>
  </div>
</template>
