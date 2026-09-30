/**
 * pdf.js 运行时策略：worker 装载、实例解析与资源基地址。
 *
 * 这组函数与框架无关，自 React 版原样移植；注释中记录的打包器 / 运行时
 * 行为差异均为两个仓库实测结论，属于「不写下来就会有人再踩一遍」的知识。
 */

import * as pdfjsLib from 'pdfjs-dist';

/** A4 纸宽度（CSS 的 mm 即物理毫米，210mm ≈ 794px） */
export const A4_WIDTH = '210mm';

/**
 * 启用主线程渲染（默认）。
 *
 * pdf.js 会优先查找 `globalThis.pdfjsWorker.WorkerMessageHandler`，命中则直接用其
 * handler 在主线程解析文档：**不创建独立 worker、不请求任何外部文件**，因此不受
 * 打包器对 worker 文件的处理方式影响，也没有 CDN / 同源 / MIME 的额外约束。
 *
 * 为什么不用 `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`？
 * 该写法会把 worker 送进打包器的 JS 处理管线：实测会把文件包进 IIFE、
 * 却把顶层 `export` 留在函数体内，产物不再是合法 ES Module，运行时抛
 * `SyntaxError: Unexpected token 'export'`——真 worker 与 pdf.js 的主线程回退同时失效。
 *
 * 代价是解析占用主线程，超大文档可能影响交互流畅度。需要独立线程时，用 `workerSrc`
 * 指向自托管的原样 worker 文件（见文档「worker 配置」）。
 */
export async function ensureMainThreadWorker(): Promise<void> {
  const g = globalThis as { pdfjsWorker?: unknown };
  if (g.pdfjsWorker) return;
  // 动态引入以便按需加载（未使用 pdf 预览的页面不会付出这部分体积）
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs');
  g.pdfjsWorker = workerModule;
}

/** 宿主是否已显式指定 worker（此时走真正的独立线程） */
export function hasExplicitWorkerSrc(workerSrc?: string): boolean {
  return !!workerSrc || !!pdfjsLib.GlobalWorkerOptions.workerSrc;
}

/**
 * 原生动态导入。
 *
 * 用 `new Function` 包一层：打包器无法静态分析函数体内部的 `import()`，
 * 因此不会把它改写成自己的模块解析逻辑（实测提示注释会在压缩阶段丢失，
 * 导致 URL 导入被改写）。用于需要**绕开打包器**加载原样资源
 * （pdf.js 主模块 / worker）的场景。
 */
export const nativeImport = <T>(url: string): Promise<T> =>
  (new Function('u', 'return import(u)') as (u: string) => Promise<T>)(url);

/** 解析实际使用的 pdf.js 实例 */
export async function resolvePdfjs(src?: string): Promise<typeof pdfjsLib> {
  // 显式指定地址 → 运行时加载（不经打包器）
  if (src) return nativeImport<typeof pdfjsLib>(src);
  // 默认：使用随产物打包的实例
  return pdfjsLib;
}

/** 由 pdf.js 主模块地址推导同目录下的 worker 模块地址 */
export function deriveWorkerUrl(pdfjsSrc: string): string {
  return pdfjsSrc.replace(/pdf(?:\.min)?\.mjs$/, 'pdf.worker.min.mjs');
}

/** `Promise.try` 的规范实现（转发参数；回调同步抛错时 reject） */
export function specPromiseTry(
  fn: (...args: unknown[]) => unknown,
  ...args: unknown[]
): Promise<unknown> {
  return new Promise((resolve) => resolve(fn(...args)));
}

/**
 * 确保 `Promise.try` 会**转发参数**。
 *
 * pdf.js 通过 `Promise.try(action, data)` 把消息参数交给处理器，因此对
 * `Promise.try` 的参数转发有硬依赖。而某些运行时 polyfill 提供的实现会丢弃参数——
 * 后果是 pdf.js 的 worker 收到空消息，抛出与实际原因毫无关系的错误
 * （`Cannot destructure property 'docId' …`、
 * `Cannot set properties of undefined (setting 'onPull')`）。
 *
 * 每次加载前做一次特性探测（成本仅一次微任务），仅在检测到确有缺陷时恢复规范实现；
 * `Promise.try` 本身缺失时不做兜底（交回给 pdf.js 报错，避免掩盖环境问题）。
 */
export async function ensurePromiseTry(): Promise<void> {
  const holder = Promise as PromiseConstructor & {
    try?: (
      fn: (...args: unknown[]) => unknown,
      ...args: unknown[]
    ) => Promise<unknown>;
  };
  const current = holder.try;
  if (typeof current !== 'function') return;

  try {
    const received = await current((...args: unknown[]) => args, 1, 2);
    if (Array.isArray(received) && received[0] === 1 && received[1] === 2) {
      return; // 参数转发正常
    }
  } catch {
    // 探测失败，按缺陷处理
  }
  holder.try = specPromiseTry as NonNullable<typeof holder.try>;
}

/**
 * 默认资源基地址：按**运行时版本**推导的官方 CDN。
 *
 * 必须显式传入 cmaps / wasm / iccs / standard_fonts 的地址，不能让 pdf.js 自行推导：
 * 它用 `import.meta.url` 定位这些资源，而打包器会把它替换成构建机上的绝对路径
 * （实测产物中出现 `file:///Users/...`），运行时必然取不到资源。
 *
 * 用 `pdfjs.version` 而非硬编码版本号，可避免依赖升级后地址与实际版本漂移。
 */
export function defaultAssetBaseUrl(pdfjs: typeof pdfjsLib): string {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/`;
}
