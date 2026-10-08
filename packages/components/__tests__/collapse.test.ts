import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Collapse, CollapseItem } from '../src/collapse';

const mountCollapse = (props = {}, slots = {}, global = {}) =>
  mount(Collapse, {
    props,
    slots: {
      default: `
        <CollapseItem title="第一项" value="a">内容 A</CollapseItem>
        <CollapseItem title="第二项" value="b">内容 B</CollapseItem>
        <CollapseItem title="禁用项" value="c" disabled>内容 C</CollapseItem>
      `,
      ...slots,
    },
    global: { components: { CollapseItem }, ...global },
  });

describe('Collapse / CollapseItem', () => {
  it('正常：默认全部收起，标题可访问（button + aria-expanded）', () => {
    const wrapper = mountCollapse();

    const headers = wrapper.findAll('.aura-collapse-header');
    expect(headers).toHaveLength(3);
    expect(headers[0]!.element.tagName).toBe('BUTTON');
    expect(headers[0]!.attributes('aria-expanded')).toBe('false');
  });

  it('正常：点击展开，再点收起，并派发 v-model 事件', async () => {
    const wrapper = mountCollapse();
    const first = wrapper.findAll('.aura-collapse-header')[0]!;

    await first.trigger('click');
    expect(first.attributes('aria-expanded')).toBe('true');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']]);

    await first.trigger('click');
    expect(first.attributes('aria-expanded')).toBe('false');
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]]);
  });

  it('正常：受控模式——外部传入 modelValue 决定展开', () => {
    const wrapper = mountCollapse({ modelValue: ['b'] });

    const headers = wrapper.findAll('.aura-collapse-header');
    expect(headers[0]!.attributes('aria-expanded')).toBe('false');
    expect(headers[1]!.attributes('aria-expanded')).toBe('true');
  });

  it('正常：面板带 region 语义并与标题双向关联', async () => {
    const wrapper = mountCollapse({ defaultValue: ['a'] });

    const header = wrapper.findAll('.aura-collapse-header')[0]!;
    const panel = wrapper.find('.aura-collapse-content');

    expect(panel.attributes('role')).toBe('region');
    expect(panel.attributes('id')).toBe(header.attributes('aria-controls'));
    expect(panel.attributes('aria-labelledby')).toBe(header.attributes('id'));
    expect(panel.text()).toContain('内容 A');
  });

  it('正常：accordion 手风琴——同时最多展开一项', async () => {
    const wrapper = mountCollapse({ accordion: true, defaultValue: ['a'] });
    const headers = wrapper.findAll('.aura-collapse-header');

    await headers[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']]);
    expect(
      wrapper.findAll('.aura-collapse-header')[0]!.attributes('aria-expanded'),
    ).toBe('false');
  });

  it('正常：defaultValue 指定初始展开集合', () => {
    const wrapper = mountCollapse({ defaultValue: ['a', 'b'] });

    // 只断言两个可用项；禁用项不可展开，永远 aria-expanded=false
    const headers = wrapper.findAll('.aura-collapse-header').slice(0, 2);
    expect(headers.every((h) => h.attributes('aria-expanded') === 'true')).toBe(
      true,
    );
  });

  it('边界：内容收起时保持挂载（v-show），状态不丢失', async () => {
    const wrapper = mountCollapse();
    // ⚠️ 不用 isVisible()：happy-dom 的 checkVisibility 是恒真桩实现，
    // v-show 的 inline display:none 会误报为可见，直接断言 style 更可靠；
    // 每次点击前重新查询，避免复用渲染后可能失效的 DOMWrapper
    const hidden = () =>
      Boolean(
        wrapper
          .find('.aura-collapse-content')
          .attributes('style')
          ?.includes('display: none'),
      );

    await wrapper.findAll('.aura-collapse-header')[0]!.trigger('click');
    expect(hidden()).toBe(false);

    await wrapper.findAll('.aura-collapse-header')[0]!.trigger('click');
    expect(wrapper.find('.aura-collapse-content').exists()).toBe(true);
    expect(hidden()).toBe(true);
  });

  it('边界：内容通过插槽自定义标题', () => {
    const wrapper = mountCollapse(
      {},
      {
        default: `<CollapseItem value="x"><template #title><b>插槽标题</b></template>内容</CollapseItem>`,
      },
    );

    expect(wrapper.find('.aura-collapse-title').text()).toBe('插槽标题');
  });

  it('异常：disabled 项点击不展开、不派发', async () => {
    const wrapper = mountCollapse();
    const disabled = wrapper.findAll('.aura-collapse-header')[2]!;

    await disabled.trigger('click');

    expect(disabled.attributes('aria-expanded')).toBe('false');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
