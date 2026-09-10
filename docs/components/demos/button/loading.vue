<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@aura/components';

const loading = ref(false);

function simulate() {
  loading.value = true;
  setTimeout(() => (loading.value = false), 1600);
}
</script>

<template>
  <div class="aura-row">
    <Button type="primary" loading>加载中</Button>
    <Button type="primary" :loading="loading" @click="simulate">
      {{ loading ? '提交中…' : '点击模拟提交' }}
    </Button>
  </div>
</template>

<style scoped>
.aura-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
