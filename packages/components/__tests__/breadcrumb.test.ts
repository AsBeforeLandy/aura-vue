import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Breadcrumb } from '../src/breadcrumb';

describe('Breadcrumb', () => {
  it('正常：渲染 nav + 有序列表与全部节点', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [
          { label: '首页', to: '/' },
          { label: '订单管理', to: '/orders' },
          { label: '订单详情' },
        ],
      },
    });

    expect(wrapper.find('nav[aria-label="面包屑"]').exists()).toBe(true);
    expect(wrapper.find('ol').exists()).toBe(true);
    expect(wrapper.findAll('li')).toHaveLength(3);
  });

  it('正常：末项是当前页——非链接且带 aria-current="page"', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [{ label: '首页', to: '/' }, { label: '订单详情' }],
      },
    });

    const items = wrapper.findAll('.aura-breadcrumb-item');
    expect(items[0]!.find('a').exists()).toBe(true);
    expect(items[1]!.find('a').exists()).toBe(false);
    expect(
      items[1]!.find('.aura-breadcrumb-current').attributes('aria-current'),
    ).toBe('page');
  });

  it('正常：非末项即使带 to，若它是倒数第二个也渲染链接', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [
          { label: '首页', to: '/' },
          { label: '中间页', to: '/mid' },
          { label: '当前页' },
        ],
      },
    });

    expect(wrapper.findAll('a')).toHaveLength(2);
    expect(wrapper.findAll('a')[1]!.attributes('href')).toBe('/mid');
  });

  it('正常：无 to 的中间项渲染为普通文本（不带 aria-current）', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [
          { label: '首页', to: '/' },
          { label: '占位层' },
          { label: '当前页' },
        ],
      },
    });

    const currents = wrapper.findAll('.aura-breadcrumb-current');
    expect(currents).toHaveLength(2);
    expect(currents[0]!.attributes('aria-current')).toBeUndefined();
    expect(currents[1]!.attributes('aria-current')).toBe('page');
  });

  it('边界：单项面包屑——只有当前页，无链接', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: '首页' }] },
    });

    expect(wrapper.findAll('a')).toHaveLength(0);
    expect(
      wrapper.find('.aura-breadcrumb-current').attributes('aria-current'),
    ).toBe('page');
  });

  it('异常：空 items 渲染空列表，也不抛错', () => {
    const wrapper = mount(Breadcrumb, { props: { items: [] } });

    expect(wrapper.findAll('li')).toHaveLength(0);
    expect(wrapper.find('nav[aria-label="面包屑"]').exists()).toBe(true);
  });
});
