import { defineConfig, devices } from '@playwright/test';

/**
 * 真浏览器 E2E。
 *
 * ## 为什么需要它（单元测试覆盖不到的那部分）
 *
 * 单元测试跑在 happy-dom 上，没有布局引擎。这导致几类问题**在单测里根本无法验证**：
 *   - `ElTable` 依赖列宽测量，渲染不出任何 `<td>`（数据层只能靠暴露的 getData 断言）；
 *   - 焦点行为（Tab 顺序、focus trap、focus 归还）依赖真实的可聚焦性计算；
 *   - 计算样式（transition / animation 的实际取值）不存在；
 *   - 几何布局（是否居中、是否溢出）无从谈起。
 *
 * 这里跑的是**构建后的文档站**，所以顺带覆盖了「产物在真实浏览器里能不能用」。
 *
 * ## 断言口径：以确定性为主
 *
 * 主力是行为断言（键盘、焦点）与几何/计算样式断言——它们跨平台稳定、可直接当门禁。
 * 像素级视觉回归单独放在 `visual` project（不会在 CI 默认跑），
 * 原因是基线图与平台字体渲染强绑定，见 e2e/visual.spec.ts 顶部说明。
 */

const PORT = 4173;
/** 文档站部署在子路径（base: '/aura-vue/'），本地预览同样带前缀 */
const BASE_URL = `http://localhost:${PORT}/aura-vue`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['list']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'e2e',
      use: { ...devices['Desktop Chrome'], channel: undefined },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], channel: undefined },
      testMatch: /visual\.spec\.ts/,
    },
  ],

  webServer: {
    // 服务的是已构建的产物；构建由 test:e2e 脚本负责（只构建一次）
    command: `pnpm --filter @aura/docs preview --port ${PORT} --strictPort`,
    url: `${BASE_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
