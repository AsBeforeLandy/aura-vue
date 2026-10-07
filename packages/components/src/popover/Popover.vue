<template>
  <span
    ref="triggerRef"
    :class="prefixCls('popover-trigger')"
    :aria-expanded="open"
    :aria-controls="open ? popperId : undefined"
    @click="toggle"
    @keydown.escape="hide"
  >
    <slot />

    <Teleport to="body">
      <Transition name="aura-popover">
        <!--
          非模态对话框：内容可交互（按钮 / 表单），不锁焦点也不遮页面，
          因此 aria-modal="false"；标题存在时用 aria-labelledby 建立关联。
        -->
        <div
          v-if="open"
          :id="popperId"
          ref="panelRef"
          role="dialog"
          aria-modal="false"
          :aria-labelledby="hasTitle ? titleId : undefined"
          :class="cls"
          :style="posStyle"
        >
          <div
            v-if="hasTitle"
            :id="titleId"
            :class="prefixCls('popover-title')"
          >
            <slot name="title">{{ title }}</slot>
          </div>
          <div :class="prefixCls('popover-content')">
            <slot name="content" />
          </div>
          <div v-if="hasFooter" :class="prefixCls('popover-footer')">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura/shared';
import { useOverlayPosition } from '../composables/use-overlay-position';
import { popoverProps, type PopoverEmits } from './types';
import './style/index.less';

defineOptions({ name: 'APopover' });

const props = defineProps(popoverProps);
const emit = defineEmits<PopoverEmits>();
const slots = useSlots();

let uid = 0;
const popperId = `aura-popover-${++uid}`;
const titleId = `${popperId}-title`;

const open = ref(false);
const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();

// 打开期间的定位与滚动 / 缩放跟踪、清理都在组合式里
const { posStyle } = useOverlayPosition(triggerRef, open);

const hasTitle = computed(() => Boolean(props.title) || Boolean(slots.title));
const hasFooter = computed(() => Boolean(slots.footer));

function show() {
  if (props.disabled || open.value) return;
  open.value = true;
  emit('visible-change', true);
}

function hide() {
  if (!open.value) return;
  open.value = false;
  emit('visible-change', false);
}

function toggle() {
  if (open.value) {
    hide();
  } else {
    show();
  }
}

// 点击外部关闭：面板是 Teleport 到 body 的独立 DOM，
// 触发元素与面板内部的点击都要放行
function onDocumentMousedown(evt: MouseEvent) {
  const target = evt.target as Node | null;
  if (!target) return;
  if (triggerRef.value?.contains(target)) return;
  if (panelRef.value?.contains(target)) return;
  hide();
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('mousedown', onDocumentMousedown);
  } else {
    document.removeEventListener('mousedown', onDocumentMousedown);
  }
});

// open 状态下卸载组件会绕过 watch 的关闭分支，必须独立清理
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown);
});

const cls = computed(() =>
  classNames(
    prefixCls('popover'),
    pickPresetClass(props.placement, ['top', 'bottom'], prefixCls('popover--')),
  ),
);
</script>
