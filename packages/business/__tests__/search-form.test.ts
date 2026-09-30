import { describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';
import SearchForm from '../src/search-form/SearchForm.vue';
import type { SearchField } from '../src/search-form/types';

const fields: SearchField[] = [
  { name: 'keyword', label: '关键词', type: 'input' },
  { name: 'status', label: '状态', type: 'select' },
  { name: 'age', label: '年龄', type: 'number' },
  { name: 'createdAt', label: '创建日期', type: 'date' },
];

/** 按按钮文案查找（EP Button 不像 antd 会在汉字间插空格，可直接匹配） */
function findButton(wrapper: ReturnType<typeof mount>, text: string) {
  const button = wrapper.findAll('button').find((b) => b.text() === text);
  expect(button, `应存在「${text}」按钮`).toBeTruthy();
  return button!;
}

describe('SearchForm', () => {
  // ---- 正常 ----
  it('正常：渲染「查询」「重置」按钮与全部字段标签', () => {
    const wrapper = mount(SearchForm, { props: { fields } });
    expect(findButton(wrapper, '查询')).toBeTruthy();
    expect(findButton(wrapper, '重置')).toBeTruthy();
    expect(wrapper.text()).toContain('关键词');
    expect(wrapper.text()).toContain('状态');
  });

  it('正常：输入后点击查询触发 search 并携带表单值', async () => {
    const wrapper = mount(SearchForm, { props: { fields } });
    await wrapper.find('input').setValue('手机');
    await findButton(wrapper, '查询').trigger('click');
    await flushPromises();
    const emitted = wrapper.emitted('search');
    expect(emitted).toHaveLength(1);
    expect(emitted![0][0]).toMatchObject({ keyword: '手机' });
  });

  it('正常：initialValues 作为查询值一并抛出', async () => {
    const wrapper = mount(SearchForm, {
      props: { fields, initialValues: { keyword: '预设' } },
    });
    expect(wrapper.find('input').element as HTMLInputElement).toBeTruthy();
    await findButton(wrapper, '查询').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('search')![0][0]).toMatchObject({ keyword: '预设' });
  });

  it('正常：点击重置触发 reset，且值回到初始值', async () => {
    const wrapper = mount(SearchForm, {
      props: { fields, initialValues: { keyword: '预设' } },
    });
    await wrapper.find('input').setValue('改过了');
    await findButton(wrapper, '重置').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('reset')).toHaveLength(1);
    expect(
      (wrapper.find('input').element as HTMLInputElement).value === '预设',
    ).toBe(true);
  });

  it('正常：自定义按钮文案生效', () => {
    const wrapper = mount(SearchForm, {
      props: { fields, submitText: '搜索', resetText: '清空' },
    });
    expect(findButton(wrapper, '搜索')).toBeTruthy();
    expect(findButton(wrapper, '清空')).toBeTruthy();
  });

  // ---- 边界 ----
  it('边界：字段数超过 collapseAfter 时显示「展开」，折叠时隐藏多余字段', async () => {
    const wrapper = mount(SearchForm, {
      props: { fields, collapseAfter: 2 },
    });
    expect(wrapper.text()).not.toContain('创建日期');
    await findButton(wrapper, '展开').trigger('click');
    expect(wrapper.text()).toContain('创建日期');
    expect(findButton(wrapper, '收起')).toBeTruthy();
  });

  it('边界：字段数未超过 collapseAfter 时不显示展开按钮', () => {
    const wrapper = mount(SearchForm, {
      props: { fields: fields.slice(0, 2), collapseAfter: 3 },
    });
    expect(wrapper.findAll('button').some((b) => b.text() === '展开')).toBe(
      false,
    );
  });

  it('边界：defaultCollapsed=false 时默认展开全部字段', () => {
    const wrapper = mount(SearchForm, {
      props: { fields, collapseAfter: 2, defaultCollapsed: false },
    });
    expect(wrapper.text()).toContain('创建日期');
    expect(wrapper.findAll('button').some((b) => b.text() === '展开')).toBe(
      false,
    );
  });

  it('边界：custom 类型走 render 自定义渲染', () => {
    const wrapper = mount(SearchForm, {
      props: {
        fields: [
          {
            name: 'custom',
            label: '自定义',
            type: 'custom',
            render: () => h('span', { class: 'custom-node' }, 'custom'),
          },
        ],
      },
    });
    expect(wrapper.find('.custom-node').exists()).toBe(true);
  });

  it('边界：select 字段渲染选项（选项组件实例随挂载注册）', () => {
    const wrapper = mount(SearchForm, {
      props: {
        fields: [
          {
            name: 'status',
            label: '状态',
            type: 'select',
            options: [
              { label: '启用', value: 'active' },
              { label: '禁用', value: 'disabled' },
            ],
          },
        ],
      },
    });
    // EP 的选项渲染在 teleport 弹层内且懒挂载，DOM 查询拿不到，
    // 改断言 ElOption 组件实例
    const options = wrapper.findAllComponents({ name: 'ElOption' });
    expect(options).toHaveLength(2);
    expect(options[0].props('label')).toBe('启用');
    expect(options[1].props('value')).toBe('disabled');
  });

  // ---- 异常 ----
  it('异常：fields 为空数组时不崩溃', () => {
    const wrapper = mount(SearchForm, { props: { fields: [] } });
    expect(wrapper.find('.aura-search-form').exists()).toBe(true);
  });

  it('异常：未监听 search / reset 时点击按钮不崩溃', async () => {
    const wrapper = mount(SearchForm, { props: { fields } });
    await findButton(wrapper, '查询').trigger('click');
    await flushPromises();
    await findButton(wrapper, '重置').trigger('click');
    await flushPromises();
    expect(wrapper.find('.aura-search-form').exists()).toBe(true);
  });

  it('异常：loading 态下查询按钮进入加载', () => {
    const wrapper = mount(SearchForm, { props: { fields, loading: true } });
    expect(findButton(wrapper, '查询').classes().includes('is-loading')).toBe(
      true,
    );
  });
});
