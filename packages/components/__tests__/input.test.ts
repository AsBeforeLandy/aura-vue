import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Input } from '../src/input';

const inputValue = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.find('input').element as HTMLInputElement).value;

describe('Input - 正常场景', () => {
  it('非受控模式：输入更新内部值并 emit update:modelValue / change', async () => {
    const wrapper = mount(Input, { props: { defaultValue: '' } });
    const input = wrapper.find('input');

    await input.setValue('hello');
    expect(inputValue(wrapper)).toBe('hello');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['hello']);
  });

  it('受控模式：外部更新 modelValue 后输入框跟随', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } });

    await wrapper.setProps({ modelValue: 'b' });
    expect(inputValue(wrapper)).toBe('b');
  });
});

describe('Input - 边界场景', () => {
  it('受控模式：外部未更新 modelValue 时显示值保持不变', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } });

    await wrapper.find('input').setValue('b');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
    expect(inputValue(wrapper)).toBe('a');
  });

  it('clearable：有值时展示清空按钮，点击后清空并 emit clear', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'abc', clearable: true } });
    const clearBtn = wrapper.find('.aura-input-clear');

    expect(clearBtn.exists()).toBe(true);
    await clearBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
    expect(wrapper.emitted('clear')).toHaveLength(1);
  });

  it('clearable：无值时不展示清空按钮', () => {
    const wrapper = mount(Input, { props: { modelValue: '', clearable: true } });
    expect(wrapper.find('.aura-input-clear').exists()).toBe(false);
  });
});

describe('Input - 异常场景', () => {
  it('modelValue 与 defaultValue 均缺失时渲染空输入框，不抛错', () => {
    const wrapper = mount(Input);
    expect(inputValue(wrapper)).toBe('');
  });

  it('disabled 时清空按钮不渲染', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'abc', clearable: true, disabled: true }
    });
    expect(wrapper.find('.aura-input-clear').exists()).toBe(false);
  });
});

describe('Input - IME 组合输入（中文输入法）', () => {
  /** 模拟 IME 一次击键：设置 DOM 值后派发 input 事件（setValue 会带 input 事件） */
  const typeRaw = async (wrapper: ReturnType<typeof mount>, text: string) => {
    const input = wrapper.find('input');
    (input.element as HTMLInputElement).value = text;
    await input.trigger('input');
  };

  it('正常场景：compositionend 后提交最终文本', async () => {
    const wrapper = mount(Input, { props: { defaultValue: '' } });
    const input = wrapper.find('input');

    await input.trigger('compositionstart');
    await typeRaw(wrapper, 'zhongwen');
    await input.trigger('compositionend');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['zhongwen']);
    expect(inputValue(wrapper)).toBe('zhongwen');
  });

  it('边界场景：受控模式下合成期间不更新值、不复位 DOM', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } });
    const input = wrapper.find('input');

    await input.trigger('compositionstart');
    await typeRaw(wrapper, 'zhong');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(inputValue(wrapper)).toBe('zhong');

    await input.trigger('compositionend');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['zhong']);
    expect(inputValue(wrapper)).toBe('a');
  });

  it('异常场景：未 start 直接 end（事件乱序）也能正常同步', async () => {
    const wrapper = mount(Input, { props: { defaultValue: '' } });
    const input = wrapper.find('input');

    await typeRaw(wrapper, '中文');
    await input.trigger('compositionend');

    expect(wrapper.emitted('update:modelValue')?.length).toBeGreaterThanOrEqual(1);
  });
});
