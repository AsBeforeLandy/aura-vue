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

/**
 * 档位类名守卫：值在预设集合内才返回 `prefix + value`，否则返回空串。
 *
 * 联合类型的 prop（type / size / align 这类）在运行时可能被传入非法值，
 * 直接模板拼接会产生没有对应样式的「垃圾类名」。统一在这里收口，
 * 让组件样式只为声明过的档位负责——非法值安静地回落到组件默认外观。
 */
export function pickPresetClass(
  value: string,
  presets: readonly string[],
  prefix: string,
): string {
  return presets.includes(value) ? `${prefix}${value}` : '';
}
