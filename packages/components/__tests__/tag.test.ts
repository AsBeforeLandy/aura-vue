import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Tag } from '../src/tag';

describe('Tag - 正常场景', () => {
  it('正常：渲染默认类型与文本', () => {
    const wrapper = mount(Tag, { slots: { default: '待审核' } });

    expect(wrapper.classes()).toContain('aura-tag');
    expect(wrapper.classes()).toContain('aura-tag--info');
    expect(wrapper.text()).toContain('待审核');
  });

  it('正常：type 修饰类生效', () => {
    const wrapper = mount(Tag, {
      props: { type: 'success' },
      slots: { default: '启用' },
    });

    expect(wrapper.classes()).toContain('aura-tag--success');
  });

  it('正常：closable 时渲染原生关闭按钮（含 aria-label）', () => {
    const wrapper = mount(Tag, {
      props: { closable: true },
      slots: { default: '可关闭' },
    });
    const close = wrapper.find('.aura-tag-close');

    expect(close.exists()).toBe(true);
    expect(close.element.tagName).toBe('BUTTON');
    expect(close.attributes('type')).toBe('button');
    expect(close.attributes('aria-label')).toBe('关闭');
  });
});

describe('Tag - 关闭行为（双轨受控）', () => {
  it('正常：非受控点关闭后隐藏，并 emit close 与 update:visible', async () => {
    const wrapper = mount(Tag, {
      props: { closable: true, defaultVisible: true },
      slots: { default: 'x' },
    });

    await wrapper.find('.aura-tag-close').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    expect(wrapper.find('.aura-tag').exists()).toBe(false);
  });

  it('边界：受控点击关闭只 emit，不自行消失（外部未更新时）', async () => {
    const wrapper = mount(Tag, {
      props: { closable: true, visible: true },
      slots: { default: 'x' },
    });

    await wrapper.find('.aura-tag-close').trigger('click');

    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    expect(wrapper.find('.aura-tag').exists()).toBe(true);
  });

  it('正常：受控下外部更新 visible 后显隐跟随', async () => {
    const wrapper = mount(Tag, { props: { visible: true } });
    expect(wrapper.find('.aura-tag').exists()).toBe(true);

    await wrapper.setProps({ visible: false });
    expect(wrapper.find('.aura-tag').exists()).toBe(false);
  });
});

describe('Tag - 边界场景', () => {
  it('边界：非 closable 不渲染关闭按钮', () => {
    const wrapper = mount(Tag, { slots: { default: 'x' } });

    expect(wrapper.find('.aura-tag-close').exists()).toBe(false);
  });

  it('边界：defaultVisible=false 时初始不渲染', () => {
    const wrapper = mount(Tag, { props: { defaultVisible: false } });

    expect(wrapper.find('.aura-tag').exists()).toBe(false);
  });
});

describe('Tag - 异常场景', () => {
  it('异常：type 传非法值不产生垃圾类名', () => {
    const wrapper = mount(Tag, { props: { type: 'rainbow' as never } });

    expect(wrapper.classes()).not.toContain('aura-tag--rainbow');
  });

  it('异常：隐藏后重复关闭操作不可达，close 只 emit 一次', async () => {
    const wrapper = mount(Tag, {
      props: { closable: true, defaultVisible: true },
      slots: { default: 'x' },
    });

    await wrapper.find('.aura-tag-close').trigger('click');
    // 元素已卸载，无法再次触发
    expect(wrapper.find('.aura-tag-close').exists()).toBe(false);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
