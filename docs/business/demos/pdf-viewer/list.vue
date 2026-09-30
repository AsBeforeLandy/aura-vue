<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import { PdfViewer } from '@aura/business';

interface FileItem {
  name: string;
  url: string;
}

const FILES: FileItem[] = [
  {
    name: 'Aura 产品介绍.pdf',
    url: `${import.meta.env.BASE_URL}pdf-viewer-sample.pdf`,
  },
  // 演示加载失败态：出现错误提示与重试按钮
  { name: '不存在文档.pdf', url: '/not-exist.pdf' },
];

const current = ref<FileItem | null>(null);

function onOpenChange(next: boolean) {
  if (!next) current.value = null;
  else ElMessage.info('已打开预览');
}
</script>

<template>
  <div class="pdf-list">
    <p class="pdf-list-tip">
      多文档共用一个预览实例：url 切换时自动重新加载；第二个文件演示失败态。
    </p>
    <div v-for="file in FILES" :key="file.url" class="pdf-list-row">
      <span>{{ file.name }}</span>
      <ElButton size="small" @click="current = file">查看</ElButton>
    </div>

    <PdfViewer
      :url="current?.url"
      :open="!!current"
      :title="current?.name ?? '文档预览'"
      @update:open="onOpenChange"
    />
  </div>
</template>

<style scoped>
.pdf-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
}
.pdf-list-tip {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2, #666);
}
.pdf-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
