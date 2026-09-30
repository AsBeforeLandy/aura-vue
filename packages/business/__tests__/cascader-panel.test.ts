import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CascaderPanel from '../src/cascader-panel/CascaderPanel.vue';
import type { CascaderOption } from '../src/cascader-panel/types';

const TREE: CascaderOption[] = [
  {
    label: '华东',
    value: 'east',
    children: [
      {
        label: '浙江',
        value: 'zj',
        children: [
          { label: '杭州', value: 'hz' },
          { label: '宁波', value: 'nb' },
        ],
      },
      { label: '江苏', value: 'js' },
    ],
  },
  {
    label: '华南',
    value: 'south',
    children: [{ label: '广东', value: 'gd' }],
  },
];

type Wr = ReturnType<typeof mount>;
type El = ReturnType<Wr['find']>;

/** 通过文本定位选项行 */
function optionRow(wrapper: Wr, text: string): El {
  const row = wrapper
    .findAll('.aura-cascader-panel-option')
    .find((el) => el.text().includes(text));
  expect(row, `应存在包含「${text}」的选项行`).toBeTruthy();
  return row!;
}

/** 选项行内的 checkbox 原生 input */
const checkboxIn = (row: El) => row.find('input');

/** 第 col 列的「全选」checkbox */
const checkAllInput = (wrapper: Wr, col = 0) =>
  wrapper.findAll('.aura-cascader-panel-check-all input')[col];

type EmittedChange = [string[], CascaderOption[]];

const lastValues = (wrapper: ReturnType<typeof mount>): string[] => {
  const emitted = wrapper.emitted('change') ?? [];
  return (emitted.at(-1) as EmittedChange)[0];
};

describe('CascaderPanel', () => {
  // ---- 正常 ----
  it('正常：渲染首列选项与全选', () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    expect(wrapper.text()).toContain('华东');
    expect(wrapper.text()).toContain('华南');
    expect(wrapper.text()).toContain('全选');
  });

  it('正常：点击选项展开下一列并触发 current-click', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    await optionRow(wrapper, '华东').trigger('click');
    expect(wrapper.emitted('current-click')![0][0]).toMatchObject({
      value: 'east',
    });
    expect(wrapper.text()).toContain('浙江');
    expect(wrapper.text()).toContain('江苏');
    // 尚未勾选任何值
    expect(checkboxIn(optionRow(wrapper, '华东')).element.checked).toBe(false);
  });

  it('正常：勾选父级输出最大粒度选项（父级代表整树）', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    await checkboxIn(optionRow(wrapper, '华东')).setValue(true);
    // 原组件语义：change 输出「去重的最大粒度选中项」，
    // 整树选中时由父级代表子孙，避免输出冗余
    expect(lastValues(wrapper)).toEqual(['east']);
  });

  it('正常：部分子级勾选时父级呈半选状态', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    await optionRow(wrapper, '华东').trigger('click');
    await optionRow(wrapper, '浙江').trigger('click');
    await checkboxIn(optionRow(wrapper, '杭州')).setValue(true);
    // 华东与浙江均为半选
    expect(checkboxIn(optionRow(wrapper, '华东')).element.indeterminate).toBe(
      true,
    );
    expect(checkboxIn(optionRow(wrapper, '浙江')).element.indeterminate).toBe(
      true,
    );
  });

  it('正常：受控 modelValue 自动包含子孙值', async () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: TREE, modelValue: ['east'] },
    });
    expect(checkboxIn(optionRow(wrapper, '华东')).element.checked).toBe(true);
    // 展开第二、三级后，子孙格同样呈现选中
    await optionRow(wrapper, '华东').trigger('click');
    await optionRow(wrapper, '浙江').trigger('click');
    expect(checkboxIn(optionRow(wrapper, '浙江')).element.checked).toBe(true);
    expect(checkboxIn(optionRow(wrapper, '杭州')).element.checked).toBe(true);
    expect(checkboxIn(optionRow(wrapper, '江苏')).element.checked).toBe(true);
  });

  it('正常：渲染首列标题', () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: TREE, title: '全部大区' },
    });
    expect(wrapper.text()).toContain('全部大区');
  });

  // ---- 边界 ----
  it('边界：取消一个子级后父级退出选中并转半选', async () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: TREE, modelValue: ['east'] },
    });
    // 展开并取消「杭州」
    await optionRow(wrapper, '华东').trigger('click');
    await optionRow(wrapper, '浙江').trigger('click');
    await checkboxIn(optionRow(wrapper, '杭州')).setValue(false);
    const values = lastValues(wrapper);
    // 半选的父级会被拆解：输出实际勾选的叶子（nb 代表浙江剩余，js 独立叶子）
    expect(values).toEqual(['nb', 'js']);
    expect(checkboxIn(optionRow(wrapper, '华东')).element.indeterminate).toBe(
      true,
    );
    expect(checkboxIn(optionRow(wrapper, '浙江')).element.indeterminate).toBe(
      true,
    );
  });

  it('边界：列首全选输出最大粒度选项，取消则整体清空', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    await checkAllInput(wrapper).setValue(true);
    // 整树选中 → 两个顶级父级代表全部子孙
    expect(lastValues(wrapper)).toEqual(['east', 'south']);
    await checkAllInput(wrapper).setValue(false);
    expect(lastValues(wrapper)).toEqual([]);
  });

  it('边界：空 options 不渲染列', () => {
    const wrapper = mount(CascaderPanel, { props: { options: [] } });
    expect(wrapper.findAll('.aura-cascader-panel-column')).toHaveLength(0);
  });

  it('边界：受控 modelValue 变化时选中态随之刷新', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    await wrapper.setProps({ modelValue: ['south'] });
    expect(checkboxIn(optionRow(wrapper, '华南')).element.checked).toBe(true);
    expect(checkboxIn(optionRow(wrapper, '华东')).element.checked).toBe(false);
  });

  // ---- 异常 ----
  it('异常：未监听 change 时勾选不崩溃', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: TREE } });
    await checkboxIn(optionRow(wrapper, '华东')).setValue(true);
    expect(wrapper.find('.aura-cascader-panel').exists()).toBe(true);
  });

  it('异常：modelValue 为空数组时首列全部未选中', () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: TREE, modelValue: [] },
    });
    expect(checkboxIn(optionRow(wrapper, '华东')).element.checked).toBe(false);
    expect(checkboxIn(optionRow(wrapper, '华南')).element.checked).toBe(false);
  });
});
