<template>
  <div
    :class="cls"
    role="radiogroup"
    :aria-disabled="disabled || undefined"
    @keydown="onKeydown"
  >
    <button
      v-for="opt in normalized"
      :key="opt.value"
      type="button"
      role="radio"
      :class="optionCls(opt)"
      :aria-checked="opt.value === fallbackValue"
      :tabindex="opt.value === fallbackValue ? 0 : -1"
      :disabled="disabled"
      @click="select(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
// 分段控制器的语义是单选：radiogroup + radio + aria-checked。
// 键盘遵循 roving tabindex 惯例——组内只有选中项可 Tab 到达，
// 其余用左右方向键移动（见 onKeydown），这是 radio 组的标准交互。
// ⚠️ 模板根节点前不能写 HTML 注释（Vue 会当多根组件，Spin 批次已踩过）。
import { computed } from 'vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { useControllable } from '../composables/use-controllable';
import {
  segmentedProps,
  type SegmentedEmits,
  type SegmentedOption,
} from './types';
import './style/index.less';

defineOptions({ name: 'ASegmented' });

const props = defineProps(segmentedProps);
const emit = defineEmits<SegmentedEmits>();

/** 字符串选项归一化为对象形态 */
const normalized = computed<SegmentedOption[]>(() =>
  props.options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt,
  ),
);

// 非受控且未显式给 defaultValue 时，默认选中第一项（与主流实现一致）。
// 注意初始值在 setup 时取一次，之后动态改 options 不会改变选中项——
// 需要跟随 options 变化的场景请改用受控模式。
const value = useControllable<string>(props, emit);
const fallbackValue = computed(() => value.value ?? normalized.value[0]?.value);

function select(next: string) {
  if (props.disabled || next === fallbackValue.value) return;
  value.value = next; // useControllable 内部处理双轨并 emit update:modelValue
  emit('change', next);
}

/** 方向键在选项间循环移动（跳过无选项 / 单选项的退化情况） */
function onKeydown(evt: KeyboardEvent) {
  if (props.disabled || normalized.value.length < 2) return;

  const keys = ['ArrowLeft', 'ArrowRight'];
  if (!keys.includes(evt.key)) return;
  evt.preventDefault();

  const current = normalized.value.findIndex(
    (o) => o.value === fallbackValue.value,
  );
  const base = current === -1 ? 0 : current;
  const delta = evt.key === 'ArrowRight' ? 1 : -1;
  const next =
    normalized.value[
      (base + delta + normalized.value.length) % normalized.value.length
    ];

  select(next.value);
}

const cls = computed(() =>
  classNames(
    prefixCls('segmented'),
    props.disabled && prefixCls('segmented--disabled'),
  ),
);

const optionCls = (opt: SegmentedOption) =>
  classNames(
    prefixCls('segmented-option'),
    opt.value === fallbackValue.value && prefixCls('segmented-option--active'),
  );
</script>
