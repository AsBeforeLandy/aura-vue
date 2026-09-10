import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref, h } from 'vue';
import { Modal } from '../src/modal';

/**
 * Modal 通过 Teleport 渲染到 document.body，DOM 断言用 document.querySelector。
 * 用一个 TestHost 匿名父组件驱动受控显隐，并在 ok/cancel/close 回调中记录标记，
 * 从而验证事件被正确触发（Teleport 出去的节点无法用 wrapper.find/trigger）。
 */
function mountHost(
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {}
) {
  const marks: string[] = [];
  const visible = ref(false);
  const wrapper = mount(
    defineComponent({
      setup() {
        const show = () => {
          visible.value = true;
        };
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
              ...props
            },
            slots
          );
      }
    })
  );
  return {
    wrapper,
    visible,
    marks,
    show: async () => {
      visible.value = true;
      await nextTick();
    }
  };
}

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;

afterEach(() => {
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
      { default: () => '确认删除这条数据吗？' }
    );
    await show();

    expect($('.aura-modal-title')!.textContent).toBe('删除确认');
    expect($('.aura-modal-body')!.textContent).toContain('确认删除这条数据吗？');
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
      'utf-8'
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
