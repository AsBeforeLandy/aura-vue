export interface Rule {
  /** 必填（undefined / null / '' 视为空） */
  required?: boolean;
  /** 最小长度 */
  min?: number;
  /** 最大长度 */
  max?: number;
  /** 正则校验 */
  pattern?: RegExp;
  /** 自定义校验器：返回 false / 错误文案 / Promise */
  validator?: (value: unknown) => boolean | string | Promise<boolean | string>;
  /** 触发时机，缺省则 change / blur / submit 都触发 */
  trigger?: 'change' | 'blur';
  /** 错误文案 */
  message?: string;
}

export type FormRules = Record<string, Rule[]>;

/** 依次执行规则，返回第一个错误文案，全部通过返回 null */
export async function validateValue(
  value: unknown,
  rules: Rule[]
): Promise<string | null> {
  for (const rule of rules) {
    const isEmpty = value === undefined || value === null || value === '';

    if (rule.required && isEmpty) {
      return rule.message ?? '该项为必填项';
    }

    if (!isEmpty) {
      const len = String(value).length;

      if (rule.min !== undefined && len < rule.min) {
        return rule.message ?? `长度不能少于 ${rule.min} 个字符`;
      }
      if (rule.max !== undefined && len > rule.max) {
        return rule.message ?? `长度不能超过 ${rule.max} 个字符`;
      }
      if (rule.pattern && !rule.pattern.test(String(value))) {
        return rule.message ?? '格式不正确';
      }
    }

    if (rule.validator) {
      const res = await rule.validator(value);
      if (res === false) return rule.message ?? '校验未通过';
      if (typeof res === 'string') return res;
    }
  }
  return null;
}
