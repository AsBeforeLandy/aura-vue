<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '@aura/components';

const fileList = ref([]);

/**
 * 演示用 customRequest：不真的发请求，用定时器模拟进度。
 * 真实场景给 action 地址即可（内部走 XHR），或自己实现 customRequest。
 */
function simulate({
  file,
  onProgress,
  onSuccess,
}: {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: () => void;
}) {
  let percent = 0;
  const timer = setInterval(() => {
    percent = Math.min(100, percent + 20);
    onProgress(percent);
    if (percent >= 100) {
      clearInterval(timer);
      onSuccess({ name: file.name });
    }
  }, 300);
}

function rejectOver1m(file: File) {
  if (file.size > 1024 * 1024) return false;
  return true;
}
</script>

<template>
  <div class="stack">
    <p>基础（按钮触发，模拟上传）：</p>
    <Upload
      v-model:file-list="fileList"
      multiple
      accept=".txt,.md,image/*"
      :custom-request="simulate"
    />

    <p>拖拽模式（超过 1MB 的文件会被 beforeUpload 拒绝）：</p>
    <Upload drag :custom-request="simulate" :before-upload="rejectOver1m">
      <template #drag-content>
        <span class="drag-text">拖拽文件到这里，或点击选择</span>
      </template>
    </Upload>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

p {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}

.drag-text {
  color: var(--vp-c-text-2, #666);
  font-size: 14px;
}
</style>
