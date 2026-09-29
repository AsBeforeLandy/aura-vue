import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * 文档站部署在子路径下（`base: '/aura-vue/'`）。
 *
 * ⚠️ goto 里**不能**写绝对路径：Playwright 用 `new URL(path, baseURL)` 解析，
 * 以 `/` 开头的路径会把 baseURL 的目录段整段丢掉，
 * 于是 `/components/modal` 实际访问的是 `http://localhost:4173/components/modal`——
 * 一个 404 页。第一版就是这么挂的，而且症状很有迷惑性：
 * 页面加载成功、断言超时，像是「组件没渲染」。
 */
export const DOCS_BASE = '/aura-vue';

/** 拼出文档站内某个页面的完整路径 */
export function docsPath(path: string): string {
  return `${DOCS_BASE}${path}`;
}

/**
 * 导航到文档站页面并等待网络空闲。
 *
 * `waitUntil: 'networkidle'` 是为了把「页面 JS 已加载完」这件事等稳：
 * 并行跑用例时浏览器缓存会让二次导航快到离谱，如果 click 落在
 * Vue 水合完成之前，事件监听还没绑上，点击会**静默无效**——
 * 表现为「单独跑通过、全量跑失败」，而且 DEBUG 出来焦点还停在触发按钮上。
 */
export async function gotoDocs(page: Page, path: string) {
  await page.goto(docsPath(path), { waitUntil: 'networkidle' });
}

/**
 * 页面上第一个 demo 的**预览区**。
 *
 * 注意不要用 `.demo`：Demo 组件除了预览区还有「查看代码 / 复制代码」按钮，
 * 会干扰按名称定位控件与 Tab 顺序的断言。
 */
export function firstDemo(page: Page) {
  return page.locator('.demo-render').first();
}

/**
 * 点击触发按钮打开弹窗，并确保面板真的出现了。
 *
 * 用重试兜住水合竞态：若 click 落在水合之前（监听未绑上），点击无效、
 * 面板不出现，就再点一次。弹窗是「点击置为 open」，重复点击不会翻转状态，
 * 所以重试是安全的。
 */
export async function openModal(page: Page, trigger: Locator) {
  const panel = page.locator('.aura-modal-panel');

  await expect
    .poll(
      async () => {
        await trigger.click();
        return panel.count();
      },
      {
        timeout: 10_000,
        intervals: [200, 400, 800],
        message: '点击后弹窗始终没有出现（可能尚未完成水合，或组件异常）',
      },
    )
    .toBeGreaterThan(0);

  await expect(panel).toBeVisible();
  return trigger;
}
