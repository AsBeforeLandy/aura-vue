<script setup lang="ts">
import { ref } from 'vue';
import { Steps } from '@aura-vue/components';

const current = ref(1);
const failed = ref(false);

function next() {
  if (current.value >= 2) return;
  current.value += 1;
  failed.value = current.value === 2 && Math.random() < 0.4;
}
</script>

<template>
  <div class="stack">
    <Steps
      :items="[
        { title: '填写信息', description: '收货地址与联系方式' },
        {
          title: '确认订单',
          description: failed ? '库存校验失败' : '核对商品与价格',
        },
        { title: '完成支付' },
      ]"
      :current="current"
      :status="failed ? 'error' : 'process'"
    />

    <div class="row">
      <button class="demo-btn" @click="current = Math.max(0, current - 1)">
        上一步
      </button>
      <button class="demo-btn" @click="next">下一步</button>
      <button class="demo-btn" @click="((current = 0), (failed = false))">
        重置
      </button>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.row {
  display: flex;
  gap: 12px;
}

.demo-btn {
  padding: 4px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
