import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import YearCalendar from '../src/year-calendar/YearCalendar.vue';

const day = (wrapper: ReturnType<typeof mount>, date: string) =>
  wrapper.find(`[data-date="${date}"]`);

describe('YearCalendar', () => {
  // ---- 正常 ----
  it('正常：渲染年份标题与 12 个月份标签', () => {
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    expect(wrapper.find('.aura-year-calendar-title').text()).toBe('2026年');
    expect(wrapper.findAll('.aura-year-calendar-month-label')).toHaveLength(12);
  });

  it('正常：平年渲染 365 个日期格', () => {
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    expect(wrapper.findAll('[data-date]')).toHaveLength(365);
  });

  it('正常：点击日期触发回调并输出该日期', async () => {
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    await day(wrapper, '2026-03-10').trigger('click');
    expect(wrapper.emitted('change')![0][0]).toEqual(['2026-03-10']);
  });

  it('正常：真实单击序列（mousedown → mouseup → click）只切换一次', async () => {
    // 回归：mouseup 的框选逻辑与 click 会重复切换同一日期而相互抵消，
    // 表现为「点了没反应」。此处锁定该场景。
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    const target = day(wrapper, '2026-03-10');
    await target.trigger('mousedown');
    await target.trigger('mouseup');
    await target.trigger('click');
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.emitted('change')![0][0]).toEqual(['2026-03-10']);
  });

  it('正常：真实单击序列可正确取消选中', async () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, defaultValue: ['2026-03-10'] },
    });
    const target = day(wrapper, '2026-03-10');
    await target.trigger('mousedown');
    await target.trigger('mouseup');
    await target.trigger('click');
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.emitted('change')![0][0]).toEqual([]);
  });

  it('正常：再次点击同一日期可取消', async () => {
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    await day(wrapper, '2026-03-10').trigger('click');
    await day(wrapper, '2026-03-10').trigger('click');
    expect((wrapper.emitted('change')!.at(-1) as [string[]])[0]).toEqual([]);
  });

  it('正常：底部插槽接收已选日期', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, defaultValue: ['2026-01-01', '2026-02-02'] },
      slots: {
        default: ({ selectedDates }: { selectedDates: string[] }) =>
          h('span', `已选 ${selectedDates.length} 天`),
      },
    });
    expect(wrapper.text()).toContain('已选 2 天');
  });

  it('正常：选中态写入 aria-checked 便于无障碍识别', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, defaultValue: ['2026-03-10'] },
    });
    expect(day(wrapper, '2026-03-10').attributes('aria-checked')).toBe('true');
    expect(day(wrapper, '2026-03-11').attributes('aria-checked')).toBe('false');
  });

  // ---- 边界 ----
  it('边界：闰年渲染 366 个日期格', () => {
    const wrapper = mount(YearCalendar, { props: { year: 2024 } });
    expect(wrapper.findAll('[data-date]')).toHaveLength(366);
  });

  it('边界：切换年份后日期总数同步更新', async () => {
    const wrapper = mount(YearCalendar, { props: { year: 2025 } });
    expect(wrapper.findAll('[data-date]')).toHaveLength(365);
    await wrapper.setProps({ year: 2024 });
    expect(wrapper.findAll('[data-date]')).toHaveLength(366);
  });

  it('边界：hideYearTitle 时隐藏年份标题', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, hideYearTitle: true },
    });
    expect(wrapper.find('.aura-year-calendar-title').exists()).toBe(false);
  });

  it('边界：cellSize 数字注入 CSS 变量（px）', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, cellSize: 20 },
    });
    const root = wrapper.find('.aura-year-calendar').element as HTMLElement;
    expect(root.style.getPropertyValue('--aura-yc-cell')).toBe('20px');
  });

  it('边界：cellSize 支持任意 CSS 长度字符串', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, cellSize: '1.2em' },
    });
    const root = wrapper.find('.aura-year-calendar').element as HTMLElement;
    expect(root.style.getPropertyValue('--aura-yc-cell')).toBe('1.2em');
  });

  it('边界：monthLabels 自定义生效', () => {
    const wrapper = mount(YearCalendar, {
      props: {
        year: 2026,
        monthLabels: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
      },
    });
    expect(wrapper.text()).toContain('M1');
    expect(wrapper.text()).toContain('M12');
  });

  it('边界：受控模式下点击不改变自身选中态', async () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, modelValue: [] },
    });
    const target = day(wrapper, '2026-03-10');
    await target.trigger('click');
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(target.attributes('aria-checked')).toBe('false');
  });

  it('边界：选中结果按日期升序输出', async () => {
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    await day(wrapper, '2026-09-01').trigger('click');
    await day(wrapper, '2026-01-01').trigger('click');
    expect((wrapper.emitted('change')!.at(-1) as [string[]])[0]).toEqual([
      '2026-01-01',
      '2026-09-01',
    ]);
  });

  // ---- 异常 ----
  it('异常：未监听 change 时点击不崩溃', async () => {
    const wrapper = mount(YearCalendar, { props: { year: 2026 } });
    await day(wrapper, '2026-01-01').trigger('click');
    expect(wrapper.find('.aura-year-calendar').exists()).toBe(true);
  });

  it('异常：defaultValue 为空数组时不崩溃', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: 2026, defaultValue: [] },
    });
    expect(wrapper.find('.aura-year-calendar').exists()).toBe(true);
  });

  it('异常：传入非法年份字符串不崩溃', () => {
    const wrapper = mount(YearCalendar, {
      props: { year: Number('  ') },
    });
    expect(wrapper.find('.aura-year-calendar').exists()).toBe(true);
  });
});
