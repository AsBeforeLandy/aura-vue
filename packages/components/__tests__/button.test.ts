import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Button } from '../src/button';

describe('Button - 正常场景', () => {
  it('渲染插槽文本，点击触发 click 事件', async () => {
    const wrapper = mount(Button, { slots: { default: '确定' } });

    expect(wrapper.text()).toBe('确定');
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('loading 时展示加载图标', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.find('.aura-button-loading-dot').exists()).toBe(true);
  });
});

describe('Button - 边界场景', () => {
  it('disabled 时点击不触发 click，且带禁用类', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'X' }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.classes()).toContain('aura-button--disabled');
  });

  it('loading 时同样阻断点击', async () => {
    const wrapper = mount(Button, { props: { loading: true } });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('type / size / block 生成对应修饰类', () => {
    const wrapper = mount(Button, {
      props: { type: 'primary', size: 'large', block: true }
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'aura-button--primary',
        'aura-button--large',
        'aura-button--block'
      ])
    );
  });

  it('默认 type=default / size=middle 不生成修饰类', () => {
    const wrapper = mount(Button);
    expect(wrapper.classes()).toEqual(['aura-button']);
  });
});

describe('Button - 异常场景', () => {
  it('无插槽内容时不崩溃，仍渲染 button 元素', () => {
    const wrapper = mount(Button);
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toBe('');
  });

  it('传入非法 type 仅表现为无对应样式类，不抛错', () => {
    const wrapper = mount(Button, {
      props: { type: 'unknown' as never }
    });
    expect(wrapper.classes()).toContain('aura-button');
    expect(wrapper.classes()).not.toContain('aura-button--unknown');
  });
});
