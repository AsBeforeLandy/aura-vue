import { expect, test } from '@playwright/test';
import { firstDemo, gotoDocs, openModal } from './helpers';

/**
 * Modal 焦点管理 —— 真实浏览器验证。
 *
 * 这些用例在 happy-dom 里写不出来：
 *   - `focus()` 是否真的改变 document.activeElement，取决于元素的可聚焦性计算；
 *   - Tab 的默认行为（浏览器把焦点移到下一个可聚焦元素）需要真实的焦点系统；
 *   - focus trap 的边界（最后一个元素 Tab 之后会跑到哪）在假 DOM 里没有意义。
 *
 * ⚠️ 作用域提醒：每个 demo 外面包着 `<Demo>`，里面除预览区还有「查看代码」按钮，
 * 因此触发控件要在 `.demo-render` 里找；而弹窗是 Teleport 到 body 的，要在全局找。
 */

const MODAL_PAGE = '/components/modal';

/** 打开「基础用法」的弹窗 */
async function openBasic(page: import('@playwright/test').Page) {
  await gotoDocs(page, MODAL_PAGE);
  const trigger = firstDemo(page).getByRole('button', { name: '打开弹窗' });
  return openModal(page, trigger);
}

test.describe('Modal 焦点管理', () => {
  test('打开后焦点落在对话框面板上', async ({ page }) => {
    await openBasic(page);

    // 面板带 tabindex="-1"，是它接住了初始焦点
    await expect(page.locator('.aura-modal-panel')).toBeFocused();
  });

  test('Tab 焦点陷阱：反复 Tab 始终不离开对话框', async ({ page }) => {
    await openBasic(page);

    const wrap = page.locator('.aura-modal-wrap');

    // 弹窗内只有 3 个可聚焦元素（关闭 / 取消 / 确定），
    // 因此连续按 10 次必然会触发多轮循环——只要有一次跑出去就会失败
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const active = document.activeElement;
        const dialog = document.querySelector('.aura-modal-wrap');
        return Boolean(active && dialog && dialog.contains(active));
      });
      expect(inside, `第 ${i + 1} 次 Tab 之后焦点跑出了对话框`).toBe(true);
    }

    await expect(wrap).toBeVisible();
  });

  test('Shift+Tab 反向循环同样不会离开对话框', async ({ page }) => {
    await openBasic(page);

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Shift+Tab');
      const inside = await page.evaluate(() => {
        const active = document.activeElement;
        const dialog = document.querySelector('.aura-modal-wrap');
        return Boolean(active && dialog && dialog.contains(active));
      });
      expect(inside, `第 ${i + 1} 次 Shift+Tab 之后焦点跑出了对话框`).toBe(
        true,
      );
    }
  });

  test('关闭控件可被键盘触达（原生 button）', async ({ page }) => {
    await openBasic(page);

    const closeBtn = page.locator('.aura-modal-close');
    // 原生 button，因此可聚焦
    await expect(closeBtn).toHaveJSProperty('tagName', 'BUTTON');
    await closeBtn.focus();
    await expect(closeBtn).toBeFocused();
  });

  test('Esc 关闭弹窗并把焦点归还给触发按钮', async ({ page }) => {
    const trigger = await openBasic(page);

    await page.keyboard.press('Escape');

    await expect(page.locator('.aura-modal-panel')).toHaveCount(0);
    // 焦点必须回到触发它的按钮上，否则键盘用户会「掉」在页首
    await expect(trigger).toBeFocused();
  });

  test('点关闭按钮后焦点同样归还', async ({ page }) => {
    const trigger = await openBasic(page);

    await page.locator('.aura-modal-close').click();

    await expect(page.locator('.aura-modal-panel')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe('Modal 无障碍语义', () => {
  test('对话框角色、aria-modal 与可访问名称齐备', async ({ page }) => {
    await openBasic(page);

    // 用 role + name 定位，等于顺带验证了两者都被无障碍树正确识别
    const dialog = page.getByRole('dialog', { name: '提示' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('默认页脚按钮可通过名称定位（语义按钮而非裸 div）', async ({ page }) => {
    await openBasic(page);

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: '确定' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: '取消' })).toBeVisible();
    // 关闭控件靠 aria-label 暴露名称
    await expect(dialog.getByRole('button', { name: '关闭' })).toBeVisible();
  });
});

test.describe('Modal 渲染稳定性', () => {
  test('Teleport 到 body，且不受父级 overflow 影响', async ({ page }) => {
    await openBasic(page);

    const isDirectChildOfBody = await page.evaluate(() => {
      const panel = document.querySelector('.aura-modal-panel');
      if (!panel) return false;
      // 一路向上找到 body，中间不应经过任何 .demo 容器
      let node: HTMLElement | null = panel;
      while (node && node !== document.body) {
        if (node.classList?.contains('demo')) return false;
        node = node.parentElement;
      }
      return node === document.body;
    });

    expect(isDirectChildOfBody).toBe(true);
  });

  test('面板在视口内水平居中', async ({ page }) => {
    await openBasic(page);

    const box = await page.locator('.aura-modal-panel').boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();

    const panelCenter = box!.x + box!.width / 2;
    const viewportCenter = viewport!.width / 2;
    // 允许 1px 的亚像素误差
    expect(Math.abs(panelCenter - viewportCenter)).toBeLessThanOrEqual(1);

    // 宽度应为默认的 520px，且不超出视口
    expect(box!.width).toBeLessThanOrEqual(520);
    expect(box!.x).toBeGreaterThanOrEqual(0);
  });
});
