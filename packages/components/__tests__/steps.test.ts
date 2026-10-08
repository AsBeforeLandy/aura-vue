import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Steps } from '../src/steps';

const ITEMS = [
  { title: '填写信息', description: '基本信息' },
  { title: '确认订单' },
  { title: '完成' },
];

describe('Steps', () => {
  it('正常：渲染有序列表与全部步骤', () => {
    const wrapper = mount(Steps, { props: { items: ITEMS, current: 1 } });

    expect(wrapper.element.tagName).toBe('OL');
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(3);
    expect(items[1]!.text()).toContain('确认订单');
  });

  it('正常：状态推断（完成 / 进行中 / 等待）', () => {
    const wrapper = mount(Steps, { props: { items: ITEMS, current: 1 } });
    const items = wrapper.findAll('li');

    expect(items[0]!.classes()).toContain('aura-steps-item--finish');
    expect(items[1]!.classes()).toContain('aura-steps-item--process');
    expect(items[2]!.classes()).toContain('aura-steps-item--wait');
    // 已完成项圆圈是对勾，未完成项是序号
    expect(items[0]!.find('svg').exists()).toBe(true);
    expect(items[2]!.find('svg').exists()).toBe(false);
  });

  it('正常：当前项带 aria-current="step" 语义', () => {
    const wrapper = mount(Steps, { props: { items: ITEMS, current: 1 } });

    expect(wrapper.findAll('li')[1]!.attributes('aria-current')).toBe('step');
    expect(
      wrapper.findAll('li')[0]!.attributes('aria-current'),
    ).toBeUndefined();
  });

  it('正常：status=error 时当前步骤标错', () => {
    const wrapper = mount(Steps, {
      props: { items: ITEMS, current: 1, status: 'error' },
    });

    expect(wrapper.findAll('li')[1]!.classes()).toContain(
      'aura-steps-item--error',
    );
  });

  it('正常：description 可选渲染', () => {
    const wrapper = mount(Steps, { props: { items: ITEMS, current: 0 } });

    expect(wrapper.findAll('.aura-steps-desc')).toHaveLength(1);
  });

  it('边界：最后一项不画连接线', () => {
    const wrapper = mount(Steps, { props: { items: ITEMS, current: 0 } });

    expect(wrapper.findAll('li')[2]!.classes()).toContain(
      'aura-steps-item--last',
    );
  });

  it('边界：current 越界时钳位推断（-1 全部等待，length 全部完成）', () => {
    const notStarted = mount(Steps, { props: { items: ITEMS, current: -1 } });
    const allDone = mount(Steps, { props: { items: ITEMS, current: 99 } });

    expect(
      notStarted
        .findAll('li')
        .every((li) => li.classes().includes('aura-steps-item--wait')),
    ).toBe(true);
    expect(
      allDone
        .findAll('li')
        .every((li) => li.classes().includes('aura-steps-item--finish')),
    ).toBe(true);
  });

  it('异常：空 items 渲染空列表，也不抛错', () => {
    const wrapper = mount(Steps, { props: { items: [] } });

    expect(wrapper.findAll('li')).toHaveLength(0);
  });
});
