import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Divider } from '../src/divider';

describe('Divider - 正常场景', () => {
  it('正常：默认渲染水平分割线，带 separator 语义', () => {
    const wrapper = mount(Divider);

    expect(wrapper.attributes('role')).toBe('separator');
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal');
    expect(wrapper.classes()).toContain('aura-divider');
    expect(wrapper.classes()).toContain('aura-divider--horizontal');
  });

  it('正常：有默认插槽时渲染文字并加 with-text 修饰', () => {
    const wrapper = mount(Divider, { slots: { default: '分段一' } });

    expect(wrapper.classes()).toContain('aura-divider--with-text');
    expect(wrapper.find('.aura-divider-text').text()).toBe('分段一');
  });

  it('正常：dashed 与 orientation 修饰类生效', () => {
    const wrapper = mount(Divider, {
      props: { dashed: true, orientation: 'left' },
      slots: { default: '标题' },
    });

    expect(wrapper.classes()).toContain('aura-divider--dashed');
    expect(wrapper.classes()).toContain('aura-divider--left');
  });
});

describe('Divider - 边界场景', () => {
  it('边界：vertical 时不渲染文字（即使传了插槽）', () => {
    const wrapper = mount(Divider, {
      props: { direction: 'vertical' },
      slots: { default: '不应出现' },
    });

    expect(wrapper.classes()).toContain('aura-divider--vertical');
    expect(wrapper.find('.aura-divider-text').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('不应出现');
  });

  it('边界：无插槽时不渲染文字节点', () => {
    const wrapper = mount(Divider);

    expect(wrapper.find('.aura-divider-text').exists()).toBe(false);
    expect(wrapper.classes()).not.toContain('aura-divider--with-text');
  });

  it('边界：vertical 时 orientation 修饰类不生效', () => {
    const wrapper = mount(Divider, {
      props: { direction: 'vertical', orientation: 'left' },
    });

    expect(wrapper.classes()).not.toContain('aura-divider--left');
  });
});

describe('Divider - 异常场景', () => {
  it('异常：orientation 传非法值不产生垃圾类名，也不抛错', () => {
    const wrapper = mount(Divider, {
      props: { orientation: 'top' as never },
      slots: { default: 'x' },
    });

    expect(wrapper.classes()).not.toContain('aura-divider--top');
    // with-text 由插槽是否存在决定，不受 orientation 合法性影响
    expect(wrapper.classes()).toContain('aura-divider--with-text');
  });

  it('异常：direction 传非法值时退化为普通容器，也不抛错', () => {
    const wrapper = mount(Divider, {
      props: { direction: 'diagonal' as never },
    });

    expect(wrapper.classes()).not.toContain('aura-divider--diagonal');
  });
});
