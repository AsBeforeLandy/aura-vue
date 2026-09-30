import { expect, test } from '@playwright/test';
import { firstDemo, gotoDocs } from './helpers';

/**
 * ProTable —— 真实浏览器渲染验证。
 *
 * 这一页是单元测试覆盖不到的重灾区：
 * happy-dom 没有布局引擎，ElTable 依赖列宽测量，**渲染不出任何 <td>**，
 * 所以单测只能绕道「暴露的 getData()」断言数据层。
 * 这里验证的是真正的 DOM：单元格有没有、内容对不对、列有没有真的排开。
 *
 * 数据契约来自 docs/components/demos/pro-table/basic.vue：
 *   - 46 条内存数据，pageSize: 8（共 6 页），启用 row-selection
 *   - 数据列 4 个：用户名 / 状态 / 金额 / 创建日期
 *   - demo 模拟 260ms 网络延迟
 *
 * ⚠️ 两个容易踩的坑（第一版就写错了）：
 *   1. 开了 row-selection，表格会多出**第 0 列勾选列**（th/td 都无文本），
 *      数据列的下标整体 +1；
 *   2. 分页文案来自文档站主题配置的 EP 中文 locale（「共 46 条」），
 *      断言只匹配 /46/ 这类数字部分，避免与 locale 文案耦合。
 */

const TABLE_PAGE = '/business/pro-table';

test.beforeEach(async ({ page }) => {
  await gotoDocs(page, TABLE_PAGE);
  // 等首批数据落表（demo 模拟了 260ms 网络延迟）
  await expect(
    firstDemo(page).locator('.el-table__body tbody tr').first(),
  ).toBeVisible({ timeout: 10_000 });
});

test.describe('表格真实渲染', () => {
  test('表头含勾选列 + 4 个数据列，列名完整', async ({ page }) => {
    const headers = firstDemo(page).locator('.el-table__header th');

    await expect(headers).toHaveCount(5);
    // 第 0 列是 row-selection 的勾选列，没有文本
    await expect(headers.nth(0)).toHaveText('');
    await expect(headers.filter({ hasText: '用户名' })).toHaveCount(1);
    await expect(headers.filter({ hasText: '状态' })).toHaveCount(1);
    await expect(headers.filter({ hasText: '金额' })).toHaveCount(1);
    await expect(headers.filter({ hasText: '创建日期' })).toHaveCount(1);
  });

  test('数据单元格真的渲染出来（happy-dom 渲不出来的那部分）', async ({
    page,
  }) => {
    const demo = firstDemo(page);
    const rows = demo.locator('.el-table__body tbody tr');

    // demo 配置 pageSize: 8
    await expect(rows).toHaveCount(8);

    // 勾选列 + 4 个数据列
    const firstCells = rows.first().locator('td');
    await expect(firstCells).toHaveCount(5);
    await expect(firstCells.nth(1)).toHaveText(/用户\s*01/);

    // 每个单元格都必须有可绘制的盒子——布局引擎缺席时这里全是 0
    for (let i = 1; i < 5; i += 1) {
      const box = await firstCells.nth(i).boundingBox();
      expect(box, `第 ${i} 列单元格没有渲染出布局尺寸`).not.toBeNull();
      expect(box!.width).toBeGreaterThan(20);
      expect(box!.height).toBeGreaterThan(20);
    }

    // 列真的横向排开了：从左到右 x 坐标必须单调不减
    const xs: number[] = [];
    for (let i = 1; i < 5; i += 1) {
      const box = await firstCells.nth(i).boundingBox();
      xs.push(box!.x);
    }
    const increasing = xs.every((x, i) => i === 0 || x >= xs[i - 1]);
    expect(increasing, `单元格没有按列排开：${xs.join(', ')}`).toBe(true);
  });

  test('金额列按货币格式渲染且右对齐', async ({ page }) => {
    // 第 0 列是勾选列，数据列整体 +1
    const cell = firstDemo(page)
      .locator('.el-table__body tbody tr')
      .first()
      .locator('td')
      .nth(3);

    await expect(cell).toHaveText(/1,200\.00/);

    const align = await cell.evaluate((el) => getComputedStyle(el).textAlign);
    expect(align).toBe('right');
  });

  test('状态列渲染为标签而非原始枚举值', async ({ page }) => {
    const row = firstDemo(page).locator('.el-table__body tbody tr').first();

    await expect(row).toContainText('启用');
    // 原始枚举值不应泄漏到 DOM
    const text = await row.textContent();
    expect(text).not.toContain('active');
  });

  test('列头有真实宽度，最小宽度约定生效', async ({ page }) => {
    // 用户名列 minWidth: 140
    const nameHeader = firstDemo(page)
      .locator('.el-table__header th')
      .filter({ hasText: '用户名' });

    const box = await nameHeader.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(140);
  });
});

test.describe('分页与查询', () => {
  test('分页器显示总数与页数', async ({ page }) => {
    const demo = firstDemo(page);

    // 中文 locale（文档站主题注入），断言只匹配数字避免与文案耦合
    await expect(demo.locator('.el-pagination__total')).toHaveText(/46/);
    // 46 条 / 每页 8 条 = 6 页
    await expect(demo.locator('.el-pager li')).toHaveCount(6);
  });

  test('切换到第二页，数据随之更新', async ({ page }) => {
    const demo = firstDemo(page);
    const firstCell = demo
      .locator('.el-table__body tbody tr')
      .first()
      .locator('td')
      .nth(1);

    await expect(firstCell).toHaveText(/用户\s*01/);

    await demo.locator('.el-pagination .btn-next').click();
    // 翻页会重新发请求（260ms 延迟），第二页首条是 id=9
    await expect(firstCell).toHaveText(/用户\s*09/, { timeout: 10_000 });
  });

  test('关键字查询过滤数据', async ({ page }) => {
    const demo = firstDemo(page);
    const searchInput = demo.locator('.aura-pro-table-search input').first();

    await searchInput.fill('11');
    await demo.locator('.aura-pro-table-search-actions button').first().click();

    // 「11」只匹配到 用户 11
    await expect(
      demo.locator('.el-table__body tbody tr').first().locator('td').nth(1),
    ).toHaveText(/用户\s*11/, { timeout: 10_000 });
    await expect(demo.locator('.el-table__body tbody tr')).toHaveCount(1);
  });
});

test.describe('排序', () => {
  test('点击金额列头触发升序，最小值排到首行', async ({ page }) => {
    const demo = firstDemo(page);
    const moneyHeader = demo
      .locator('.el-table__header th')
      .filter({ hasText: '金额' });

    // 列定义 sortable: true，EP 渲染为可点击的排序头
    await moneyHeader.locator('.caret-wrapper').click();

    // 升序后首行应是最小金额 1200（id=1）
    await expect(
      demo.locator('.el-table__body tbody tr').first().locator('td').nth(3),
    ).toHaveText(/1,200\.00/, { timeout: 10_000 });
  });
});
