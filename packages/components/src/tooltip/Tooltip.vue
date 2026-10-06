<template>
  <span
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
        过渡只动 opacity：定位已经用了 transform（免测量方案，见 less），
        再让过渡动 transform 会互相覆盖。
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
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura/shared';
import { tooltipProps, type TooltipEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ATooltip' });

const props = defineProps(tooltipProps);
const emit = defineEmits<TooltipEmits>();

let uid = 0;
const popperId = `aura-tooltip-${++uid}`;

const open = ref(false);
const triggerRef = ref<HTMLElement>();

/**
 * 定位：fixed + 触发元素的视口坐标，浮层的尺寸交给 CSS transform 处理——
 * top / bottom 都只用「触发元素」的矩形，不测量浮层自身，
 * 这样 happy-dom（没有布局引擎）下也不会因为量不出尺寸而报错。
 */
const posStyle = ref<Record<string, string>>({});

function update() {
  const rect = triggerRef.value?.getBoundingClientRect();
  if (!rect) return;
  posStyle.value = {
    top: `${rect.top}px`,
    left: `${rect.left + rect.width / 2}px`,
  };
}

function show() {
  if (props.disabled || open.value) return;
  open.value = true;
  update();
  emit('visible-change', true);
}

function hide() {
  if (!open.value) return;
  open.value = false;
  emit('visible-change', false);
}

// 打开期间跟踪滚动（capture 才能拿到内部滚动容器）与窗口缩放，
// 关闭后立即解绑——Tooltip 是高频小件，常驻监听不划算
watch(open, (value) => {
  if (value) {
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
  } else {
    window.removeEventListener('scroll', update, true);
    window.removeEventListener('resize', update);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', update, true);
  window.removeEventListener('resize', update);
});

const cls = computed(() =>
  classNames(
    prefixCls('tooltip'),
    pickPresetClass(props.placement, ['top', 'bottom'], prefixCls('tooltip--')),
    props.disabled && prefixCls('tooltip--disabled'),
  ),
);
</script>
