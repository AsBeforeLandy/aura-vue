import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Empty } from '../src/empty';

describe('Empty', () => {
  it('正常：无 description 时使用默认文案「暂无数据」', () => {
    const wrapper = mount(Empty);

    expect(wrapper.classes()).toContain('aura-empty');
    expect(wrapper.find('.aura-empty-description').text()).toBe('暂无数据');
    expect(wrapper.find('.aura-empty-image svg').exists()).toBe(true);
  });

  it('正常：description 属性渲染自定义文案', () => {
    const wrapper = mount(Empty, { props: { description: '没有搜索结果' } });

    expect(wrapper.find('.aura-empty-description').text()).toBe('没有搜索结果');
  });

  it('正常：description 插槽优先于属性', () => {
    const wrapper = mount(Empty, {
      props: { description: '属性文案' },
      slots: { description: '插槽文案' },
    });

    expect(wrapper.find('.aura-empty-description').text()).toBe('插槽文案');
  });

  it('正常：默认插槽渲染动作区（如「新建」按钮）', () => {
    const wrapper = mount(Empty, {
      slots: { default: '<button>新建项目</button>' },
    });

    expect(wrapper.find('.aura-empty-footer').exists()).toBe(true);
    expect(wrapper.find('.aura-empty-footer button').text()).toBe('新建项目');
  });

  it('边界：占位图对读屏隐藏，语义由描述文字承载', () => {
    const wrapper = mount(Empty);

    expect(wrapper.find('.aura-empty-image').attributes('aria-hidden')).toBe(
      'true',
    );
  });

  it('边界：无默认插槽时不渲染动作区', () => {
    const wrapper = mount(Empty);

    expect(wrapper.find('.aura-empty-footer').exists()).toBe(false);
  });

  it('异常：description 传空字符串时仍回落到默认文案', () => {
    const wrapper = mount(Empty, { props: { description: '' } });

    expect(wrapper.find('.aura-empty-description').text()).toBe('暂无数据');
  });
});
