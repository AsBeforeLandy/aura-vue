<template>
  <div
    :class="cls"
    @dragover.prevent="dragActive = true"
    @dragleave.prevent="dragActive = false"
    @drop.prevent="onDrop"
  >
    <!--
      文件输入裁剪式隐藏 + aria-hidden：SR 用户走「选择文件」按钮这条通路
      （原生 file input 的播报体验很差且无法自定义文案），
      input 只作为浏览器的文件选择机制存在。
    -->
    <input
      ref="inputRef"
      type="file"
      :class="prefixCls('upload-input')"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @change="onChange"
    />

    <!-- 拖拽模式：整块虚线区域既是拖放目标也是点击触发 -->
    <div
      v-if="drag"
      :class="dropCls"
      :aria-disabled="disabled || undefined"
      @click="openPicker"
    >
      <slot name="drag-content">
        <span :class="prefixCls('upload-drag-text')">
          拖拽文件到这里，或 <em>点击选择</em>
        </span>
      </slot>
    </div>
    <slot v-else name="trigger">
      <AButton :disabled="disabled" @click="openPicker">选择文件</AButton>
    </slot>

    <ul v-if="list.length" :class="prefixCls('upload-list')">
      <li v-for="item in list" :key="item.uid" :class="rowCls(item)">
        <span :class="prefixCls('upload-name')">
          {{ item.name }}
          <span v-if="item.size" :class="prefixCls('upload-size')">
            {{ formatSize(item.size) }}
          </span>
        </span>
        <span :class="prefixCls('upload-status')">
          <template v-if="item.status === 'uploading'">
            {{ item.percent ?? 0 }}%
          </template>
          <template v-else-if="item.status === 'success'">✓</template>
          <template v-else-if="item.status === 'danger'">上传失败</template>
        </span>
        <button
          type="button"
          :class="prefixCls('upload-remove')"
          aria-label="删除"
          @click="remove(item)"
        >
          ×
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { Button as AButton } from '../button';
import { uploadProps, type UploadEmits, type UploadItem } from './types';
import { formatSize, nextUid, xhrRequest } from './utils';
import './style/index.less';

defineOptions({ name: 'AUpload' });

const props = defineProps(uploadProps);
const emit = defineEmits<UploadEmits>();

const inputRef = ref<HTMLInputElement>();
const dragActive = ref(false);

/**
 * fileList 双轨受控：属性名是 fileList 而非 modelValue，
 * 与 useControllable 的结构不同构，故内联实现（同 Tag 的 visible 模式）。
 * 上传过程会高频更新列表（进度回调），统一走 commit 替换数组。
 */
const innerList = ref<UploadItem[]>(props.defaultFileList ?? []);
const isControlled = computed(() => props.fileList !== undefined);
const list = computed<UploadItem[]>(() =>
  isControlled.value ? (props.fileList ?? []) : innerList.value,
);

function commit(next: UploadItem[]) {
  if (!isControlled.value) innerList.value = next;
  emit('update:fileList', next);
  emit('change', next);
}

function patchItem(uid: string, patch: Partial<UploadItem>) {
  commit(
    list.value.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
  );
}

function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}

/** 从原生 File 列表构建条目并按需上传；beforeUpload 支持同步 / 异步拒绝 */
async function acceptFiles(files: FileList | File[]) {
  const incoming = Array.from(files);
  const accepted: UploadItem[] = [];

  for (const file of incoming) {
    const verdict = props.beforeUpload ? await props.beforeUpload(file) : true;
    if (verdict === false) continue;
    accepted.push({
      uid: nextUid(),
      name: file.name,
      size: file.size,
      status: 'ready',
      percent: 0,
      raw: file,
    });
  }

  if (accepted.length === 0) return;
  commit([...list.value, ...accepted]);

  if (props.autoUpload) accepted.forEach((item) => start(item));
}

function start(item: UploadItem) {
  const request =
    props.customRequest ??
    (props.action ? xhrRequest(props.action) : undefined);
  // 没有 action 也没有 customRequest：停留在 ready，
  // 这是「先选文件、之后手动提交」的合法用法，不视为错误
  if (!request) return;

  patchItem(item.uid, { status: 'uploading', percent: 0 });
  request({
    file: item.raw!,
    onProgress: (percent) => patchItem(item.uid, { percent }),
    onSuccess: (response) => {
      patchItem(item.uid, { status: 'success', percent: 100, response });
      emit(
        'success',
        { ...item, status: 'success', percent: 100, response },
        response,
      );
    },
    onError: (error) => {
      patchItem(item.uid, { status: 'danger' });
      emit('error', { ...item, status: 'danger' }, error);
    },
  });
}

function onChange(evt: Event) {
  const input = evt.target as HTMLInputElement;
  if (input.files?.length) void acceptFiles(input.files);
  // 允许再次选择同一文件（input 的 change 只在 value 变化时触发）
  input.value = '';
}

function onDrop(evt: DragEvent) {
  dragActive.value = false;
  if (props.disabled) return;
  if (evt.dataTransfer?.files.length) void acceptFiles(evt.dataTransfer.files);
}

function remove(item: UploadItem) {
  commit(list.value.filter((entry) => entry.uid !== item.uid));
  emit('remove', item);
}

const cls = computed(() =>
  classNames(
    prefixCls('upload'),
    props.drag && prefixCls('upload--drag'),
    props.disabled && prefixCls('upload--disabled'),
  ),
);

const dropCls = computed(() =>
  classNames(
    prefixCls('upload-dropzone'),
    dragActive.value && prefixCls('upload-dropzone--active'),
  ),
);

const rowCls = (item: UploadItem) =>
  classNames(
    prefixCls('upload-row'),
    item.status !== 'ready' && prefixCls(`upload-row--${item.status}`),
  );
</script>
