import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Alert } from '../src/alert';

describe('Alert', () => {
  it('正常：默认渲染中性提示，带 alert 语义', () => {
    const wrapper = mount(Alert, {
      props: { title: '注意' },
      slots: { default: '这里是说明' },
    });

    expect(wrapper.attributes('role')).toBe('alert');
    expect(wrapper.classes()).toContain('aura-alert');
    expect(wrapper.classes()).toContain('aura-alert--info');
    expect(wrapper.find('.aura-alert-title').text()).toBe('注意');
    expect(wrapper.find('.aura-alert-desc').text()).toBe('这里是说明');
  });

  it('正常：type 修饰类生效', () => {
    const wrapper = mount(Alert, { props: { type: 'success', title: '成功' } });

    expect(wrapper.classes()).toContain('aura-alert--success');
  });

  it('正常：showIcon 渲染装饰性图标（svg 对读屏隐藏）', () => {
    const wrapper = mount(Alert, {
      props: { type: 'warning', showIcon: true, title: '警告' },
    });

    expect(wrapper.classes()).toContain('aura-alert--show-icon');
    const icon = wrapper.find('.aura-alert-icon');
    expect(icon.attributes('aria-hidden')).toBe('true');
    expect(icon.find('svg').exists()).toBe(true);
  });

  it('正常：closable 渲染原生关闭按钮；非受控点关闭后隐藏并 emit', async () => {
    const wrapper = mount(Alert, {
      props: { closable: true, title: '可关闭' },
    });
    const close = wrapper.find('.aura-alert-close');

    expect(close.element.tagName).toBe('BUTTON');
    expect(close.attributes('aria-label')).toBe('关闭');

    await close.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    expect(wrapper.find('.aura-alert').exists()).toBe(false);
  });

  it('边界：受控模式下点关闭只 emit，不自行消失', async () => {
    const wrapper = mount(Alert, {
      props: { closable: true, visible: true, title: '受控' },
    });

    await wrapper.find('.aura-alert-close').trigger('click');

    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    expect(wrapper.find('.aura-alert').exists()).toBe(true);
  });

  it('边界：无标题只有默认插槽时，desc 独立承载内容', () => {
    const wrapper = mount(Alert, { slots: { default: '只有描述' } });

    expect(wrapper.find('.aura-alert-title').exists()).toBe(false);
    expect(wrapper.find('.aura-alert-desc').text()).toBe('只有描述');
  });

  it('边界：title 插槽优先于 title 属性', () => {
    const wrapper = mount(Alert, {
      props: { title: '属性标题' },
      slots: { title: '插槽标题' },
    });

    expect(wrapper.find('.aura-alert-title').text()).toBe('插槽标题');
  });

  it('边界：defaultVisible=false 时初始不渲染', () => {
    const wrapper = mount(Alert, { props: { defaultVisible: false } });

    expect(wrapper.find('.aura-alert').exists()).toBe(false);
  });

  it('异常：type 传非法值不产生垃圾类名，也不抛错', () => {
    const wrapper = mount(Alert, { props: { type: 'rainbow' as never } });

    expect(wrapper.classes()).not.toContain('aura-alert--rainbow');
  });

  it('异常：warning 类型的图标使用三角底形（区别于圆底）', () => {
    const warning = mount(Alert, {
      props: { type: 'warning', showIcon: true },
    });
    const info = mount(Alert, { props: { type: 'info', showIcon: true } });

    expect(warning.find('circle').exists()).toBe(false);
    expect(info.find('circle').exists()).toBe(true);
  });
});
