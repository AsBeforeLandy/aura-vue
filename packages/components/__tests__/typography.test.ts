import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Typography } from '../src/typography';

describe('Typography - 正常场景', () => {
  it('正常：默认渲染段落 <p>', () => {
    const wrapper = mount(Typography, { slots: { default: '正文' } });

    expect(wrapper.element.tagName).toBe('P');
    expect(wrapper.classes()).toContain('aura-typography');
    expect(wrapper.text()).toBe('正文');
  });

  it('正常：level 渲染对应标题标签与类名', () => {
    const h1 = mount(Typography, {
      props: { level: 1 },
      slots: { default: '标题' },
    });
    const h3 = mount(Typography, {
      props: { level: 3 },
      slots: { default: '标题' },
    });

    expect(h1.element.tagName).toBe('H1');
    expect(h1.classes()).toContain('aura-typography--h1');
    expect(h3.element.tagName).toBe('H3');
    expect(h3.classes()).toContain('aura-typography--h3');
  });

  it('正常：type 语义色类生效', () => {
    const wrapper = mount(Typography, { props: { type: 'secondary' } });

    expect(wrapper.classes()).toContain('aura-typography--secondary');
  });

  it('正常：行内强调类生效', () => {
    const wrapper = mount(Typography, {
      props: { strong: true, underline: true },
    });

    expect(wrapper.classes()).toContain('aura-typography--strong');
    expect(wrapper.classes()).toContain('aura-typography--underline');
  });
});

describe('Typography - 边界场景', () => {
  it('边界：level 超出 1~4 时按段落渲染', () => {
    const wrapper = mount(Typography, { props: { level: 9 as never } });

    expect(wrapper.element.tagName).toBe('P');
    expect(wrapper.classes()).not.toContain('aura-typography--h9');
  });

  it('边界：underline 与 delete 同时开启时两个类都在', () => {
    const wrapper = mount(Typography, {
      props: { underline: true, delete: true },
    });

    expect(wrapper.classes()).toContain('aura-typography--underline');
    expect(wrapper.classes()).toContain('aura-typography--delete');
  });
});

describe('Typography - 异常场景', () => {
  it.each([0, -1])('异常：level=%i 按段落渲染，不抛错', (level) => {
    const wrapper = mount(Typography, { props: { level: level as never } });

    expect(wrapper.element.tagName).toBe('P');
  });

  it('异常：无插槽内容渲染空标签不抛错', () => {
    const wrapper = mount(Typography);

    expect(wrapper.text()).toBe('');
  });
});
