import { computed, isVNode, h, type VNodeChild } from 'vue';
import { ElTag } from 'element-plus';
import type { ProTableColumn } from './types';

/** 默认日期格式化：仅做常见占位符替换，不引入 dayjs 之类的额外依赖 */
export function formatDate(
  value: unknown,
  pattern = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return String(value);

  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => map[token] ?? token);
}

/** 金额格式化：千分位 + 可选小数位 */
export function formatMoney(value: unknown, digits = 2): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 按列配置渲染单元格内容。
 *
 * 优先级：cellRender（逃生舱）> valueEnum/tag > valueType 内置类型 > 原值。
 * 这里集中处理，避免模板里堆叠多层 v-if 导致可读性下降。
 */
export function renderCell(
  column: ProTableColumn,
  params: { row: Record<string, unknown>; value: unknown; index: number }
): VNodeChild {
  const { row, value, index } = params;

  if (column.cellRender) {
    return column.cellRender({ row: row as never, value, index });
  }

  // 序号列不依赖数据字段
  if (column.valueType === 'index') {
    return String(index + 1);
  }

  if (value === null || value === undefined || value === '') return '';

  // valueEnum 优先：显式的枚举映射比类型推断更可靠
  if (column.valueEnum) {
    const matched = column.valueEnum[String(value)];
    if (!matched) return String(value);
    return h(
      ElTag,
      { type: matched.color ?? 'info', size: 'small' },
      () => matched.text
    );
  }

  switch (column.valueType) {
    case 'tag':
      return h(ElTag, { type: 'info', size: 'small' }, () => String(value));
    case 'date':
      return formatDate(value, column.dateFormat ?? 'YYYY-MM-DD');
    case 'datetime':
      return formatDate(value, column.dateFormat ?? 'YYYY-MM-DD HH:mm:ss');
    case 'money':
      return formatMoney(value);
    default:
      // 数组取 length、对象转字符串，避免直接渲染 [object Object]
      if (Array.isArray(value)) return String(value.length);
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
  }
}

/** 合并同一份 columns 中参与查询的项，生成查询表单配置 */
export function pickSearchItems(columns: ProTableColumn[]): ProTableColumn[] {
  return columns.filter((col) => !col.hideInSearch && col.key);
}

/** 读取嵌套路径的值，支持 'user.name' 形式 */
export function getByPath(source: Record<string, unknown>, path: string): unknown {
  if (!path.includes('.')) return source[path];
  return path
    .split('.')
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
      return undefined;
    }, source);
}

/** 判断一个渲染结果是否为空（用于空值占位） */
export function isEmptyRenderable(node: VNodeChild): boolean {
  if (node === null || node === undefined || node === '') return true;
  if (Array.isArray(node)) return node.length === 0;
  void isVNode;
  return false;
}

/** 深拷贝一层查询值，避免请求参数与表单状态共享引用 */
export function clonePlain<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = Array.isArray(value) ? [...value] : value;
  }
  return out as T;
}

/** 去除空值，避免把 undefined / '' / [] 拼进请求参数 */
export function omitEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/** 提供给组件内部使用的响应式计算：查询项是否超过阈值需要折叠 */
export function computeCollapsed<T>(items: T[], span: number, collapsed: boolean) {
  return computed(() => (collapsed ? items.slice(0, span) : items));
}
