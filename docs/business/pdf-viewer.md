# PdfViewer PDF 弹窗预览

基于 [pdf.js](https://github.com/mozilla/pdf.js) 的弹窗式 PDF 预览：支持翻页、缩放、旋转与拖拽平移，打开时按需加载、关闭即销毁文档资源。触发方式（按钮 / 链接 / 列表行点击）由调用方组合。

与一般预览方案（iframe / 浏览器内置阅读器）不同，canvas 渲染的观感在各浏览器一致，且可禁用下载入口，适合合同、报告等受控预览场景。

## 何时使用

- 合同、报告等文档的受控预览（不希望直接下载或依赖浏览器阅读器）
- 列表页中「点击行 / 按钮查看详情文档」的场景
- 需要跨浏览器一致渲染观感的在线预览

## 何时不用

| 场景                | 应该用                              |
| ------------------- | ----------------------------------- |
| 只需要弹窗展示图片  | Element Plus 的 `ElImageViewer`     |
| 需要编辑 / 批注 PDF | 专业 PDF 编辑组件（不在本库范围内） |

## 基础用法

`open` 受控或 `default-open` 非受控控制弹窗显隐；`url` 变更时自动重新加载：

<demo src="./demos/pdf-viewer/basic.vue" />

- 打开时按需加载 pdf.js 与文档，关闭即销毁资源，不滞留内存
- 工具栏内置缩放（钳制在 `scaleRange`）、旋转、翻页与页码指示

## 列表触发与失败态

多文档共用一个预览实例：`url` 切换自动重新加载；加载失败出现错误提示与重试按钮：

<demo src="./demos/pdf-viewer/list.vue" />

## worker 配置

默认**零配置**：pdf.js 在主线程渲染（不创建独立 worker、不请求外部文件），对打包器无任何要求，超大文档可能占用主线程。需要独立线程时，把**原样**的 worker 文件自托管后传 `worker-src`：

```vue
<PdfViewer
  url="/report.pdf"
  worker-src="/pdf.worker.min.mjs"
  asset-base-url="https://cdn.example.com/pdfjs/"
/>
```

- `pdfjs-src`：宿主构建无法正确打包 pdf.js 时，传同源或 CDN 上的原样 `pdf.min.mjs` 地址，组件运行时 `import(url)` 直取、绕开打包器
- `asset-base-url`：cmaps / wasm / iccs / standard_fonts 资源基地址，默认按运行时版本推导官方 CDN；内网部署可自托管后传入

## API

### Props

| 属性         | 说明                             | 类型               | 默认值                   |
| ------------ | -------------------------------- | ------------------ | ------------------------ |
| url          | PDF 文件地址（需同源或允许跨域） | `string`           | -                        |
| open         | 是否显示预览弹窗（受控）         | `boolean`          | -                        |
| defaultOpen  | 默认是否显示（非受控）           | `boolean`          | `false`                  |
| title        | 弹窗标题                         | `string`           | `'文档预览'`             |
| initialScale | 初始缩放比例（1 = 100%）         | `number`           | `1`                      |
| scaleRange   | 缩放范围 [最小, 最大]            | `[number, number]` | `[0.5, 3]`               |
| width        | 弹窗宽度（默认 A4 纸宽 210mm）   | `number \| string` | `'210mm'`                |
| pdfjsSrc     | 运行时加载 pdf.js 的地址         | `string`           | -                        |
| workerSrc    | pdf.js worker 脚本地址           | `string`           | -（主线程渲染）          |
| assetBaseUrl | pdf.js 资源基地址                | `string`           | 按运行时版本推导官方 CDN |
| autoFitWidth | 加载后按容器宽度自动适配缩放     | `boolean`          | `true`                   |

### Events

| 事件        | 说明                     | 回调参数          |
| ----------- | ------------------------ | ----------------- |
| update:open | 弹窗显隐（v-model:open） | `(open: boolean)` |
| open-change | 弹窗显隐变化             | `(open: boolean)` |
| page-change | 页码变化                 | `(page: number)`  |

### 类型导出

```ts
import type { PdfViewerProps } from '@aura-vue/business';
```

### CSS 类名

| 类名                              | 说明           |
| --------------------------------- | -------------- |
| `.aura-pdf-viewer`                | 容器           |
| `.aura-pdf-viewer-stage`          | 预览区         |
| `.aura-pdf-viewer-stage--panning` | 平移中的预览区 |
| `.aura-pdf-viewer-toolbar`        | 工具栏         |
| `.aura-pdf-viewer-error`          | 错误态         |

预览区高度可通过覆盖 `--aura-pdf-viewer-body-height`（默认 `70vh`）调整。

## 相关文档

- [PageContainer 页面容器](/business/page-container) — 页面外壳
