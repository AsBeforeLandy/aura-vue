<script setup lang="ts">
import { Breadcrumb } from '@aura/components';
</script>

<template>
  <div class="stack">
    <Breadcrumb
      :items="[
        { label: '首页', to: '/' },
        { label: '订单管理', to: '/orders' },
        { label: '订单详情' },
      ]"
    />

    <Breadcrumb :items="[{ label: '首页' }]" />
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
