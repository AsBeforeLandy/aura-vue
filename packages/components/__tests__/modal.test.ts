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
