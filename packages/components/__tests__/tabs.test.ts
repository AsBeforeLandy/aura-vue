import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Tabs } from '../src/tabs';

const ITEMS = [
  { label: '基本信息', value: 'base' },
  { label: '安全设置', value: 'security' },
  { label: '高级', value: 'advanced', disabled: true },
];

const mountTabs = (props = {}, slots = {}) =>
  mount(Tabs, { props: { items: ITEMS, ...props }, slots });

describe('Tabs', () => {
  it('正常：渲染 tablist 与全部标签，默认选中第一个可用项', () => {
    const wrapper = mountTabs();

    expect(wrapper.find('[role="tablist"]').exists()).toBe(true);
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]!.attributes('aria-selected')).toBe('true');
  });

  it('正常：点击切换并派发 update:modelValue 与 change（非受控自持）', async () => {
    const wrapper = mountTabs();

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['security']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['security']);
    expect(
      wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected'),
    ).toBe('true');
  });

  it('正常：受控模式下点击只 emit，不自行切换', async () => {
    const wrapper = mountTabs({ modelValue: 'base' });

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['security']);
    expect(
      wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected'),
    ).toBe('true');
  });

  it('正常：具名插槽渲染当前面板，带 tabpanel 语义与双向关联', () => {
    const wrapper = mountTabs(
      {
        modelValue: 'security',
      },
      {
        'panel-security': '安全面板内容',
        'panel-base': '基本面板内容',
      },
    );

    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels).toHaveLength(1);
    expect(panels[0]!.text()).toBe('安全面板内容');

    const activeTab = wrapper.findAll('[role="tab"]')[1]!;
    expect(activeTab.attributes('aria-controls')).toBe(
      panels[0]!.attributes('id'),
    );
    expect(panels[0]!.attributes('aria-labelledby')).toBe(
      activeTab.attributes('id'),
    );
  });

  it('正常：无对应插槽的标签不渲染面板（纯导航用法）', () => {
    const wrapper = mountTabs({ modelValue: 'advanced' });

    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(0);
  });

  it('正常：第一项禁用时默认选中第一个可用项', () => {
    const wrapper = mountTabs({
      items: [
        { label: '禁用', value: 'a', disabled: true },
        { label: '可用', value: 'b' },
      ],
    });

    expect(
      wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected'),
    ).toBe('true');
  });

  it('正常：方向键在可用项之间循环（跳过禁用项）', async () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');

    // 从 base（可用[0]）右移跳过 advanced（禁用），落在 security
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')?.[0]).toEqual(['security']);
  });

  it('边界：roving tabindex——只有选中项可 Tab 到达', () => {
    const wrapper = mountTabs({ modelValue: 'security' });
    const tabs = wrapper.findAll('[role="tab"]');

    expect(tabs[0]!.attributes('tabindex')).toBe('-1');
    expect(tabs[1]!.attributes('tabindex')).toBe('0');
  });

  it('边界：defaultValue 指定非受控初始项', () => {
    const wrapper = mountTabs({ defaultValue: 'security' });

    expect(
      wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected'),
    ).toBe('true');
  });

  it('异常：点击禁用标签不切换、不派发', async () => {
    const wrapper = mountTabs();

    await wrapper.findAll('[role="tab"]')[2]!.trigger('click');

    expect(wrapper.emitted('change')).toBeUndefined();
    expect(
      wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected'),
    ).toBe('true');
  });

  it('异常：items 为空渲染空 tablist，也不抛错', () => {
    const wrapper = mount(Tabs, { props: { items: [] } });

    expect(wrapper.find('[role="tablist"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(0);
  });
});
