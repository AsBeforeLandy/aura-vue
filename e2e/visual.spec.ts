import { expect, test } from '@playwright/test';
import { gotoDocs, openModal } from './helpers';

/**
 * 像素级视觉回归 —— opt-in，**不进 CI 默认**。
 *
 * ⚠️ 为什么不放进 CI：
 * 基线图与「平台 + 字体渲染」强绑定。macOS 上生成的基线放到 Linux CI 必然不匹配，
 * 只会产生「本地全绿、CI 全红」的噪音，最后大家学会无脑 `--update-snapshots`，
 * 门禁就名存实亡了。
 *
 * 因此本项目把视觉回归拆成两层：
 *   1. **几何 / 计算样式断言**（modal.spec.ts / pro-table.spec.ts 里的
 *      boundingBox、textAlign、transitionDuration 等）——跨平台稳定，进 CI 当门禁；
 *   2. **本文件的像素比对**——交给能稳定产出基线的环境本地跑。
 *
 * 用法：
 *   pnpm test:e2e:visual --update-snapshots   # 生成/更新基线并提交
 *   pnpm test:e2e:visual                      # 之后本地比对
 *
 * 截图口径：只截**组件渲染区**（`.demo-render`），不截整页——
 * 整页含侧边栏、搜索框等大量与组件无关的动态内容，会让基线噪声盖过信号。
 */

test.describe('视觉回归（opt-in）', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });

  // 折叠 demo 的源码区、等字体重排，尽量消除与组件无关的差异
  test.beforeEach(async ({ page }) => {
    await gotoDocs(page, '/components/button');
    await page.evaluate(() => document.fonts.ready);
  });

  test('Button 各形态', async ({ page }) => {
    // loading demo 里有一个常驻旋转的指示器，动画已通过 reducedMotion: reduce 冻结
    const demos = page.locator('.demo-render');
    await expect(demos).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      await expect(demos.nth(i)).toHaveScreenshot(`button-${i}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test('Modal 打开态', async ({ page }) => {
    await gotoDocs(page, '/components/modal');
    await page.evaluate(() => document.fonts.ready);

    const trigger = page
      .locator('.demo-render')
      .first()
      .getByRole('button', { name: '打开弹窗' });
    await openModal(page, trigger);

    // 遮罩是半透明的，截它会把背后的页面内容也卷进来；
    // 只截面板能稳定反映弹窗自身的视觉
    await expect(page.locator('.aura-modal-panel')).toHaveScreenshot(
      'modal-panel.png',
      { animations: 'disabled', maxDiffPixelRatio: 0.02 },
    );
  });

  test('ProTable 渲染', async ({ page }) => {
    await gotoDocs(page, '/business/pro-table');
    await page.evaluate(() => document.fonts.ready);

    const table = page.locator('.demo-render').first().locator('.el-table');
    await expect(table.locator('.el-table__body tbody tr').first()).toBeVisible(
      { timeout: 10_000 },
    );

    await expect(table).toHaveScreenshot('pro-table.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
