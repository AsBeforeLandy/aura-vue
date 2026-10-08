<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import { PdfViewer } from '@aura-vue/business';

const open = ref(false);
const status = ref('未打开');
// docs 站部署在 /aura-vue/ 子路径，public 资源用 BASE_URL 拼接
const url = `${import.meta.env.BASE_URL}pdf-viewer-sample.pdf`;

function onOpenChange(next: boolean) {
  open.value = next;
  status.value = next ? '打开' : '关闭';
}

function onPageChange(page: number) {
  status.value = `翻到第 ${page} 页`;
  ElMessage.info(`翻到第 ${page} 页`);
}
</script>

<template>
  <div class="pdf-basic">
    <ElButton type="primary" @click="open = true">预览文档</ElButton>
    <span class="pdf-basic-status">最近动作：{{ status }}</span>

    <PdfViewer
      :url="url"
      :open="open"
      @update:open="onOpenChange"
      @page-change="onPageChange"
    />
  </div>
</template>

<style scoped>
.pdf-basic {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pdf-basic-status {
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}
</style>
