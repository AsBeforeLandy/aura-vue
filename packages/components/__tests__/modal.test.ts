import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref, h } from 'vue';
import { Modal } from '../src/modal';

/**
 * Modal 通过 Teleport 渲染到 document.body，DOM 断言用 document.querySelector。
 * 用一个 TestHost 匿名父组件驱动受控显隐，并在 ok/cancel/close 回调中记录标记，
 * 从而验证事件被正确触发（Teleport 出去的节点无法用 wrapper.find/trigger）。
 */
const mountedWrappers: ReturnType<typeof mount>[] = [];

function mountHost(
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {},
) {
  const marks: string[] = [];
  const visible = ref(false);
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            Modal,
            {
              modelValue: visible.value,
              'onUpdate:modelValue': (v: boolean) => {
                visible.value = v;
              },
              onOk: () => marks.push('ok'),
              onCancel: () => marks.push('cancel'),
              onClose: () => marks.push('close'),
              ...props,
            },
            slots,
          );
      },
    }),
  );
  mountedWrappers.push(wrapper);
  return {
    wrapper,
    visible,
    marks,
    show: async () => {
      visible.value = true;
      await nextTick();
    },
  };
}

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;

/**
 * 必须先卸载再清空 body。
 *
 * Teleport 会在 body 里留下锚点（注释节点），Vue 内部持有它的引用。
 * 如果只清 body 不卸载组件，残留实例的锚点会变成游离节点，
 * 下一次挂载就会报 `Cannot read properties of null (reading 'insertBefore')`——
 * 而且报错位置在**下一个**用例里，排查时极易误判。
 */
afterEach(() => {
  for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount();
  document.body.innerHTML = '';
});

describe('Modal - 正常场景', () => {
  it('modelValue=false 时不渲染，true 时渲染到 body', async () => {
    const { show } = mountHost();
    expect($('.aura-modal-panel')).toBeNull();

    await show();
    expect($('.aura-modal-panel')).not.toBeNull();
    expect($('.aura-modal-mask')).not.toBeNull();
  });

  it('渲染标题、默认插槽与底部取消/确定按钮', async () => {
    const { show } = mountHost(
      { title: '删除确认' },
      { default: () => '确认删除这条数据吗？' },
    );
    await show();

    expect($('.aura-modal-title')!.textContent).toBe('删除确认');
    expect($('.aura-modal-body')!.textContent).toContain(
      '确认删除这条数据吗？',
    );
    expect($('.aura-modal-footer')).not.toBeNull();
  });

  it('点击确定触发 ok 并关闭', async () => {
    const { visible, marks, show } = mountHost();
    await show();

    $('.aura-modal-footer .aura-button--primary')!.click();
    await nextTick();

    expect(marks).toContain('ok');
    expect(visible.value).toBe(false);
  });

  it('点击取消触发 cancel 并关闭', async () => {
    const { visible, marks, show } = mountHost();
    await show();

    $('.aura-modal-footer .aura-button:not(.aura-button--primary)')!.click();
    await nextTick();

    expect(marks).toContain('cancel');
    expect(visible.value).toBe(false);
  });
});

describe('Modal - 边界场景', () => {
  it('点击遮罩关闭（默认 closeOnClickMask=true）', async () => {
    const { visible, marks, show } = mountHost();
    await show();

    $('.aura-modal-mask')!.click();
    await nextTick();

    expect(marks).toContain('close');
    expect(visible.value).toBe(false);
  });

  it('closeOnClickMask=false 时点遮罩不关闭', async () => {
    const { visible, marks, show } = mountHost({ closeOnClickMask: false });
    await show();

    $('.aura-modal-mask')!.click();
    await nextTick();

    expect(marks).toEqual([]);
    expect(visible.value).toBe(true);
  });

  it('footer=false 时不渲染底部按钮区', async () => {
    const { show } = mountHost({ footer: false });
    await show();

    expect($('.aura-modal-footer')).toBeNull();
  });

  it('width 为字符串时原样使用', async () => {
    const { show } = mountHost({ width: '80vw' });
    await show();

    expect($('.aura-modal-panel')!.style.width).toBe('80vw');
  });
});

