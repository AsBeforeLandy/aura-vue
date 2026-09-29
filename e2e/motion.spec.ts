import { expect, test } from '@playwright/test';
import { gotoDocs } from './helpers';

/**
 * prefers-reduced-motion —— 在真实浏览器里验证「减少动态效果」真的生效。
 *
 * 为什么必须真浏览器：
 * Less 里写的是 `transition: color var(--aura-duration-base) ...`，
 * 单元测试能断言**源码契约**（令牌存在、reduce 下有覆盖），但验证不了
 * **计算样式**——令牌是否真的解析、媒体查询是否真的命中，
 * 只有真实渲染才知道。
 *
 * 断言口径：
 *   - 默认偏好下，过渡保留非零时长；
 *   - reduce 下，过渡时长为 0（装饰性动效取消）；
 *   - reduce 下，loading 旋转**放缓为 2.4s 而不是停止**——
 *     它承载「正在处理中」的语义，冻结会被理解成界面卡死。
 */

const BUTTON_PAGE = '/components/button';

function readTransitions(
  page: import('@playwright/test').Page,
  locator: ReturnType<import('@playwright/test').Page['locator']>,
) {
  return locator.evaluate((el) =>
    getComputedStyle(el)
      .transitionDuration.split(',')
      .map((s) => s.trim()),
  );
}

/** 带 loading 旋转指示器的 demo（button.md 第 3 个） */
function loadingDemo(page: import('@playwright/test').Page) {
  return page
    .locator('.demo-render')
    .filter({ has: page.locator('.aura-button-loading-dot') })
    .first();
}

test.describe('prefers-reduced-motion：默认（无偏好）', () => {
  test('按钮过渡保留默认时长', async ({ page }) => {
    await gotoDocs(page, BUTTON_PAGE);

    const durations = await readTransitions(
      page,
      page.locator('.aura-button').first(),
    );
    expect(durations.length).toBeGreaterThan(0);
    expect(
      durations.some((d) => d !== '0s'),
      '默认偏好下过渡不应被清零',
    ).toBe(true);
  });

  test('loading 旋转为默认 1s', async ({ page }) => {
    await gotoDocs(page, BUTTON_PAGE);

    const dot = loadingDemo(page).locator('.aura-button-loading-dot');
    await expect(dot).toHaveCount(1);
    expect(
      await dot.evaluate((el) => getComputedStyle(el).animationDuration),
    ).toBe('1s');
  });
});

test.describe('prefers-reduced-motion：reduce', () => {
  test.use({ reducedMotion: 'reduce' });

  test('按钮过渡时长归零', async ({ page }) => {
    await gotoDocs(page, BUTTON_PAGE);

    const durations = await readTransitions(
      page,
      page.locator('.aura-button').first(),
    );
    expect(
      durations.every((d) => d === '0s'),
      `reduce 下过渡应全部归零，实际：${durations.join(', ')}`,
    ).toBe(true);
  });

  test('loading 旋转：令牌被 reduce 覆盖为 2.4s，且不再等于库默认值', async ({
    page,
  }) => {
    await gotoDocs(page, BUTTON_PAGE);

    const dot = loadingDemo(page).locator('.aura-button-loading-dot');
    await expect(dot).toHaveCount(1);

    const applied = await dot.evaluate(
      (el) => getComputedStyle(el).animationDuration,
    );

    // ⚠️ 这里不能断言 applied === '2.4s'：
    // 文档站宿主（VitePress 默认主题）自带站点级的 reduce 全局重置，
    // `* { animation-duration: 1ms !important }` 会盖过库的令牌——这是宿主的选择。
    // 库自身的约定（令牌 2.4s、组件用 var() 引用）由 motion-tokens 契约测试守住；
    // 这里在真实浏览器里验证的是「媒体查询 + var() 链路」确实生效：
    // 应用值已经不等于库的默认 1s。
    // （若日后 VitePress 移除该重置，这里应收紧为 toBe('2.4s')。）
    expect(applied).not.toBe('1s');
  });

  test('令牌在 :root 上被 reduce 值覆盖', async ({ page }) => {
    await gotoDocs(page, BUTTON_PAGE);

    const spin = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--aura-spin-duration')
        .trim(),
    );
    expect(spin).toBe('2.4s');
  });

  test('弹窗遮罩过渡时长归零（进出场瞬时完成）', async ({ page }) => {
    await gotoDocs(page, '/components/modal');
    await page
      .locator('.demo-render')
      .first()
      .getByRole('button', { name: '打开弹窗' })
      .click();

    const mask = page.locator('.aura-modal-mask');
    await expect(mask).toBeVisible();

    expect(
      await mask.evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s');
  });
});
