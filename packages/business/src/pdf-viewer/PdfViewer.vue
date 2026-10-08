<template>
  <div :class="prefixCls('pdf-viewer')">
    <ElDialog
      :model-value="visible"
      :title="props.title"
      align-center
      :width="props.width"
      @update:model-value="(next: boolean) => setOpen(next)"
    >
      <template #footer>
        <div :class="prefixCls('pdf-viewer-toolbar')">
          <div :class="prefixCls('pdf-viewer-toolbar-group')">
            <ElButton
              size="small"
              :disabled="!pdfDoc || scale <= scaleRange[0]"
              @click="zoom(-1)"
            >
              缩小
            </ElButton>
            <span :class="prefixCls('pdf-viewer-scale')">
              {{ Math.round(scale * 100) }}%
            </span>
            <ElButton
              size="small"
              :disabled="!pdfDoc || scale >= scaleRange[1]"
              @click="zoom(1)"
            >
              放大
            </ElButton>
            <ElButton size="small" :disabled="!pdfDoc" @click="rotate">
              旋转
            </ElButton>
          </div>
          <span :class="prefixCls('pdf-viewer-page')" role="status">
            {{ numPages > 0 ? `${pageNumber} / ${numPages}` : '—' }}
          </span>
          <div :class="prefixCls('pdf-viewer-toolbar-group')">
            <ElButton
              size="small"
              :disabled="!pdfDoc || pageNumber <= 1"
              @click="goToPage(pageNumber - 1)"
            >
              上一页
            </ElButton>
            <ElButton
              size="small"
              :disabled="!pdfDoc || pageNumber >= numPages"
              @click="goToPage(pageNumber + 1)"
            >
              下一页
            </ElButton>
            <ElButton size="small" type="primary" @click="setOpen(false)">
              关闭
            </ElButton>
          </div>
        </div>
      </template>

      <div v-if="error" :class="prefixCls('pdf-viewer-error')" role="alert">
        <p :class="prefixCls('pdf-viewer-error-title')">文档加载失败</p>
        <p :class="prefixCls('pdf-viewer-error-detail')">{{ error }}</p>
        <ElButton size="small" @click="reloadToken += 1">重试</ElButton>
      </div>
      <div
        v-else
        ref="stageRef"
        v-loading="loading"
        element-loading-background="transparent"
        :class="stageCls"
        @pointerdown="handlePanStart"
        @pointermove="handlePanMove"
        @pointerup="handlePanEnd"
        @pointercancel="handlePanEnd"
      >
        <div
          :class="prefixCls('pdf-viewer-canvas-wrap')"
          :style="canvasWrapStyle"
        >
          <canvas ref="canvasRef" role="img" aria-label="PDF 文档预览" />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
} from 'vue';
import { ElButton, ElDialog, vLoading } from 'element-plus';
import * as pdfjsLib from 'pdfjs-dist';
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from 'pdfjs-dist';
import { classNames, prefixCls } from '@aura-vue/shared';
import {
  clamp,
  clampPage,
  isRenderCancelled,
  normalizeRotation,
  stepScale,
} from './utils';
import {
  defaultAssetBaseUrl,
  deriveWorkerUrl,
  ensureMainThreadWorker,
  ensurePromiseTry,
  hasExplicitWorkerSrc,
  nativeImport,
  resolvePdfjs,
} from './pdfjs-runtime';
import { pdfViewerProps, type PdfViewerEmits, type PanStart } from './types';
import './style/index.less';

defineOptions({ name: 'APdfViewer' });

const props = defineProps(pdfViewerProps);
const emit = defineEmits<PdfViewerEmits>();

const canvasRef = ref<HTMLCanvasElement>();
/** 预览区容器，用于「适合宽度」时量取可用宽度 */
const stageRef = ref<HTMLDivElement>();
/** 文档刚加载完，待执行一次「适合宽度」 */
const fitPendingRef = ref(false);
// pdf.js 的类实例大量基于私有字段（#xxx）：被 Vue 的响应式 Proxy 包一层后，
// 方法内部的私有字段访问会因 receiver 变成代理而抛
// 「Cannot read from private field」，因此必须用 shallowRef 存原始实例。
const loadingTaskRef = shallowRef<PDFDocumentLoadingTask | null>(null);
const renderTaskRef = shallowRef<RenderTask | null>(null);

const isControlled = computed(() => props.open !== undefined);
const innerOpen = ref(props.defaultOpen);
const visible = computed(() =>
  isControlled.value ? (props.open as boolean) : innerOpen.value,
);

