import { computed, ref, type Ref } from 'vue';

export interface ControllableProps<T> {
  /** 受控值（传入即视为受控模式） */
  modelValue?: T;
  /** 非受控模式下的初始值 */
  defaultValue?: T;
}

export type ControllableEmit<T> = (event: 'update:modelValue', value: T) => void;

/**
 * 受控 / 非受控双轨 hook：
 * - 传了 modelValue -> 受控，值完全由外部驱动，仅 emit 请求
 * - 未传 modelValue -> 非受控，内部自持状态（以 defaultValue 初始化），同时 emit 通知外部
 */
export function useControllable<T>(
  props: ControllableProps<T>,
  emit: ControllableEmit<T>
): Ref<T | undefined> {
  const innerValue = ref(props.defaultValue) as Ref<T | undefined>;
  const isControlled = computed(() => props.modelValue !== undefined);

  const value = computed<T | undefined>({
    get: () => (isControlled.value ? props.modelValue : innerValue.value),
    set: (val) => {
      if (!isControlled.value) {
        innerValue.value = val;
      }
      emit('update:modelValue', val as T);
    }
  });

  return value;
}
