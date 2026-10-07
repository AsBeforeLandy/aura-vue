import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Tooltip } from '../src/tooltip';

/**
 * Tooltip 的浮层 Teleport 到 body，且定位依赖 getBoundingClientRect
 * （happy-dom 下全部为 0，只能断言定位被调用、不能断言具体坐标），
 * 行为断言以「开 / 关 / 语义 / 事件」为主，视觉定位由文档站 e2e 兜底。
 */
describe('Tooltip', () => {
  afterEach(() => {
    // Teleport 弹层用例必须清理
    document.body.innerHTML = '';
  });

  const findPopper = () => document.body.querySelector('.aura-tooltip');

  it('正常：hover 触发后在 body 渲染浮层，内容来自 content', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: '提示文字' },
      slots: { default: '<button>触发</button>' },
    });

    expect(findPopper()).toBeNull();
    await wrapper.find('.aura-tooltip-trigger').trigger('mouseenter');

    const popper = findPopper();
    expect(popper).not.toBeNull();
    expect(popper!.getAttribute('role')).toBe('tooltip');
    expect(popper!.textContent).toContain('提示文字');
  });

  it('正常：打开后写入定位样式（回归：曾漏绑 ref 导致浮层无定位）', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });

    await wrapper.find('.aura-tooltip-trigger').trigger('mouseenter');

    const style = findPopper()!.getAttribute('style') ?? '';
    // happy-dom 的 getBoundingClientRect 全为 0，坐标值不可断言，
    // 但 top / left 键必须存在——缺失说明定位链路断了（视口左上角裸奔）
    expect(style).toContain('top:');
    expect(style).toContain('left:');
  });

  it('正常：mouseleave 后浮层移除并派发 visible-change', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });

    const trigger = wrapper.find('.aura-tooltip-trigger');
    await trigger.trigger('mouseenter');
    expect(findPopper()).not.toBeNull();

    await trigger.trigger('mouseleave');
    expect(findPopper()).toBeNull();
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
  });

  it('正常：默认位置为 top，placement 修饰类跟随', async () => {
    const top = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });
    await top.find('.aura-tooltip-trigger').trigger('mouseenter');
    expect(findPopper()!.classList.contains('aura-tooltip--top')).toBe(true);

    document.body.innerHTML = '';

    const bottom = mount(Tooltip, {
      props: { content: 'x', placement: 'bottom' },
      slots: { default: '<button>触发</button>' },
    });
    await bottom.find('.aura-tooltip-trigger').trigger('mouseenter');
    expect(findPopper()!.classList.contains('aura-tooltip--bottom')).toBe(true);
  });

  it('正常：focusin 同样触发（键盘可达性）', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });

    await wrapper.find('.aura-tooltip-trigger').trigger('focusin');
    expect(findPopper()).not.toBeNull();
  });

  it('正常：触发元素带 aria-describedby 指向浮层 id', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });

    await wrapper.find('.aura-tooltip-trigger').trigger('mouseenter');

    const popper = findPopper()!;
    const describedby = wrapper
      .find('.aura-tooltip-trigger')
      .attributes('aria-describedby');
    expect(describedby).toBe(popper.getAttribute('id'));
  });

  it('边界：重复 hover 不重复派发 visible-change', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });
    const trigger = wrapper.find('.aura-tooltip-trigger');

    await trigger.trigger('mouseenter');
    await trigger.trigger('mouseenter'); // 已打开，不应再派发

    expect(wrapper.emitted('visible-change')).toEqual([[true]]);
  });

  it('边界：content 插槽优先于 content 属性', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: '属性内容' },
      slots: { default: '<button>触发</button>', content: '插槽内容' },
    });

    await wrapper.find('.aura-tooltip-trigger').trigger('mouseenter');
    expect(findPopper()!.textContent).toContain('插槽内容');
  });

  it('异常：disabled 时不响应 hover', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x', disabled: true },
      slots: { default: '<button>触发</button>' },
    });

    await wrapper.find('.aura-tooltip-trigger').trigger('mouseenter');

    expect(findPopper()).toBeNull();
    expect(wrapper.emitted('visible-change')).toBeUndefined();
  });

  it('异常：Escape 键关闭浮层', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>触发</button>' },
    });
    const trigger = wrapper.find('.aura-tooltip-trigger');

    await trigger.trigger('mouseenter');
    expect(findPopper()).not.toBeNull();

    await trigger.trigger('keydown', { key: 'Escape' });
    expect(findPopper()).toBeNull();
  });
});
