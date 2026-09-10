import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Switch } from '../src/switch';

describe('Switch - 正常场景', () => {
  it('非受控模式：点击切换状态并 emit', async () => {
    const wrapper = mount(Switch, { props: { defaultValue: false } });

    expect(wrapper.classes()).not.toContain('aura-switch--on');
    await wrapper.trigger('click');
    expect(wrapper.classes()).toContain('aura-switch--on');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    expect(wrapper.emitted('change')?.[0]).toEqual([true]);
  });

  it('受控模式：外部更新后状态跟随', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false } });

    await wrapper.setProps({ modelValue: true });
    expect(wrapper.classes()).toContain('aura-switch--on');
    expect(wrapper.attributes('aria-checked')).toBe('true');
  });
});

describe('Switch - 边界场景', () => {
  it('disabled 时点击不切换也不 emit', async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: false, disabled: true }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.classes()).toContain('aura-switch--disabled');
  });

  it('开启状态再次点击切回关闭', async () => {
    const wrapper = mount(Switch, { props: { modelValue: true } });

    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});

describe('Switch - 异常场景', () => {
  it('无任何 props 时可正常点击，不抛错', async () => {
    const wrapper = mount(Switch);

    await wrapper.trigger('click');
    expect(wrapper.classes()).toContain('aura-switch--on');
  });
});
