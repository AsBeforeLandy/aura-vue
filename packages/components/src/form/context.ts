import type { InjectionKey } from 'vue';

export type ValidateTrigger = 'change' | 'blur' | 'submit';

export interface FormItemContext {
  prop?: string;
  validate(trigger: ValidateTrigger): Promise<string | null>;
  resetValidation(): void;
}

export interface FormContext {
  model: Record<string, unknown>;
  addItem(item: FormItemContext): void;
  removeItem(item: FormItemContext): void;
}

/** 表单项提供给内部控件（Input 等）的校验钩子 */
export interface FormItemHook {
  onControlChange(): void;
  onControlBlur(): void;
}

export const formContextKey: InjectionKey<FormContext> = Symbol('aura-form-context');
export const formItemHookKey: InjectionKey<FormItemHook> = Symbol('aura-form-item-hook');
