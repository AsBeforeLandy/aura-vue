import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Popover } from '../src/popover';

// ⚠️ VTU 默认不会自动卸载组件。只清 body 会留下「仍挂载但 Teleport 锚点
// 已消失」的陈旧实例——它带着 document 级监听，后续用例一派发事件就会
// 令其重渲染并崩溃（insertBefore(null)）。必须先卸载组件、再清场。
enableAutoUnmount(afterEach);

describe('Popover', () => {
  afterEach(() => {
    // 卸载（enableAutoUnmount 先执行）之后再清 Teleport 残留
    document.body.innerHTML = '';
  });

  const findPanel = () => document.body.querySelector('.aura-popover');

  it('正常：点击触发后在 body 渲染面板，默认关闭', () => {
    const wrapper = mount(Popover, {
      props: { title: '标题' },
      slots: {
        default: '<button>触发</button>',
        content: '<p>面板内容</p>',
      },
    });

    expect(findPanel()).toBeNull();

    return wrapper
      .find('.aura-popover-trigger')
      .trigger('click')
      .then(() => {
        const panel = findPanel();
        expect(panel).not.toBeNull();
        expect(panel!.getAttribute('role')).toBe('dialog');
        expect(panel!.getAttribute('aria-modal')).toBe('false');
        expect(panel!.querySelector('.aura-popover-title')!.textContent).toBe(
          '标题',
        );
        expect(panel!.textContent).toContain('面板内容');
      });
  });

  it('正常：再次点击收起并派发 visible-change', async () => {
    const wrapper = mount(Popover, {
      slots: { default: '<button>触发</button>', content: 'x' },
    });
    const trigger = wrapper.find('.aura-popover-trigger');

    await trigger.trigger('click');
    expect(findPanel()).not.toBeNull();

    await trigger.trigger('click');
    expect(findPanel()).toBeNull();
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
  });

  it('正常：触发元素带 aria-expanded 与 aria-controls', async () => {
    const wrapper = mount(Popover, {
      slots: { default: '<button>触发</button>', content: 'x' },
    });
    const trigger = wrapper.find('.aura-popover-trigger');

    expect(trigger.attributes('aria-expanded')).toBe('false');

    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(trigger.attributes('aria-controls')).toBe(
      findPanel()!.getAttribute('id'),
    );
  });

  it('正常：title 插槽优先于 title 属性', async () => {
    const wrapper = mount(Popover, {
      props: { title: '属性标题' },
      slots: { default: '<button>触发</button>', title: '插槽标题' },
    });

    await wrapper.find('.aura-popover-trigger').trigger('click');
    expect(findPanel()!.querySelector('.aura-popover-title')!.textContent).toBe(
      '插槽标题',
    );
  });

  it('正常：footer 插槽渲染动作区', async () => {
    const wrapper = mount(Popover, {
      slots: {
        default: '<button>触发</button>',
        content: 'x',
        footer: '<button>确定</button>',
      },
    });

    await wrapper.find('.aura-popover-trigger').trigger('click');
    expect(findPanel()!.querySelector('.aura-popover-footer')).not.toBeNull();
  });

  it('边界：无标题时面板不带 aria-labelledby', async () => {
    const wrapper = mount(Popover, {
      slots: { default: '<button>触发</button>', content: 'x' },
    });

    await wrapper.find('.aura-popover-trigger').trigger('click');
    expect(findPanel()!.getAttribute('aria-labelledby')).toBeNull();
  });

  it('边界：点击面板内部不关闭，点击外部关闭', async () => {
    const wrapper = mount(Popover, {
      slots: { default: '<button>触发</button>', content: '<p>面板</p>' },
    });
    const trigger = wrapper.find('.aura-popover-trigger');
    await trigger.trigger('click');
    expect(findPanel()).not.toBeNull();

    // 面板内部点击：放行（事件冒泡到 document，但 target 在面板内）
    findPanel()!
      .querySelector('p')!
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(trigger.attributes('aria-expanded')).toBe('true');

    // 外部点击（body 上）：关闭。
    // 这里断言 aria-expanded 而不是面板节点——Transition 的离场要跨帧完成，
    // 与 happy-dom 的时序搏斗没有信息量；「面板最终会移除」由 Escape 用例兜底
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('异常：Escape 关闭面板', async () => {
    const wrapper = mount(Popover, {
      slots: { default: '<button>触发</button>', content: 'x' },
    });

    await wrapper.find('.aura-popover-trigger').trigger('click');
    expect(findPanel()).not.toBeNull();

    await wrapper.find('.aura-popover-trigger').trigger('keydown', {
      key: 'Escape',
    });
    expect(findPanel()).toBeNull();
  });

  it('异常：disabled 时不响应点击', async () => {
    const wrapper = mount(Popover, {
      props: { disabled: true },
      slots: { default: '<button>触发</button>', content: 'x' },
    });

    await wrapper.find('.aura-popover-trigger').trigger('click');
    expect(findPanel()).toBeNull();
  });
});
