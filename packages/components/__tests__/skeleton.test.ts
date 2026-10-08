import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Skeleton } from '../src/skeleton';

describe('Skeleton', () => {
  it('正常：加载态渲染标题条与默认 3 行段落', () => {
    const wrapper = mount(Skeleton);

    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.find('.aura-skeleton-title').exists()).toBe(true);
    expect(wrapper.findAll('.aura-skeleton-row')).toHaveLength(3);
  });

  it('正常：loading=false 渲染插槽真实内容', () => {
    const wrapper = mount(Skeleton, {
      props: { loading: false },
      slots: { default: '<p>真实内容</p>' },
    });

    expect(wrapper.attributes('aria-busy')).toBe('false');
    expect(wrapper.find('.aura-skeleton-row').exists()).toBe(false);
    expect(wrapper.text()).toContain('真实内容');
  });

  it('正常：avatar 显示头像圆', () => {
    const wrapper = mount(Skeleton, { props: { avatar: true } });

    expect(wrapper.find('.aura-skeleton-avatar').exists()).toBe(true);
    expect(wrapper.find('.aura-skeleton-header').exists()).toBe(true);
  });

  it('正常：rows 控制段落条数', () => {
    const wrapper = mount(Skeleton, { props: { rows: 5 } });

    expect(wrapper.findAll('.aura-skeleton-row')).toHaveLength(5);
  });

  it('边界：骨架块对读屏隐藏，aria-busy 才是信息载体', () => {
    const wrapper = mount(Skeleton, { props: { avatar: true } });

    expect(
      wrapper.find('.aura-skeleton-content').attributes('aria-hidden'),
    ).toBe('true');
    expect(
      wrapper.find('.aura-skeleton-header').attributes('aria-hidden'),
    ).toBe('true');
  });

  it('边界：末行带短一截的修饰类', () => {
    const wrapper = mount(Skeleton, { props: { rows: 2 } });
    const rows = wrapper.findAll('.aura-skeleton-row');

    expect(rows[1]!.classes()).toContain('aura-skeleton-row--last');
  });

  it('异常：rows=0 时只有标题条，不渲染段落', () => {
    const wrapper = mount(Skeleton, { props: { rows: 0 } });

    expect(wrapper.findAll('.aura-skeleton-row')).toHaveLength(0);
    expect(wrapper.find('.aura-skeleton-title').exists()).toBe(true);
  });

  it('异常：rows 传负数按 0 处理，不抛错', () => {
    const wrapper = mount(Skeleton, { props: { rows: -2 } });

    expect(wrapper.findAll('.aura-skeleton-row')).toHaveLength(0);
  });
});
