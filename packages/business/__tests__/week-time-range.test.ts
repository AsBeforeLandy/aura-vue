import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekTimeRange from '../src/week-time-range/WeekTimeRange.vue';
import type { WeekTimeRangeValue } from '../src/week-time-range/types';

const emptyValue = (): WeekTimeRangeValue =>
  Array.from({ length: 7 }, () => []);

const cell = (wrapper: ReturnType<typeof mount>, slot: string) =>
  wrapper.find(`[data-slot="${slot}"]`);

/**
 * 30 分钟粒度下：slot index 18 = 09:00-09:30，19 = 09:30-10:00，20 = 10:00-10:30
 */
const SLOT_0900 = '0-18';
const SLOT_0930 = '0-19';

const lastValue = (wrapper: ReturnType<typeof mount>): WeekTimeRangeValue =>
  (wrapper.emitted('change')!.at(-1) as [WeekTimeRangeValue])[0];

describe('WeekTimeRange', () => {
  // ---- 正常 ----
  it('正常：渲染 7 行星期标签与 48 个时间槽', () => {
    const wrapper = mount(WeekTimeRange);
    expect(wrapper.find('.aura-week-time-range').exists()).toBe(true);
    expect(wrapper.text()).toContain('周一');
    expect(wrapper.text()).toContain('周日');
    expect(wrapper.findAll('[data-slot]')).toHaveLength(7 * 48);
  });

  it('正常：单击单元格后回调选中该时段', async () => {
    const wrapper = mount(WeekTimeRange);
    await cell(wrapper, SLOT_0900).trigger('click');
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(lastValue(wrapper)[0]).toEqual([{ start: '09:00', end: '09:30' }]);
  });

  it('正常：真实单击序列（mousedown → mouseup → click）只切换一次', async () => {
    // 回归：mouseup 的框选逻辑与 click 会重复切换同一时段而相互抵消，
    // 表现为「点了没反应」。此处锁定该场景。
    const wrapper = mount(WeekTimeRange);
    const target = cell(wrapper, SLOT_0900);
    await target.trigger('mousedown');
    await target.trigger('mouseup');
    await target.trigger('click');
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(lastValue(wrapper)[0]).toEqual([{ start: '09:00', end: '09:30' }]);
  });

  it('正常：相邻时段自动合并为一个区间', async () => {
    const wrapper = mount(WeekTimeRange);
    await cell(wrapper, SLOT_0900).trigger('click');
    await cell(wrapper, SLOT_0930).trigger('click');
    expect(lastValue(wrapper)[0]).toEqual([{ start: '09:00', end: '10:00' }]);
  });

  it('正常：再次点击可取消该时段选中', async () => {
    const wrapper = mount(WeekTimeRange);
    await cell(wrapper, SLOT_0900).trigger('click');
    await cell(wrapper, SLOT_0900).trigger('click');
    expect(lastValue(wrapper)[0]).toEqual([]);
  });

  it('正常：底部摘要展示已选时段', () => {
    const wrapper = mount(WeekTimeRange, {
      props: {
        defaultValue: [
          [{ start: '09:00', end: '10:00' }],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
      },
    });
    expect(wrapper.text()).toContain('已选择 1 天的时间段');
    expect(wrapper.text()).toContain('09:00-10:00');
  });

  it('正常：update:modelValue 与 change 同步抛出', async () => {
    const wrapper = mount(WeekTimeRange);
    await cell(wrapper, SLOT_0900).trigger('click');
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(
      (wrapper.emitted('update:modelValue')![0] as [WeekTimeRangeValue])[0][0],
    ).toEqual([{ start: '09:00', end: '09:30' }]);
  });

  // ---- 边界 ----
  it('边界：从已选区间中间挖掉会拆分为两段', async () => {
    const wrapper = mount(WeekTimeRange, {
      props: {
        defaultValue: [
          [{ start: '09:00', end: '11:00' }],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
      },
    });
    await cell(wrapper, SLOT_0930).trigger('click'); // 09:30-10:00 落在区间中部
    expect(lastValue(wrapper)[0]).toEqual([
      { start: '09:00', end: '09:30' },
      { start: '10:00', end: '11:00' },
    ]);
  });

  it('边界：点击清空重置全部选择', async () => {
    const wrapper = mount(WeekTimeRange, {
      props: {
        defaultValue: [
          [{ start: '09:00', end: '10:00' }],
          [],
          [],
          [],
          [],
          [],
          [],
        ],
      },
    });
    await wrapper.find('.aura-week-time-range-clear').trigger('click');
    expect(lastValue(wrapper).every((ranges) => ranges.length === 0)).toBe(
      true,
    );
  });

  it('边界：受控模式下点击不改变自身渲染，仅回调', async () => {
    const wrapper = mount(WeekTimeRange, {
      props: { modelValue: emptyValue() },
    });
    const target = cell(wrapper, SLOT_0900);
    await target.trigger('click');
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(
      target.classes().includes('aura-week-time-range-cell-selected'),
    ).toBe(false);
  });

  it('边界：weekStartsOn=0 时第一行为周日', () => {
    const wrapper = mount(WeekTimeRange, { props: { weekStartsOn: 0 } });
    expect(wrapper.find('.aura-week-time-range-week').text()).toBe('周日');
  });

  it('边界：stepMinutes=60 时时间槽减半', () => {
    const wrapper = mount(WeekTimeRange, { props: { stepMinutes: 60 } });
    expect(wrapper.findAll('[data-slot]')).toHaveLength(7 * 24);
  });

  it('边界：disabled 时点击不触发回调', async () => {
    const wrapper = mount(WeekTimeRange, { props: { disabled: true } });
    await cell(wrapper, SLOT_0900).trigger('click');
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('边界：showSummary=false 时不渲染摘要区', () => {
    const wrapper = mount(WeekTimeRange, { props: { showSummary: false } });
    expect(wrapper.find('.aura-week-time-range-summary').exists()).toBe(false);
  });

  it('边界：cellWidth / cellHeight 注入 CSS 变量', () => {
    const wrapper = mount(WeekTimeRange, {
      props: { cellWidth: 16, cellHeight: 30 },
    });
    const root = wrapper.find('.aura-week-time-range').element as HTMLElement;
    expect(root.style.getPropertyValue('--aura-wtr-cell-width')).toBe('16px');
    expect(root.style.getPropertyValue('--aura-wtr-cell-height')).toBe('30px');
  });

  it('边界：cellWidth 支持任意 CSS 长度字符串', () => {
    const wrapper = mount(WeekTimeRange, { props: { cellWidth: '1em' } });
    const root = wrapper.find('.aura-week-time-range').element as HTMLElement;
    expect(root.style.getPropertyValue('--aura-wtr-cell-width')).toBe('1em');
  });

  // ---- 异常 ----
  it('异常：未监听 change 时点击不崩溃', async () => {
    const wrapper = mount(WeekTimeRange);
    await cell(wrapper, SLOT_0900).trigger('click');
    expect(wrapper.find('.aura-week-time-range').exists()).toBe(true);
  });

  it('异常：defaultValue 为空数组时不崩溃', () => {
    const wrapper = mount(WeekTimeRange, { props: { defaultValue: [] } });
    expect(wrapper.findAll('[data-slot]')).toHaveLength(7 * 48);
  });

  it('异常：defaultValue 缺少某天时按空处理', () => {
    const wrapper = mount(WeekTimeRange, {
      props: { defaultValue: [[{ start: '09:00', end: '10:00' }]] },
    });
    expect(wrapper.findAll('[data-slot]')).toHaveLength(7 * 48);
  });
});