describe('Modal - 异常场景', () => {
  it('无插槽内容时正常渲染空 body，不抛错', async () => {
    const { show } = mountHost();
    await show();

    expect($('.aura-modal-body')!.textContent).toBe('');
  });
});

/**
 * 焦点管理（WAI-ARIA dialog 模式）。
 *
 * 这些用例覆盖的是「键盘用户能否真正用起来」：
 * 打开后焦点要进弹窗、Tab 不能跑到背后页面、关闭后焦点要还回去。
 * 三者缺一，读屏与纯键盘用户就会「卡住」。
 */
describe('Modal - 焦点管理', () => {
  /** 在 body 里放一个用于测量焦点归还的按钮，并聚焦它 */
  function focusOutsideButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = '触发器';
    document.body.appendChild(btn);
    btn.focus();
    return btn;
  }

  /** 派发 Tab 按键并返回事件对象（用于断言是否被 preventDefault） */
  function pressTab(shiftKey = false): KeyboardEvent {
    const evt = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(evt);
    return evt;
  }

  /** 打开弹窗并等待 watch 里的 nextTick 落定 */
  async function openAndSettle(show: () => Promise<void>) {
    await show();
    await nextTick();
  }

  it('正常：打开后焦点落到面板上（读屏会先播报对话框）', async () => {
    const { show } = mountHost({ title: '删除确认' });
    await openAndSettle(show);

    expect(document.activeElement).toBe($('.aura-modal-panel'));
  });

  it('正常：关闭后焦点归还给打开前的元素', async () => {
    const trigger = focusOutsideButton();
    const { show, visible } = mountHost();
    await openAndSettle(show);

    visible.value = false;
    await nextTick();

    expect(document.activeElement).toBe(trigger);
  });

  it('正常：Tab 在最后一个可聚焦元素上时回到第一个（焦点陷阱）', async () => {
    const { show } = mountHost();
    await openAndSettle(show);

    const items = [
      ...document.querySelectorAll<HTMLElement>(
        '.aura-modal-panel button, .aura-modal-panel [tabindex]:not([tabindex="-1"])',
      ),
    ];
    expect(items.length).toBeGreaterThan(1);

    items[items.length - 1].focus();
    const evt = pressTab();

    expect(evt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(items[0]);
  });

  it('正常：Shift+Tab 在第一个可聚焦元素上时跳到最后', async () => {
    const { show } = mountHost();
    await openAndSettle(show);

    const items = [
      ...document.querySelectorAll<HTMLElement>(
        '.aura-modal-panel button, .aura-modal-panel [tabindex]:not([tabindex="-1"])',
      ),
    ];
    items[0].focus();
    const evt = pressTab(true);

    expect(evt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it('边界：焦点在面板本身时，Shift+Tab / Tab 都会被拉回控件序列', async () => {
    const { show } = mountHost();
    await openAndSettle(show);

    const panel = $('.aura-modal-panel')!;
    const items = [
      ...document.querySelectorAll<HTMLElement>(
        '.aura-modal-panel button, .aura-modal-panel [tabindex]:not([tabindex="-1"])',
      ),
    ];

    // 初始焦点就在面板上（打开时的默认行为）
    expect(document.activeElement).toBe(panel);

    // Shift+Tab 应跳到最后一项，而不是逃出弹窗
    //（happy-dom 单测覆盖不到这条，是真浏览器 E2E 抓出来的缺陷）
    let evt = pressTab(true);
    expect(evt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(items[items.length - 1]);

    // 回到面板再正向 Tab，应从第一项开始
    panel.focus();
    evt = pressTab();
    expect(evt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(items[0]);
  });

  it('边界：焦点在弹窗之外时按 Tab 会被拉回弹窗内', async () => {
    const outside = focusOutsideButton();
    const { show } = mountHost();
    await openAndSettle(show);

    // 模拟用户点到页面上再按 Tab
    outside.focus();
    const evt = pressTab();

    expect(evt.defaultPrevented).toBe(true);
    expect($('.aura-modal-panel')!.contains(document.activeElement)).toBe(true);
  });

  it('边界：弹窗内没有可聚焦元素时，Tab 不会把焦点漏到背后页面', async () => {
    const { show } = mountHost();
    await openAndSettle(show);

    // 极端情况：面板内所有控件都不可用（例如请求进行中的只读弹窗）
    document
      .querySelectorAll<HTMLButtonElement>('.aura-modal-panel button')
      .forEach((btn) => btn.setAttribute('disabled', ''));

    const evt = pressTab();

    expect(evt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe($('.aura-modal-panel'));
  });

  it('边界：ESC 关闭弹窗（closeOnEsc 默认 true）', async () => {
    const { visible, marks, show } = mountHost();
    await openAndSettle(show);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await nextTick();

    expect(marks).toContain('close');
    expect(visible.value).toBe(false);
  });

  it('边界：closeOnEsc=false 时 ESC 不关闭', async () => {
    const { visible, marks, show } = mountHost({ closeOnEsc: false });
    await openAndSettle(show);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await nextTick();

    expect(marks).toEqual([]);
    expect(visible.value).toBe(true);
  });

  it('边界：弹窗已关闭时按键不产生副作用', async () => {
    const { marks } = mountHost();
    // 从未打开
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    pressTab();
    await nextTick();

    expect(marks).toEqual([]);
  });
});

describe('Modal - 可访问性标记', () => {
  it('正常：面板带 tabindex="-1" 以支持程序化聚焦', async () => {
    const { show } = mountHost();
    await show();

    expect($('.aura-modal-panel')!.getAttribute('tabindex')).toBe('-1');
  });

  it('正常：对话框用 title 作为无障碍名称', async () => {
    const { show } = mountHost({ title: '编辑资料' });
    await show();

    expect($('.aura-modal-wrap')!.getAttribute('aria-label')).toBe('编辑资料');
  });

  it('边界：未传 title 时不输出空的 aria-label', async () => {
    const { show } = mountHost();
    await show();

    expect($('.aura-modal-wrap')!.hasAttribute('aria-label')).toBe(false);
  });

  it('正常：关闭控件是原生 button（天然可聚焦、可键盘触发）', async () => {
    const { visible, marks, show } = mountHost();
    await show();

    const closeBtn = $('.aura-modal-close');
    expect(closeBtn!.tagName).toBe('BUTTON');
    expect(closeBtn!.getAttribute('type')).toBe('button');
    expect(closeBtn!.getAttribute('aria-label')).toBe('关闭');

    closeBtn!.click();
    await nextTick();

    expect(marks).toContain('close');
    expect(visible.value).toBe(false);
  });
});

/**
 * 动画样式契约（回归防护）：
 *
 * 遮罩与面板是 position: fixed 的子元素，而动画类挂在 position: static 的根节点上。
 * 过渡必须写成 `.aura-modal-enter-active .aura-modal-mask` 这种**后代选择器**；
 * 若误写成 `.aura-modal-enter-active { transition: ... }`（作用在无可见盒子的根节点上），
 * 遮罩会因不参与过渡而瞬间蹦出，表现为"遮罩闪动"。
 *
 * happy-dom 不计算样式表过渡，也无法观察到 Transition 类名的帧级变化，
 * 因此这里直接读取 Less 源码断言选择器契约。
 */
describe('Modal - 动画样式契约', () => {
  it('过渡作用于 mask / panel 子元素，而非无盒子的根节点', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, resolve } = await import('node:path');

    const here = dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(
      resolve(here, '../src/modal/style/index.less'),
      'utf-8',
    );

    // 遮罩与面板各自参与过渡
    expect(css).toMatch(/\.aura-modal-enter-active\s+\.aura-modal-mask/);
    expect(css).toMatch(/\.aura-modal-enter-active\s+\.aura-modal-panel/);
    // 初始态必须包含透明/缩放，否则没有动画起止差
    expect(css).toMatch(/\.aura-modal-enter-from\s+\.aura-modal-mask/);
    expect(css).toMatch(/\.aura-modal-enter-from\s+\.aura-modal-panel/);

    // 反例：过渡不得直接作用在根节点（根节点无可见盒子，会让遮罩瞬间蹦出）
    expect(css).not.toMatch(/\.aura-modal-enter-active\s*[,{]/);
  });
});
