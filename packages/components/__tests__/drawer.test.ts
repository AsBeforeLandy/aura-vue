import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Drawer } from '../src/drawer';

// Teleport + 焦点管理组件：必须先卸载再清场（VTU 默认不卸载组件，
// 只清 body 会留下带 document 监听的陈旧实例，跨用例炸雷）
enableAutoUnmount(afterEach);

describe('Drawer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const findMask = () => document.body.querySelector('.aura-drawer-mask');
  // role="dialog" 挂在 wrap 上（与 Modal 同构），panel 是焦点容器
  const findDialog = () =>
    document.body.querySelector<HTMLElement>('.aura-drawer-wrap');
  const findPanel = () =>
    document.body.querySelector<HTMLElement>('.aura-drawer-panel');

  it('正常：受控打开后渲染遮罩与面板，带 dialog 语义', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: false, title: '详情' },
      slots: { default: '<p>抽屉内容</p>' },
    });

    expect(findPanel()).toBeNull();

    await wrapper.setProps({ modelValue: true });

    const dialog = findDialog()!;
    expect(findMask()).not.toBeNull();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.body.textContent).toContain('抽屉内容');
  });

  it('正常：关闭按钮 emit update:modelValue 与 close', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true, title: 'x' },
    });

    await document.body
      .querySelector('.aura-drawer-close')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('正常：默认渲染在右侧（right 修饰类），可切换 bottom', async () => {
    const right = mount(Drawer, { props: { modelValue: true } });
    await right.vm.$nextTick();
    expect(document.body.querySelector('.aura-drawer--right')).not.toBeNull();

    const bottom = mount(Drawer, {
      props: { modelValue: true, placement: 'bottom' },
    });
    await bottom.vm.$nextTick();
    expect(document.body.querySelector('.aura-drawer--bottom')).not.toBeNull();
  });

  it('正常：Esc 关闭（受 closeOnEsc 控制）', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true },
    });
    await wrapper.vm.$nextTick();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('正常：closeOnEsc=false 时不响应 Escape', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true, closeOnEsc: false },
    });
    await wrapper.vm.$nextTick();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('正常：打开时面板被程序化聚焦（焦点接管）', async () => {
    mount(Drawer, { props: { modelValue: true, title: 'x' } });
    await nextTick(); // 焦点接管在 watch 的 nextTick 之后

    expect(document.activeElement).toBe(findPanel());
  });

  it('正常：size 映射为宽度（right）或高度（bottom）', async () => {
    const right = mount(Drawer, {
      props: { modelValue: true, size: 480 },
    });
    await right.vm.$nextTick();
    expect(findPanel()!.getAttribute('style')).toContain('width: 480px');

    document.body.innerHTML = '';

    const bottom = mount(Drawer, {
      props: { modelValue: true, placement: 'bottom', size: 240 },
    });
    await bottom.vm.$nextTick();
    expect(
      document.body
        .querySelector<HTMLElement>('.aura-drawer-panel')!
        .getAttribute('style'),
    ).toContain('height: 240px');
  });

  it('边界：footer 插槽渲染底部动作区', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true },
      slots: { footer: '<button>保存</button>' },
    });
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('.aura-drawer-footer')).not.toBeNull();
  });

  it('边界：无 footer 插槽时不渲染底部区域', async () => {
    const wrapper = mount(Drawer, { props: { modelValue: true } });
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('.aura-drawer-footer')).toBeNull();
  });

  it('边界：点击遮罩默认关闭，closeOnClickMask=false 时不关', async () => {
    const wrapper = mount(Drawer, { props: { modelValue: true } });
    await wrapper.vm.$nextTick();

    findMask()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);

    document.body.innerHTML = '';

    const locked = mount(Drawer, {
      props: { modelValue: true, closeOnClickMask: false },
    });
    await locked.vm.$nextTick();

    document.body
      .querySelector('.aura-drawer-mask')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await locked.vm.$nextTick();
    expect(locked.emitted('update:modelValue')).toBeUndefined();
  });
});
