<template>
  <Teleport to="body">
    <Transition name="aura-modal">
      <div v-if="modelValue" :class="prefixCls('modal')">
        <div :class="prefixCls('modal-mask')" @click="onMaskClick" />
        <div
          :class="prefixCls('modal-wrap')"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
        >
          <div
            ref="panelRef"
            :class="prefixCls('modal-panel')"
            :style="panelStyle"
            tabindex="-1"
          >
            <div :class="prefixCls('modal-header')">
              <slot name="title">
                <span :class="prefixCls('modal-title')">{{ title }}</span>
              </slot>
              <!--
                用真实 <button> 而不是 span[role=button]：
                原生按钮自带可聚焦性、Enter/Space 激活与焦点环，
                无需再手工补 tabindex 与键盘处理。
              -->
              <button
                type="button"
                :class="prefixCls('modal-close')"
                aria-label="关闭"
                @click="close"
              >
                ×
              </button>
            </div>
            <div :class="prefixCls('modal-body')">
              <slot />
            </div>
            <div v-if="footer" :class="prefixCls('modal-footer')">
              <slot name="footer">
                <Button @click="onCancel">取消</Button>
                <Button type="primary" @click="onOk">确定</Button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { prefixCls } from '@aura/shared';
import { Button } from '../button';
import { modalProps, type ModalEmits } from './types';
import './style/index.less';

defineOptions({ name: 'AModal' });

const props = defineProps(modalProps);
const emit = defineEmits<ModalEmits>();

const panelRef = ref<HTMLElement>();

const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}));

/**
 * 可聚焦元素选择器。
 *
 * 刻意**不做可见性过滤**（不用 offsetParent / getClientRects 判断）：
 * 一是弹窗里几乎不会有隐藏的控件，二是这类判断依赖布局引擎，
 * 在 happy-dom 下恒为空，会把焦点管理变成「测试里永远不生效」的功能。
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** 打开前持有焦点的元素，关闭后归还给它 */
let previouslyFocused: HTMLElement | null = null;

function focusableElements(): HTMLElement[] {
  if (!panelRef.value) return [];
  return Array.from(
    panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onMaskClick() {
  if (props.closeOnClickMask) close();
}

function onOk() {
  emit('ok');
  close();
}

function onCancel() {
  emit('cancel');
  close();
}

function onKeydown(evt: KeyboardEvent) {
  if (!props.modelValue) return;

  if (evt.key === 'Escape') {
    if (props.closeOnEsc) close();
    return;
  }

  if (evt.key !== 'Tab') return;

  const panel = panelRef.value;
  if (!panel) return;

  const items = focusableElements();
  if (items.length === 0) {
    // 没有任何可聚焦项时把焦点按在面板上，
    // 否则 Tab 会把焦点带到弹窗背后的页面内容（对键盘用户等于「弹窗失效」）
    evt.preventDefault();
    panel.focus();
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;

  // 焦点已跑到弹窗外（例如用户点了浏览器地址栏再按 Tab）时，先拉回弹窗内
  if (!active || !panel.contains(active)) {
    evt.preventDefault();
    (evt.shiftKey ? last : first).focus();
    return;
  }

  if (evt.shiftKey && active === first) {
    evt.preventDefault();
    last.focus();
  } else if (!evt.shiftKey && active === last) {
    evt.preventDefault();
    first.focus();
  }
}

/**
 * 打开时接管焦点、关闭时归还。
 *
 * 初始焦点给**面板本身**而不是第一个控件：
 * 面板有 tabindex="-1"，聚焦后读屏会先播报对话框与其名称；
 * 若直接聚焦到「关闭」或「确定」，用户会先听到一个按钮，
 * 且对确认类弹窗而言「确定」拿到焦点还有误触风险。
 */
watch(
  () => props.modelValue,
  async (visible) => {
    if (typeof document === 'undefined') return;

    if (visible) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      await nextTick();
      panelRef.value?.focus();
      return;
    }

    const target = previouslyFocused;
    previouslyFocused = null;
    if (target && document.contains(target)) target.focus();
  },
);

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  // 组件在打开状态下被卸载时，同样把焦点还回去，避免焦点落到 body
  const target = previouslyFocused;
  previouslyFocused = null;
  if (target && typeof document !== 'undefined' && document.contains(target)) {
    target.focus();
  }
});
</script>
