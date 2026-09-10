import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { Select } from '../src/select';

const OPTIONS = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
];

/** Teleport 面板挂在 body 下，跨用例会残留，统一收集并在 afterEach 卸载 */
const wrappers: VueWrapper<any>[] = [];
const mountSelect = (props: Record<string, unknown>) => {
  const wrapper = mount(Select, { props });
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
});

/** 面板在 body 下；happy-dom 下 VTU isVisible 不可靠，用 aria-expanded + 内联样式判断 */
function getPanel(): HTMLElement | null {
  return document.body.querySelector('.aura-select-dropdown');
}

function isOpen(wrapper: VueWrapper<any>) {
  const expanded =
    wrapper.find('.aura-select-trigger').attributes('aria-expanded') === 'true';
  const display = getPanel()?.style.display;
  return expanded && display !== 'none';
}

function getOptions(): HTMLElement[] {
  return Array.from(
    document.body.querySelectorAll<HTMLElement>('.aura-select-option')
  );
}

const openPanel = async (wrapper: VueWrapper<any>) => {
  await wrapper.find('.aura-select-trigger').trigger('click');
};

describe('Select - 正常场景', () => {
  it('展开面板渲染选项，点击选项触发 update:modelValue / change 并回显', async () => {
    const wrapper = mountSelect({ options: OPTIONS });

    expect(isOpen(wrapper)).toBe(false);
    await openPanel(wrapper);
    expect(isOpen(wrapper)).toBe(true);
    expect(getOptions()).toHaveLength(3);

    getOptions()[1].click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['b']);
    expect(wrapper.find('.aura-select-label').text()).toBe('选项 B');
    expect(isOpen(wrapper)).toBe(false);
  });

  it('字符串选项自动标准化为 { label, value }', async () => {
    const wrapper = mountSelect({ options: ['杭州', '上海'] });
    await openPanel(wrapper);

    const options = getOptions();
    expect(options).toHaveLength(2);
    expect(options[0].textContent?.trim()).toBe('杭州');
  });

  it('键盘导航：ArrowDown 展开，ArrowDown/ArrowUp 循环移动高亮，Enter 选中', async () => {
    const wrapper = mountSelect({ options: OPTIONS });
    const trigger = wrapper.find('.aura-select-trigger');

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(isOpen(wrapper)).toBe(true);
    expect(
      document.body.querySelector('.aura-select-option--active')?.textContent
    ).toContain('选项 A');

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(
      document.body.querySelector('.aura-select-option--active')?.textContent
    ).toContain('选项 B');

    await trigger.trigger('keydown', { key: 'ArrowUp' });
    await trigger.trigger('keydown', { key: 'ArrowUp' });
    expect(
      document.body.querySelector('.aura-select-option--active')?.textContent
    ).toContain('选项 C');

    await trigger.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c']);
    expect(isOpen(wrapper)).toBe(false);
  });
});

describe('Select - 边界场景', () => {
  it('无值时展示 placeholder 占位样式', () => {
    const wrapper = mountSelect({ options: ['a'], placeholder: '请选择城市' });

    const placeholderEl = wrapper.find('.aura-select-placeholder');
    expect(placeholderEl.exists()).toBe(true);
    expect(placeholderEl.text()).toBe('请选择城市');
  });

  it('受控模式：外部未更新时选中值复位', async () => {
    const wrapper = mountSelect({
      modelValue: 'a',
      options: OPTIONS
    });

    await openPanel(wrapper);
    getOptions()[1].click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
    expect(wrapper.find('.aura-select-label').text()).toBe('选项 A');
  });

  it('disabled 选项不可选，普通选项不受影响', async () => {
    const wrapper = mountSelect({
      options: [
        { label: '禁用项', value: 'x', disabled: true },
        { label: '可选', value: 'ok' }
      ]
    });

    await openPanel(wrapper);
    const options = getOptions();
    expect(options[0].className).toContain('aura-select-option--disabled');

    options[0].click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();

    options[1].click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['ok']);
  });

  it('组件 disabled 时触发框禁用且面板无法展开', async () => {
    const wrapper = mountSelect({ options: ['a'], disabled: true });

    expect(
      wrapper.find('.aura-select-trigger').attributes('disabled')
    ).toBeDefined();
    await openPanel(wrapper);
    expect(isOpen(wrapper)).toBe(false);
    expect(
      wrapper.find('.aura-select-trigger').attributes('aria-expanded')
    ).toBe('false');
  });
});

describe('Select - 异常场景', () => {
  it('options 为空时展开不崩溃，渲染空面板', async () => {
    const wrapper = mountSelect({});

    await openPanel(wrapper);
    expect(isOpen(wrapper)).toBe(true);
    expect(getOptions()).toHaveLength(0);
  });

  it('点击组件外部关闭面板', async () => {
    const wrapper = mountSelect({ options: OPTIONS });
    await openPanel(wrapper);
    expect(isOpen(wrapper)).toBe(true);

    document.dispatchEvent(new MouseEvent('mousedown'));
    await wrapper.vm.$nextTick();
    expect(isOpen(wrapper)).toBe(false);
  });

  it('Escape 关闭面板，组件卸载时清理事件监听', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const wrapper = mountSelect({ options: ['a'] });

    await openPanel(wrapper);
    await wrapper.find('.aura-select-trigger').trigger('keydown', { key: 'Escape' });
    expect(isOpen(wrapper)).toBe(false);

    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
    removeSpy.mockRestore();
  });
});
