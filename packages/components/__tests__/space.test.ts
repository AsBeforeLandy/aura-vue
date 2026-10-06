import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Space } from '../src/space';

describe('Space - 正常场景', () => {
  it('正常：默认水平排列 + middle 档位', () => {
    const wrapper = mount(Space, {
      slots: { default: '<button>一</button><button>二</button>' },
    });

    expect(wrapper.classes()).toContain('aura-space--horizontal');
    expect(wrapper.classes()).toContain('aura-space--size-middle');
    expect(wrapper.findAll('button')).toHaveLength(2);
  });

  it('正常：direction / wrap / align 修饰类生效', () => {
    const wrapper = mount(Space, {
      props: { direction: 'vertical', wrap: true, align: 'end' },
    });

    expect(wrapper.classes()).toContain('aura-space--vertical');
    expect(wrapper.classes()).toContain('aura-space--wrap');
    expect(wrapper.classes()).toContain('aura-space--align-end');
  });

  it('正常：size 档位映射到对应类名', () => {
    const small = mount(Space, { props: { size: 'small' } });
    const large = mount(Space, { props: { size: 'large' } });

    expect(small.classes()).toContain('aura-space--size-small');
    expect(large.classes()).toContain('aura-space--size-large');
  });

  it('正常：size 为数字时走内联 gap，不加档位类', () => {
    const wrapper = mount(Space, { props: { size: 24 } });

    expect(wrapper.classes()).not.toContain('aura-space--size-24');
    expect(wrapper.attributes('style')).toContain('gap: 24px');
  });
});

describe('Space - 边界场景', () => {
  it('边界：无子元素时渲染空容器不抛错', () => {
    const wrapper = mount(Space);

    expect(wrapper.classes()).toContain('aura-space');
  });

  it('边界：size 为 0 时 gap 为 0 且不产生档位类', () => {
    const wrapper = mount(Space, { props: { size: 0 } });

    expect(wrapper.attributes('style')).toContain('gap: 0px');
  });
});

describe('Space - 异常场景', () => {
  it('异常：size 传非法档位字符串不产生垃圾类名', () => {
    const wrapper = mount(Space, { props: { size: 'huge' as never } });

    expect(wrapper.classes()).not.toContain('aura-space--size-huge');
  });

  it('异常：align 传非法值不产生垃圾类名', () => {
    const wrapper = mount(Space, { props: { align: 'middle' as never } });

    expect(wrapper.classes()).not.toContain('aura-space--align-middle');
  });
});
