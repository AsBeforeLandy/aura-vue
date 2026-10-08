<template>
  <Teleport to="body">
    <Transition name="aura-drawer">
      <div v-if="modelValue" :class="rootCls">
        <div :class="prefixCls('drawer-mask')" @click="onMaskClick" />
        <div
          :class="prefixCls('drawer-wrap')"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
        >
          <div
            ref="panelRef"
            :class="panelCls"
            :style="panelStyle"
            tabindex="-1"
          >
            <div :class="prefixCls('drawer-header')">
              <slot name="title">
                <span :class="prefixCls('drawer-title')">{{ title }}</span>
              </slot>
              <!-- 原生 button：自带可聚焦性与键盘激活（与 Modal 关闭控件同一约定） -->
              <button
                type="button"
                :class="prefixCls('drawer-close')"
                aria-label="关闭"
                @click="close"
              >
                ×
              </button>
            </div>
            <div :class="prefixCls('drawer-body')">
              <slot />
            </div>
            <div v-if="$slots.footer" :class="prefixCls('drawer-footer')">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura-vue/shared';
import { useDialogBehavior } from '../composables/use-dialog';
import { drawerProps, type DrawerEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ADrawer' });

const props = defineProps(drawerProps);
const emit = defineEmits<DrawerEmits>();

const panelRef = ref<HTMLElement>();

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onMaskClick() {
  if (props.closeOnClickMask) close();
}

// 焦点陷阱、焦点接管与归还、Esc 关闭：公共行为在 useDialogBehavior 里
useDialogBehavior({
  visible: toRef(props, 'modelValue'),
  panelRef,
  closeOnEsc: () => props.closeOnEsc,
  close,
});

const panelStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size;
  return props.placement === 'right' ? { width: size } : { height: size };
});

const rootCls = computed(() =>
  classNames(
    prefixCls('drawer'),
    pickPresetClass(
      props.placement,
      ['right', 'bottom'],
      prefixCls('drawer--'),
    ),
  ),
);

const panelCls = computed(() => prefixCls('drawer-panel'));
</script>
