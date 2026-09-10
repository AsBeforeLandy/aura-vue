/** 生成带 aura 前缀的类名，如 prefixCls('button') -> 'aura-button' */
export function prefixCls(cls: string, prefix = 'aura'): string {
  return `${prefix}-${cls}`;
}

/** 拼接类名，过滤 falsy 值 */
export function classNames(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(' ');
}

export type ClassValue = string | false | null | undefined;
