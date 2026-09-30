import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  beforeAll,
} from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import PdfViewer from '../src/pdf-viewer/PdfViewer.vue';

const { getDocumentMock, renderMock, destroyMock, getViewportMock } =
  vi.hoisted(() => ({
    getDocumentMock: vi.fn(),
    renderMock: vi.fn(),
    destroyMock: vi.fn(),
    getViewportMock: vi.fn(),
  }));

// pdf.js 依赖真实 canvas 与 worker，单测中整体 mock 渲染层，只验证交互与状态流转
vi.mock('pdfjs-dist', () => ({
  // 组件用运行时版本推导资源地址，桩里需提供
  version: '6.3.289',
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: getDocumentMock,
}));

// 默认（未传 workerSrc）走主线程渲染，会动态导入 worker 模块——单测中同样 mock，
// 避免真的加载 1.3 MB 的 worker 文件；断言点在于「是否挂载了 globalThis.pdfjsWorker」
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs', () => ({
  WorkerMessageHandler: { setup: vi.fn() },
}));

/** 构造假的 PDF 文档代理：3 页，视口 100 x 141 */
function makeFakeDoc() {
  return {
    numPages: 3,
    getPage: vi.fn(async () => ({
      getViewport: getViewportMock,
      render: renderMock,
    })),
  };
}

/** pdf.js 6.x 的销毁入口在 loadingTask 上 */
function makeFakeLoadingTask() {
  return {
    promise: Promise.resolve(makeFakeDoc()),
    destroy: destroyMock,
  };
}

