import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatMoney,
  getByPath,
  omitEmpty,
  pickSearchItems
} from '../src/pro-table/utils';
import type { ProTableColumn } from '../src/pro-table/types';

describe('ProTable utils', () => {
  describe('formatDate', () => {
    it('按默认模板格式化日期', () => {
      expect(formatDate('2026-03-05T08:09:10')).toBe('2026-03-05 08:09:10');
    });

    it('支持自定义模板与 Date 实例', () => {
      const d = new Date(2026, 2, 5, 8, 9, 10);
      expect(formatDate(d, 'YYYY/MM/DD')).toBe('2026/03/05');
    });

    it('边界：空值返回空字符串', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('异常：非法日期回退为原值，不抛错', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatMoney', () => {
    it('千分位 + 两位小数', () => {
      expect(formatMoney(1234567.891)).toBe('1,234,567.89');
    });

    it('字符串数字同样支持', () => {
      expect(formatMoney('1000')).toBe('1,000.00');
    });

    it('边界：零值正常输出', () => {
      expect(formatMoney(0)).toBe('0.00');
    });

    it('异常：非数字回退为原值', () => {
      expect(formatMoney('abc')).toBe('abc');
    });
  });

  describe('getByPath', () => {
    const source = { id: 1, user: { name: 'Landy', org: { title: 'FE' } } };

    it('读取顶层字段', () => {
      expect(getByPath(source, 'id')).toBe(1);
    });

    it('读取嵌套字段', () => {
      expect(getByPath(source, 'user.name')).toBe('Landy');
      expect(getByPath(source, 'user.org.title')).toBe('FE');
    });

    it('边界：路径不存在返回 undefined', () => {
      expect(getByPath(source, 'user.age')).toBeUndefined();
    });

    it('异常：中途遇到非对象不抛错', () => {
      expect(getByPath(source, 'id.name')).toBeUndefined();
    });
  });

  describe('omitEmpty', () => {
    it('剔除 undefined / null / 空串 / 空数组', () => {
      const result = omitEmpty({
        a: 1,
        b: undefined,
        c: null,
        d: '',
        e: [],
        f: 'ok',
        g: 0,
        h: false
      });
      expect(result).toEqual({ a: 1, f: 'ok', g: 0, h: false });
    });

    it('边界：空对象返回空对象', () => {
      expect(omitEmpty({})).toEqual({});
    });
  });

  describe('pickSearchItems', () => {
    it('排除 hideInSearch 的列', () => {
      const columns: ProTableColumn[] = [
        { key: 'name', title: '姓名' },
        { key: 'id', title: 'ID', hideInSearch: true }
      ];
      expect(pickSearchItems(columns).map((c) => c.key)).toEqual(['name']);
    });

    it('边界：空数组返回空数组', () => {
      expect(pickSearchItems([])).toEqual([]);
    });
  });
});
