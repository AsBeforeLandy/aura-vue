import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Spin } from '../src/spin';

describe('Spin', () => {
  it('正常：默认渲染 middle 尺寸的加载指示器', () => {
    const wrapper = mount(Spin);

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-live')).toBe('polite');
    expect(wrapper.classes()).toContain('aura-spin--middle');
    expect(wrapper.find('.aura-spin-indicator').exists()).toBe(true);
  });

  it('正常：tip 属性渲染文案', () => {
    const wrapper = mount(Spin, { props: { tip: '数据加载中' } });

    expect(wrapper.find('.aura-spin-tip').text()).toBe('数据加载中');
  });

  it('正常：tip 插槽优先于 tip 属性', () => {
    const wrapper = mount(Spin, {
      props: { tip: '属性文案' },
      slots: { tip: '插槽文案' },
    });

    expect(wrapper.find('.aura-spin-tip').text()).toBe('插槽文案');
  });

  it('正常：size 三档修饰类生效', () => {
    for (const size of ['small', 'middle', 'large'] as const) {
      const wrapper = mount(Spin, { props: { size } });
      expect(wrapper.classes()).toContain(`aura-spin--${size}`);
    }
  });

  it('边界：无 tip 属性也无插槽时不渲染文案节点', () => {
    const wrapper = mount(Spin);

    expect(wrapper.find('.aura-spin-tip').exists()).toBe(false);
  });

  it('边界：指示器对读屏隐藏，信息只由文案承载', () => {
    const wrapper = mount(Spin, { props: { tip: '加载中' } });

    expect(wrapper.find('.aura-spin-indicator').attributes('aria-hidden')).toBe(
      'true',
    );
  });

  it('异常：spinning=false 时不渲染任何内容', () => {
    const wrapper = mount(Spin, { props: { spinning: false, tip: 'x' } });

    expect(wrapper.find('.aura-spin').exists()).toBe(false);
    expect(wrapper.element.nodeType).toBe(8); // 注释节点
  });

  it('异常：size 传非法值不产生垃圾类名，也不抛错', () => {
    const wrapper = mount(Spin, { props: { size: 'huge' as never } });

    expect(wrapper.classes()).not.toContain('aura-spin--size-huge');
  });
});
