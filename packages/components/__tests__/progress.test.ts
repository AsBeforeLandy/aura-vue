import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Progress } from '../src/progress';

describe('Progress', () => {
  it('正常：渲染进度条与百分比文字', () => {
    const wrapper = mount(Progress, { props: { percent: 40 } });

    expect(wrapper.attributes('role')).toBe('progressbar');
    expect(wrapper.attributes('aria-valuenow')).toBe('40');
    expect(wrapper.attributes('aria-valuemin')).toBe('0');
    expect(wrapper.attributes('aria-valuemax')).toBe('100');
    expect(wrapper.find('.aura-progress-bar').attributes('style')).toContain(
      'width: 40%',
    );
    expect(wrapper.find('.aura-progress-info').text()).toBe('40%');
  });

  it('正常：strokeWidth 映射轨道高度', () => {
    const wrapper = mount(Progress, {
      props: { percent: 10, strokeWidth: 12 },
    });

    expect(wrapper.find('.aura-progress-track').attributes('style')).toContain(
      'height: 12px',
    );
  });

  it('正常：status 修饰类生效', () => {
    for (const status of ['normal', 'success', 'danger'] as const) {
      const wrapper = mount(Progress, { props: { percent: 50, status } });
      expect(wrapper.classes()).toContain(`aura-progress--${status}`);
    }
  });

  it('正常：label 作为可访问名称', () => {
    const wrapper = mount(Progress, {
      props: { percent: 20, label: '上传进度' },
    });

    expect(wrapper.attributes('aria-label')).toBe('上传进度');
  });

  it('边界：showInfo=false 时不渲染文字', () => {
    const wrapper = mount(Progress, {
      props: { percent: 30, showInfo: false },
    });

    expect(wrapper.find('.aura-progress-info').exists()).toBe(false);
  });

  it('异常：percent 超界被钳位到 0~100', () => {
    const over = mount(Progress, { props: { percent: 150 } });
    const under = mount(Progress, { props: { percent: -20 } });

    expect(over.attributes('aria-valuenow')).toBe('100');
    expect(over.find('.aura-progress-info').text()).toBe('100%');
    expect(under.attributes('aria-valuenow')).toBe('0');
    expect(under.find('.aura-progress-bar').attributes('style')).toContain(
      'width: 0%',
    );
  });

  it('异常：status 传非法值不产生垃圾类名，也不抛错', () => {
    const wrapper = mount(Progress, { props: { status: 'paused' as never } });

    expect(wrapper.classes()).not.toContain('aura-progress--paused');
  });
});
