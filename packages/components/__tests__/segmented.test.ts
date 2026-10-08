import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Segmented } from '../src/segmented';

const OPTIONS = ['日', '周', '月'];

const mountSegmented = (props = {}, slots = {}) =>
  mount(Segmented, { props: { options: OPTIONS, ...props }, slots });

describe('Segmented', () => {
  it('正常：渲染 radiogroup 与全部选项，默认选中第一项', () => {
    const wrapper = mountSegmented();

    expect(wrapper.attributes('role')).toBe('radiogroup');
    const radios = wrapper.findAll('[role="radio"]');
    expect(radios).toHaveLength(3);
    expect(radios[0]!.attributes('aria-checked')).toBe('true');
    expect(radios[1]!.attributes('aria-checked')).toBe('false');
  });

  it('正常：字符串选项与对象选项等价', () => {
    const wrapper = mount(Segmented, {
      props: {
        options: [
          { label: '按日', value: 'day' },
          { label: '按月', value: 'month' },
        ],
      },
    });

    const radios = wrapper.findAll('[role="radio"]');
    expect(radios[0]!.text()).toBe('按日');
    expect(radios[0]!.attributes('aria-checked')).toBe('true');
  });

  it('正常：点击选中并 emit update:modelValue 与 change（非受控自持）', async () => {
    const wrapper = mountSegmented();

    await wrapper.findAll('[role="radio"]')[2]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['月']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['月']);
    expect(
      wrapper.findAll('[role="radio"]')[2]!.attributes('aria-checked'),
    ).toBe('true');
  });

  it('正常：受控模式下点击只 emit，不自行选中', async () => {
    const wrapper = mountSegmented({ modelValue: '日' });

    await wrapper.findAll('[role="radio"]')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['周']);
    expect(
      wrapper.findAll('[role="radio"]')[0]!.attributes('aria-checked'),
    ).toBe('true');
  });

  it('正常：外部更新 modelValue 后选中跟随', async () => {
    const wrapper = mountSegmented({ modelValue: '日' });

    await wrapper.setProps({ modelValue: '月' });

    expect(
      wrapper.findAll('[role="radio"]')[2]!.attributes('aria-checked'),
    ).toBe('true');
  });

  it('正常：方向键循环切换（roving tabindex）', async () => {
    const wrapper = mountSegmented();
    const radios = wrapper.findAll('[role="radio"]');

    await radios[0]!.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')?.[0]).toEqual(['周']);

    await wrapper.setProps({ modelValue: '日' });
    await radios[0]!.trigger('keydown', { key: 'ArrowLeft' });
    // 从第一项向左循环到最后一项
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['月']);
  });

  it('正常：只有选中项可 Tab 到达（tabindex 漫游）', () => {
    const wrapper = mountSegmented();
    const radios = wrapper.findAll('[role="radio"]');

    expect(radios[0]!.attributes('tabindex')).toBe('0');
    expect(radios[1]!.attributes('tabindex')).toBe('-1');
  });

  it('边界：点击已选中项不重复 emit', async () => {
    const wrapper = mountSegmented();

    await wrapper.findAll('[role="radio"]')[0]!.trigger('click');

    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('边界：defaultValue 指定非受控初始选中项', () => {
    const wrapper = mountSegmented({ defaultValue: '月' });

    expect(
      wrapper.findAll('[role="radio"]')[2]!.attributes('aria-checked'),
    ).toBe('true');
  });

  it('异常：disabled 时不响应点击与方向键', async () => {
    const wrapper = mountSegmented({ disabled: true });

    await wrapper.findAll('[role="radio"]')[1]!.trigger('click');
    await wrapper.findAll('[role="radio"]')[0]!.trigger('keydown', {
      key: 'ArrowRight',
    });

    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.classes()).toContain('aura-segmented--disabled');
  });

  it('异常：options 传非法值不抛错', () => {
    const wrapper = mount(Segmented, {
      props: { options: [1, 2] as never },
    });

    // 数字选项被 String 化处理或忽略，组件不崩溃
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true);
  });
});
