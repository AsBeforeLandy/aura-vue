<script setup lang="ts">
import { ref } from 'vue';
import { Skeleton } from '@aura-vue/components';

const loading = ref(true);

setTimeout(() => {
  loading.value = false;
}, 2000);
</script>

<template>
  <div class="stack">
    <div class="row">
      <Skeleton avatar :rows="2" style="flex: 1" />
      <Skeleton :rows="3" style="flex: 1" />
    </div>

    <p>2 秒后自动加载完成：</p>
    <div class="card">
      <Skeleton avatar :rows="2" :loading="loading">
        <div class="content">
          <b>卡片标题</b>
          <span class="tip">这里是加载完成后的真实内容。</span>
        </div>
      </Skeleton>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 24px;
}

.card {
  padding: 12px;
  border: 1px solid var(--vp-c-divider, #e5e5e5);
  border-radius: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip {
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