const pdfDoc = shallowRef<PDFDocumentProxy | null>(null);
const numPages = ref(0);
const pageNumber = ref(1);
const scale = ref(props.initialScale);
const rotation = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);
/** 递增触发重新加载（重试按钮） */
const reloadToken = ref(0);

// 平移：高频 pointermove 经 rAF 合并，每帧至多一次状态更新
const translate = ref({ x: 0, y: 0 });
const panning = ref(false);
const panStartRef = ref<PanStart | null>(null);
const panRafRef = ref<number | null>(null);
const pendingPanRef = ref<{ x: number; y: number } | null>(null);

function setOpen(next: boolean) {
  if (!isControlled.value) innerOpen.value = next;
  emit('update:open', next);
  emit('open-change', next);
}

// worker 为全局配置，实例级传入时覆盖
watch(
  () => props.workerSrc,
  (workerSrc) => {
    if (!workerSrc) return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  },
  { immediate: true },
);

// 关闭即销毁文档与渲染任务，避免大文件滞留内存；状态一并复位
watch([visible, () => props.initialScale], ([v]) => {
  if (v) return;
  renderTaskRef.value?.cancel();
  renderTaskRef.value = null;
  loadingTaskRef.value?.destroy();
  loadingTaskRef.value = null;
  pdfDoc.value = null;
  numPages.value = 0;
  pageNumber.value = 1;
  scale.value = props.initialScale;
  rotation.value = 0;
  translate.value = { x: 0, y: 0 };
  error.value = null;
  loading.value = false;
});

