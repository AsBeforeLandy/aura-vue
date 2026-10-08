<script setup lang="ts">
import { ref } from 'vue';
import { Tooltip } from '@aura-vue/components';

const tip = ref('内容也可以由插槽自定义，支持换行与强调');
</script>

<template>
  <div class="row">
    <Tooltip placement="bottom">
      <button class="demo-btn">插槽内容</button>
      <template #content> <b>插槽内容：</b>{{ tip }} </template>
    </Tooltip>
    <Tooltip content="禁用后不再弹出" disabled>
      <button class="demo-btn">已禁用</button>
    </Tooltip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 16px;
}

.demo-btn {
  padding: 5px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
