<template>
  <span
    ref="triggerRef"
    :class="prefixCls('tooltip-trigger')"
    :aria-describedby="open ? popperId : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
    @keydown.escape="hide"
  >
    <slot />

    <Teleport to="body">
      <!--
        过渡只动 opacity：定位已经用了 transform（免测量方案，
        见 use-overlay-position 与样式注释），再让过渡动 transform 会互相覆盖。
      -->
      <Transition name="aura-tooltip">
        <span
          v-if="open"
          :id="popperId"
          role="tooltip"
          :class="cls"
          :style="posStyle"
        >
          <slot name="content">{{ content }}</slot>
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura-vue/shared';
import { useOverlayPosition } from '../composables/use-overlay-position';
import { tooltipProps, type TooltipEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ATooltip' });

const props = defineProps(tooltipProps);
const emit = defineEmits<TooltipEmits>();

let uid = 0;
const popperId = `aura-tooltip-${++uid}`;

const open = ref(false);
const triggerRef = ref<HTMLElement>();

// 打开期间的定位与滚动 / 缩放跟踪、清理都在组合式里。
// ⚠️ triggerRef 必须绑在触发元素上——第一版漏绑后 update() 静默早退，
// 浮层没有任何定位坐标（fixed 无坐标 = 停在视口左上角），单测因
// 不断言定位而全绿。教训：Teleport 浮层的定位必须有断言兜底。
const { posStyle } = useOverlayPosition(triggerRef, open);

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

const cls = computed(() =>
  classNames(
    prefixCls('tooltip'),
    pickPresetClass(props.placement, ['top', 'bottom'], prefixCls('tooltip--')),
    props.disabled && prefixCls('tooltip--disabled'),
  ),
);
</script>