// 按需加载：仅打开且配置了 url 时请求
watch(
  [
    visible,
    () => props.url,
    () => props.assetBaseUrl,
    reloadToken,
    () => props.workerSrc,
    () => props.pdfjsSrc,
  ],
  (_, __, onCleanup) => {
    if (!visible.value || !props.url) return;
    let cancelled = false;
    loading.value = true;
    error.value = null;

    const load = async () => {
      // pdf.js 的消息通道依赖 Promise.try 转发参数，先确保其行为正确
      await ensurePromiseTry();
      const pdfjs = await resolvePdfjs(props.pdfjsSrc);

      if (props.pdfjsSrc) {
        // 运行时加载的实例：
        // - 指定了 workerSrc → 独立线程；
        // - 否则从同一目录运行时取 worker 模块，走主线程（不经打包器）
        if (props.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = props.workerSrc;
        } else {
          const workerModule = await nativeImport<{
            WorkerMessageHandler?: unknown;
          }>(deriveWorkerUrl(props.pdfjsSrc));
          (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = workerModule;
        }
      } else if (!hasExplicitWorkerSrc(props.workerSrc)) {
        // 未显式配置 worker 时走主线程渲染：零配置、无外部请求，且不受打包器影响
        await ensureMainThreadWorker();
      }

      // 显式传入全部资源地址：pdf.js 自行推导时会依赖被打包器改写的 import.meta.url
      const base = props.assetBaseUrl ?? defaultAssetBaseUrl(pdfjs);
      const withBase = (p: string) => (base ? `${base}${p}` : undefined);

      const loadingTask = pdfjs.getDocument({
        url: props.url as string,
        cMapUrl: withBase('cmaps/'),
        cMapPacked: true,
        wasmUrl: withBase('wasm/'),
        iccUrl: withBase('iccs/'),
        standardFontDataUrl: withBase('standard_fonts/'),
      });
      loadingTaskRef.value = loadingTask;
      return loadingTask.promise;
    };

    load()
      .then((doc) => {
        if (cancelled) {
          // 弹窗已关闭或 url 已变更，立即释放避免泄漏
          void loadingTaskRef.value?.destroy();
          loadingTaskRef.value = null;
          return;
        }
        pdfDoc.value = doc;
        numPages.value = doc.numPages;
        pageNumber.value = 1;
        fitPendingRef.value = true;
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        error.value = err instanceof Error ? err.message : String(err);
        loading.value = false;
      });

    onCleanup(() => {
      cancelled = true;
      // url 变更 / 关闭 / 卸载时释放当前文档：
      // - 尚在加载的文档由上方 cancelled 分支销毁（未进 ref，不会重复销毁）
      // - 已加载完成的文档在此销毁并清空 ref，供后续分支安全跳过
      renderTaskRef.value?.cancel();
      loadingTaskRef.value?.destroy();
      loadingTaskRef.value = null;
    });
  },
  { immediate: true },
);

// 渲染当前页：翻页 / 缩放 / 旋转变化时重绘
watch(
  [
    pdfDoc,
    pageNumber,
    scale,
    rotation,
    visible,
    () => props.autoFitWidth,
    () => props.scaleRange,
  ],
  (_, __, onCleanup) => {
    if (!visible.value || !pdfDoc.value) return;
    let cancelled = false;
    loading.value = true;
    // 主动取消上一次渲染，避免快速翻页 / 缩放时旧任务覆盖画布
    renderTaskRef.value?.cancel();

    const render = async () => {
      try {
        const page = await pdfDoc.value!.getPage(pageNumber.value);
        const canvas = canvasRef.value;
        if (cancelled || !canvas) return;

        // 「适合宽度」：用容器可用宽度反推缩放比例，钳制在 scaleRange 内；
        // 仅在文档刚加载完执行一次，之后交由用户手动缩放（不再干预）
        if (props.autoFitWidth && fitPendingRef.value) {
          fitPendingRef.value = false;
          const available = stageRef.value?.clientWidth ?? 0;
          if (available > 0) {
            const baseWidth = page.getViewport({
              scale: 1,
              rotation: rotation.value,
            }).width;
            const fitted = clamp(
              Number((available / baseWidth).toFixed(3)),
              props.scaleRange[0],
              props.scaleRange[1],
            );
            if (fitted !== scale.value) {
              scale.value = fitted;
              return; // 等 scale 变化触发下一轮渲染
            }
          }
        }
        // 画布按设备像素比放大，避免高倍屏下模糊
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({
          scale: scale.value * dpr,
          rotation: rotation.value,
        });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        const task = page.render({ canvas, viewport });
        renderTaskRef.value = task;
        await task.promise;
        if (!cancelled) loading.value = false;
      } catch (err) {
        if (cancelled || isRenderCancelled(err)) return;
        error.value = err instanceof Error ? err.message : String(err);
        loading.value = false;
      }
    };
    void render();

    onCleanup(() => {
      cancelled = true;
    });
  },
  { immediate: true },
);

// 卸载兜底：组件销毁时释放文档与未完成的帧回调
onBeforeUnmount(() => {
  renderTaskRef.value?.cancel();
  loadingTaskRef.value?.destroy();
  loadingTaskRef.value = null;
  if (panRafRef.value != null) {
    window.cancelAnimationFrame(panRafRef.value);
  }
});

function goToPage(next: number) {
  const target = clampPage(next, numPages.value);
  if (target !== pageNumber.value) {
    pageNumber.value = target;
    translate.value = { x: 0, y: 0 };
    emit('page-change', target);
  }
}

function zoom(direction: 1 | -1) {
  scale.value = stepScale(scale.value, direction, props.scaleRange);
}

function rotate() {
  rotation.value = normalizeRotation(rotation.value + 90);
}

/* ===== 拖拽平移（pointer 统一鼠标与触摸） ===== */

function flushPan() {
  panRafRef.value = null;
  const pending = pendingPanRef.value;
  pendingPanRef.value = null;
  if (pending) translate.value = pending;
}

function handlePanStart(e: PointerEvent) {
  if (e.button !== 0) return;
  // 捕获指针后，移出容器也能继续收到 move / up
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  panStartRef.value = {
    x: e.clientX,
    y: e.clientY,
    baseX: translate.value.x,
    baseY: translate.value.y,
  };
  panning.value = true;
}

function handlePanMove(e: PointerEvent) {
  const start = panStartRef.value;
  if (!start) return;
  pendingPanRef.value = {
    x: start.baseX + (e.clientX - start.x),
    y: start.baseY + (e.clientY - start.y),
  };
  if (panRafRef.value == null) {
    panRafRef.value = window.requestAnimationFrame(flushPan);
  }
}

function handlePanEnd() {
  panStartRef.value = null;
  panning.value = false;
}

const stageCls = computed(() =>
  classNames(
    prefixCls('pdf-viewer-stage'),
    panning.value && prefixCls('pdf-viewer-stage--panning'),
  ),
);

const canvasWrapStyle = computed<CSSProperties>(() => ({
  transform: `translate(${translate.value.x}px, ${translate.value.y}px)`,
  transition: panning.value
    ? 'none'
    : 'transform var(--aura-duration-base) var(--aura-easing)',
}));
</script>
