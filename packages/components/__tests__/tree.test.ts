import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Tree } from '../src/tree';

const DATA = [
  {
    label: '前端',
    value: 'fe',
    children: [
      { label: '组件库', value: 'ui' },
      {
        label: '工具链',
        value: 'tooling',
        children: [{ label: 'Vite', value: 'vite' }],
      },
    ],
  },
  { label: '后端', value: 'be' },
];

const mountTree = (props = {}) =>
  mount(Tree, { props: { data: DATA, ...props } });

const rows = (wrapper: ReturnType<typeof mountTree>) =>
  wrapper.findAll('.aura-tree-row');

describe('Tree', () => {
  it('正常：渲染 tree 语义与顶层节点，默认全部收起', () => {
    const wrapper = mountTree();

    expect(wrapper.find('[role="tree"]').exists()).toBe(true);
    expect(rows(wrapper)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('组件库');
  });

  it('正常：点击展开 / 收起子级（aria-expanded 跟随）', async () => {
    const wrapper = mountTree();
    const feRow = rows(wrapper)[0]!;
    const item = feRow.element.closest('[role="treeitem"]')!;

    expect(item.getAttribute('aria-expanded')).toBe('false');

    await feRow.trigger('click');
    expect(item.getAttribute('aria-expanded')).toBe('true');
    expect(wrapper.text()).toContain('组件库');

    await feRow.trigger('click');
    expect(item.getAttribute('aria-expanded')).toBe('false');
  });

  it('正常：点击选中并派发 update:modelValue 与 change（非受控自持）', async () => {
    const wrapper = mountTree();

    await rows(wrapper)[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['be']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['be']);
    expect(rows(wrapper)[1]!.classes()).toContain('aura-tree-row--selected');
  });

  it('正常：受控模式——外部 modelValue 决定选中', () => {
    const wrapper = mountTree({ modelValue: 'ui', expandAll: true });

    const selected = rows(wrapper).find((row) =>
      row.classes().includes('aura-tree-row--selected'),
    );
    expect(selected!.text()).toContain('组件库');
  });

  it('正常：expandAll 展开全部层级', () => {
    const wrapper = mountTree({ expandAll: true });

    expect(wrapper.text()).toContain('组件库');
    expect(wrapper.text()).toContain('Vite');
  });

  it('正常：defaultExpandedKeys 指定初始展开', () => {
    const wrapper = mountTree({ defaultExpandedKeys: ['fe'] });

    expect(wrapper.text()).toContain('组件库');
    expect(wrapper.text()).not.toContain('Vite');
  });

  it('正常：节点带 aria-level 层级标注', () => {
    const wrapper = mountTree({ expandAll: true });
    const items = wrapper.findAll('[role="treeitem"]');

    expect(items[0]!.attributes('aria-level')).toBe('1');
    expect(
      items.find((i) => i.text() === 'Vite')!.attributes('aria-level'),
    ).toBe('3');
  });

  it('边界：选中节点再点不重复派发 change', async () => {
    const wrapper = mountTree();

    await rows(wrapper)[1]!.trigger('click');
    await rows(wrapper)[1]!.trigger('click');

    expect(wrapper.emitted('change')).toHaveLength(1);
  });

  it('异常：disabled 节点点击不选中、不派发', async () => {
    const wrapper = mountTree({
      data: [{ label: '锁定', value: 'locked', disabled: true }],
    });

    await rows(wrapper)[0]!.trigger('click');

    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('异常：data 为空渲染空 tree，也不抛错', () => {
    const wrapper = mountTree({ data: [] });

    expect(wrapper.find('[role="tree"]').exists()).toBe(true);
    expect(rows(wrapper)).toHaveLength(0);
  });
});