beforeAll(() => {
  // happy-dom 未实现 2d 上下文，桩掉即可（组件只调用 getContext，不真正绘制）
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

beforeEach(() => {
  vi.clearAllMocks();
  delete (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker;
  GlobalWorkerOptions.workerSrc = '';
  getDocumentMock.mockImplementation(() => makeFakeLoadingTask());
  // 与 pdfjs RenderTask 同形：渲染 promise + 可取消
  renderMock.mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
  getViewportMock.mockImplementation(
    ({ scale, rotation }: { scale: number; rotation: number }) => ({
      width: 100 * scale,
      height: 141 * scale,
      scale,
      rotation,
    }),
  );
});

afterEach(() => {
  // EP Dialog teleport 到 body；即使 stub 掉也清理，避免污染后续用例
  document.body.innerHTML = '';
});

/** 按钮文案查找（EP Button 不插空格，可直接匹配） */
function findButton(
  wrapper: ReturnType<typeof mount>,
  label: string,
): ReturnType<typeof wrapper.find> {
  const button = wrapper.findAll('button').find((b) => b.text() === label);
  expect(button, `应存在「${label}」按钮`).toBeTruthy();
  return button!;
}

const mountOptions = {
  global: { stubs: { teleport: true } },
};

/** 以非受控模式直接打开 */
function openViewer(url = '/aura/pdf-viewer/sample.pdf') {
  return mount(PdfViewer, {
    props: { url, defaultOpen: true },
    ...mountOptions,
  });
}

/** 等待文档加载完成（页码指示器出现） */
async function waitForLoaded(wrapper: ReturnType<typeof mount>) {
  await vi.waitFor(() => {
    expect(wrapper.find('.aura-pdf-viewer-page').text()).toBe('1 / 3');
  });
  await flushPromises();
}

describe('PdfViewer', () => {
  // ---- 正常 ----
  it('正常：打开后按需加载文档并显示页码', async () => {
    const wrapper = openViewer();

    await vi.waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(1));
    expect(getDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/aura/pdf-viewer/sample.pdf',
        cMapPacked: true,
      }),
    );
    await waitForLoaded(wrapper);
    expect(wrapper.find('.aura-pdf-viewer-page').text()).toBe('1 / 3');
  });

  it('正常：翻页更新页码并回调 page-change', async () => {
    const wrapper = mount(PdfViewer, {
      props: { url: '/a.pdf', defaultOpen: true },
      ...mountOptions,
    });
    await waitForLoaded(wrapper);
    await findButton(wrapper, '下一页').trigger('click');
    expect(wrapper.find('.aura-pdf-viewer-page').text()).toBe('2 / 3');
    expect(wrapper.emitted('page-change')![0][0]).toBe(2);

    await findButton(wrapper, '上一页').trigger('click');
    expect(wrapper.find('.aura-pdf-viewer-page').text()).toBe('1 / 3');
    expect((wrapper.emitted('page-change')!.at(-1) as [number])[0]).toBe(1);
  });

  it('正常：缩放步进并钳制在范围内，到边界自动禁用', async () => {
    const wrapper = mount(PdfViewer, {
      props: { url: '/a.pdf', defaultOpen: true, scaleRange: [0.8, 1.2] },
      ...mountOptions,
    });
    await waitForLoaded(wrapper);
    expect(wrapper.find('.aura-pdf-viewer-scale').text()).toBe('100%');
    expect(findButton(wrapper, '放大').attributes('disabled')).toBeUndefined();
    expect(findButton(wrapper, '缩小').attributes('disabled')).toBeUndefined();

    // 1.0 → 1.2：到达上限
    await findButton(wrapper, '放大').trigger('click');
    expect(wrapper.find('.aura-pdf-viewer-scale').text()).toBe('120%');
    expect(findButton(wrapper, '放大').attributes('disabled')).toBeDefined();

    // 1.2 → 1.0 → 0.8：到达下限
    await findButton(wrapper, '缩小').trigger('click');
    expect(wrapper.find('.aura-pdf-viewer-scale').text()).toBe('100%');
    await findButton(wrapper, '缩小').trigger('click');
    expect(wrapper.find('.aura-pdf-viewer-scale').text()).toBe('80%');
    expect(findButton(wrapper, '缩小').attributes('disabled')).toBeDefined();
    expect(findButton(wrapper, '放大').attributes('disabled')).toBeUndefined();
  });

  it('正常：旋转按 90° 步进并归一化到 0 / 90 / 180 / 270', async () => {
    const wrapper = openViewer();
    await waitForLoaded(wrapper);

    // 渲染是异步的：点击后需等待新一轮渲染把 rotation 传入视口
    await findButton(wrapper, '旋转').trigger('click');
    await vi.waitFor(() =>
      expect(getViewportMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ rotation: 90 }),
      ),
    );

    await findButton(wrapper, '旋转').trigger('click');
    await findButton(wrapper, '旋转').trigger('click');
    await findButton(wrapper, '旋转').trigger('click');
    await vi.waitFor(() =>
      expect(getViewportMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ rotation: 0 }),
      ),
    );
  });

  it('正常：关闭弹窗后销毁文档资源', async () => {
    const wrapper = openViewer();
    await waitForLoaded(wrapper);
    expect(destroyMock).not.toHaveBeenCalled();

    await findButton(wrapper, '关闭').trigger('click');
    await vi.waitFor(() => expect(destroyMock).toHaveBeenCalledTimes(1));
  });

  // ---- 边界 ----
  it('边界：未配置 url 时不发起加载，页码显示占位符', async () => {
    const wrapper = mount(PdfViewer, {
      props: { defaultOpen: true },
      ...mountOptions,
    });
    await flushPromises();
    expect(getDocumentMock).not.toHaveBeenCalled();
    expect(wrapper.find('.aura-pdf-viewer-page').text()).toBe('—');
  });

  it('边界：默认关闭时不加载文档', () => {
    mount(PdfViewer, { props: { url: '/a.pdf' }, ...mountOptions });
    expect(getDocumentMock).not.toHaveBeenCalled();
  });

  it('边界：受控模式下关闭只回调 open-change，不由组件改状态', async () => {
    const wrapper = mount(PdfViewer, {
      props: { url: '/a.pdf', open: true },
      ...mountOptions,
    });
    await waitForLoaded(wrapper);
    await findButton(wrapper, '关闭').trigger('click');

    expect(wrapper.emitted('open-change')![0][0]).toBe(false);
    // 受控：调用方未更新 open，弹窗内容仍在
    expect(wrapper.find('.aura-pdf-viewer-page').text()).toBe('1 / 3');
  });

  it('边界：打开状态下切换 url 会销毁旧文档并重新加载', async () => {
    const wrapper = openViewer('/a.pdf');
    await waitForLoaded(wrapper);
    expect(destroyMock).not.toHaveBeenCalled();

    await wrapper.setProps({ url: '/b.pdf' });
    await vi.waitFor(() => expect(destroyMock).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(2));
  });

  it('默认按 A4 纸宽度渲染弹窗，并可通过 width 覆盖', async () => {
    const wrapper = openViewer('/a.pdf');
    await waitForLoaded(wrapper);

    const dialog = wrapper.find('.el-dialog');
    expect(dialog.attributes('style')).toContain('210mm');
    await wrapper.unmount();

    const wrapper2 = mount(PdfViewer, {
      props: { url: '/a.pdf', defaultOpen: true, width: 600 },
      ...mountOptions,
    });
    await vi.waitFor(() =>
      expect(wrapper2.find('.el-dialog').exists()).toBe(true),
    );
    expect(wrapper2.find('.el-dialog').attributes('style')).toContain('600px');
  });

  it('默认开启「适合宽度」：按容器宽度反推缩放并钳制在 scaleRange 内', async () => {
    // happy-dom 的 clientWidth 恒为 0，这里桩成 800px 模拟真实容器
    const original = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientWidth',
    );
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 800,
    });
    try {
      // 假页面在 scale=1 时宽 100px → 800/100 = 8，被 scaleRange 上限 3 钳制
      const wrapper = mount(PdfViewer, {
        props: { url: '/a.pdf', defaultOpen: true, scaleRange: [0.5, 3] },
        ...mountOptions,
      });
      await vi.waitFor(() =>
        expect(wrapper.find('.aura-pdf-viewer-scale').text()).toBe('300%'),
      );
    } finally {
      if (original) {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', original);
      }
    }
  });

  it('autoFitWidth=false 时不干预缩放', async () => {
    const wrapper = mount(PdfViewer, {
      props: { url: '/a.pdf', defaultOpen: true, autoFitWidth: false },
      ...mountOptions,
    });
    await waitForLoaded(wrapper);
    expect(wrapper.find('.aura-pdf-viewer-scale').text()).toBe('100%');
  });

  // ---- worker 策略 ----
  it('Promise.try 丢失参数时会被替换为规范实现（pdf.js 依赖它传消息参数）', async () => {
    const holder = Promise as PromiseConstructor & { try?: unknown };
    const original = holder.try;
    // 注入「不转发参数」的缺陷实现（某些运行时的真实行为）
    holder.try = (() => Promise.resolve([])) as unknown as typeof holder.try;
    try {
      openViewer();
      await vi.waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(1));

      const received = (await (
        holder.try as (
          fn: (...a: unknown[]) => unknown,
          ...a: unknown[]
        ) => Promise<unknown>
      )((...args: unknown[]) => args, 1, 2)) as unknown[];
      expect(received).toEqual([1, 2]);
    } finally {
      holder.try = original;
    }
  });

  it('默认（未传 workerSrc）：挂载主线程 handler，走主线程渲染', async () => {
    openViewer();
    await vi.waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(1));
    expect((globalThis as { pdfjsWorker?: unknown }).pdfjsWorker).toBeDefined();
  });

  it('传入 workerSrc：启用独立线程，不挂载主线程 handler', async () => {
    mount(PdfViewer, {
      props: {
        url: '/a.pdf',
        defaultOpen: true,
        workerSrc: '/pdf.worker.min.js',
      },
      ...mountOptions,
    });
    await vi.waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(1));
    expect(GlobalWorkerOptions.workerSrc).toBe('/pdf.worker.min.js');
    expect(
      (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker,
    ).toBeUndefined();
  });

  // ---- 异常 ----
  it('异常：加载失败展示错误态，可通过重试恢复', async () => {
    getDocumentMock.mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('网络超时')),
      destroy: destroyMock,
    }));
    const wrapper = openViewer();

    await vi.waitFor(() => {
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });
    const alert = wrapper.find('[role="alert"]');
    expect(alert.text()).toContain('文档加载失败');
    expect(alert.text()).toContain('网络超时');

    await findButton(wrapper, '重试').trigger('click');
    // 加载前需先确保主线程 handler 就绪，故为异步发起，需等待
    await vi.waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(2));
    await waitForLoaded(wrapper);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });
});
