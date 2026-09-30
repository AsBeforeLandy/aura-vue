import type { PropType, CSSProperties } from 'vue';

export type PdfViewerProps = {
  /** PDF 文件地址（需同源，或服务端允许跨域） */
  url?: string;
  /** 是否显示预览弹窗（受控） */
  open?: boolean;
  /** 默认是否显示（非受控） */
  defaultOpen?: boolean;
  /**
   * 弹窗标题
   * @default '文档预览'
   */
  title?: string;
  /**
   * 初始缩放比例（1 = 100%）
   * @default 1
   */
  initialScale?: number;
  /**
   * 缩放范围 [最小, 最大]
   * @default [0.5, 3]
   */
  scaleRange?: [number, number];
  /**
   * 弹窗宽度。默认取 **A4 纸宽度**（`210mm` ≈ 794px），使 A4 文档恰好按 100% 呈现。
   * 数字按 px，也可传任意 CSS 长度（如 `'96%'`）；窄屏下会按视口宽度自动收敛。
   * @default '210mm'
   */
  width?: number | string;
  /**
   * 运行时加载 pdf.js 的地址（不经打包器，`import(url)` 直取）。
   *
   * 用于宿主构建无法正确打包 pdf.js 的场景：
   * 传同源或 CDN 上的**原样** `pdf.min.mjs` 地址即可绕开打包器处理。
   * 此时通常还需同时指定 `workerSrc`（同一份原样 worker 文件）。
   */
  pdfjsSrc?: string;
  /**
   * pdf.js worker 脚本地址。
   * 不传时在主线程渲染（零配置、无外部请求，大文档可能影响交互）；
   * 传入后启用独立线程，需指向**原样**的 worker 文件（自托管或 CDN），
   * 详见文档「worker 配置」。
   */
  workerSrc?: string;
  /**
   * pdf.js 资源基地址（cmaps / wasm / iccs / standard_fonts）。
   *
   * 默认按**运行时版本**推导官方 CDN 地址。内网部署可自托管这些目录后传入，
   * 例如 `pdfjs-dist` 包内的 `cmaps/`、`wasm/`、`iccs/`、`standard_fonts/`。
   */
  assetBaseUrl?: string;
  /**
   * 文档加载完成后按容器宽度自动适配缩放（「适合宽度」）。
   *
   * pdf.js 的 `scale = 1` 是「1pt = 1px」：A4（595pt 宽）只渲染 595px，
   * 放进 A4 宽的弹窗里会明显留白。开启后会用容器可用宽度反推初始缩放，
   * 并钳制在 `scaleRange` 内；用户手动缩放后不再干预。
   * @default true
   */
  autoFitWidth?: boolean;
};

export const pdfViewerProps = {
  url: { type: String, default: undefined },
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: false },
  title: { type: String, default: '文档预览' },
  initialScale: { type: Number, default: 1 },
  scaleRange: {
    type: Array as unknown as PropType<[number, number]>,
    default: (): [number, number] => [0.5, 3],
  },
  width: {
    type: [Number, String] as PropType<number | string>,
    default: '210mm',
  },
  pdfjsSrc: { type: String, default: undefined },
  workerSrc: { type: String, default: undefined },
  assetBaseUrl: { type: String, default: undefined },
  autoFitWidth: { type: Boolean, default: true },
} as const;

export interface PdfViewerEmits {
  (e: 'update:open', open: boolean): void;
  (e: 'open-change', open: boolean): void;
  (e: 'page-change', page: number): void;
}

/** 拖拽平移的基准状态 */
export interface PanStart {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
}

export type PdfViewerStyle = CSSProperties;
