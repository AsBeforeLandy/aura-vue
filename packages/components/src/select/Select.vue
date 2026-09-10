<template>
  <div ref="rootRef" :class="wrapperCls">
    <button
      ref="triggerRef"
      type="button"
      :class="triggerCls"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span v-if="displayLabel" :class="prefixCls('select-label')">{{ displayLabel }}</span>
      <span v-else :class="prefixCls('select-placeholder')">{{ placeholder || '请选择' }}</span>
      <span :class="arrowCls" aria-hidden="true"></span>
    </button>

    <!-- 面板 Teleport 到 body + fixed 定位：不受任何父级 overflow 裁剪 -->
    <Teleport to="body">
      <ul v-show="open" ref="panelRef" :class="dropdownCls" :style="panelStyle" role="listbox">
        <li
          v-for="(opt, i) in normalizedOptions"
          :key="opt.value"
          role="option"
          :aria-selected="opt.value === model"
          :class="getOptionCls(opt, i)"
          @mouseenter="activeIndex = i"
          @click="selectOption(opt)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { useControllable } from '../composables/use-controllable';
import { selectProps, type SelectEmits, type SelectOption } from './types';
import './style/index.less';

defineOptions({ name: 'ASelect' });

const props = defineProps(selectProps);
const emit = defineEmits<SelectEmits>();

const model = useControllable<string>(props, emit);

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLButtonElement>();
const panelRef = ref<HTMLUListElement>();
const open = ref(false);
const activeIndex = ref(-1);
const panelStyle = ref<{ top: string; left: string; width: string }>();

/** 面板最大高度，与 less 中 max-height 保持一致 */
const PANEL_MAX_HEIGHT = 264;
const PANEL_GAP = 4;

const normalizedOptions = computed<SelectOption[]>(() =>
  props.options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
);

const displayLabel = computed(() => {
  const hit = normalizedOptions.value.find((o) => o.value === model.value);
  return hit ? hit.label : '';
});

const wrapperCls = computed(() =>
  classNames(
    prefixCls('select'),
    props.disabled && prefixCls('select--disabled')
  )
);

const triggerCls = computed(() =>
  classNames(
    prefixCls('select-trigger'),
    open.value && prefixCls('select-trigger--open')
  )
);

const arrowCls = computed(() =>
  classNames(
    prefixCls('select-arrow'),
    open.value && prefixCls('select-arrow--open')
  )
);

const dropdownCls = computed(() => prefixCls('select-dropdown'));

function getOptionCls(opt: SelectOption, index: number) {
  return classNames(
    prefixCls('select-option'),
    index === activeIndex.value && prefixCls('select-option--active'),
    opt.value === model.value && prefixCls('select-option--selected'),
    opt.disabled && prefixCls('select-option--disabled')
  );
}

function toggle() {
  if (props.disabled) return;
  open.value ? close() : openPanel();
}

async function openPanel() {
  open.value = true;
  // 优先高亮当前选中项；无选中值时默认高亮第一个可选项
  const currentIdx = normalizedOptions.value.findIndex(
    (o) => !o.disabled && o.value === model.value
  );
  activeIndex.value =
    currentIdx !== -1
      ? currentIdx
      : normalizedOptions.value.findIndex((o) => !o.disabled);

  document.addEventListener('mousedown', onOutside, true);
  window.addEventListener('scroll', onReposition, true);
  window.addEventListener('resize', onReposition);

  await nextTick();
  updatePosition();
}

function close() {
  open.value = false;
  activeIndex.value = -1;
  document.removeEventListener('mousedown', onOutside, true);
  window.removeEventListener('scroll', onReposition, true);
  window.removeEventListener('resize', onReposition);
}

function onOutside(evt: MouseEvent) {
  const target = evt.target as Node;
  if (rootRef.value?.contains(target)) return;
  if (panelRef.value?.contains(target)) return;
  close();
}

function onReposition() {
  if (open.value) updatePosition();
}

/** fixed 定位：默认在触发框下方，下方空间不足且上方更宽裕时弹到上方 */
function updatePosition() {
  const trigger = triggerRef.value;
  const panel = panelRef.value;
  if (!trigger || !panel) return;

  const rect = trigger.getBoundingClientRect();
  const panelH = panel.offsetHeight || PANEL_MAX_HEIGHT;
  const spaceBelow = window.innerHeight - rect.bottom;

  const top =
    spaceBelow >= panelH + PANEL_GAP || rect.top < spaceBelow
      ? rect.bottom + PANEL_GAP
      : rect.top - panelH - PANEL_GAP;

  panelStyle.value = {
    top: `${top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  };
}

function selectOption(opt: SelectOption) {
  if (props.disabled || opt.disabled) return;
  if (opt.value !== model.value) {
    model.value = opt.value;
    emit('change', opt.value);
  }
  close();
  triggerRef.value?.focus();
}

function onKeydown(evt: KeyboardEvent) {
  if (props.disabled) return;
  const selectable = normalizedOptions.value.filter((o) => !o.disabled);

  switch (evt.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      evt.preventDefault();
      if (!open.value) {
        openPanel();
        return;
      }
      const delta = evt.key === 'ArrowDown' ? 1 : -1;
      if (selectable.length === 0) return;
      const currentIndex = selectable.findIndex(
        (o) => o.value === normalizedOptions.value[activeIndex.value]?.value
      );
      const next =
        (currentIndex + delta + selectable.length) % selectable.length;
      activeIndex.value = normalizedOptions.value.indexOf(selectable[next]);
      break;
    }
    case 'Enter': {
      if (open.value && activeIndex.value >= 0) {
        evt.preventDefault();
        const opt = normalizedOptions.value[activeIndex.value];
        if (opt && !opt.disabled) selectOption(opt);
      }
      break;
    }
    case 'Escape': {
      if (open.value) {
        evt.preventDefault();
        close();
      }
      break;
    }
  }
}

onBeforeUnmount(close);
</script>
