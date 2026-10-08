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
import { computed, ref, toRef } from 'vue';
import { prefixCls } from '@aura/shared';
import { useDialogBehavior } from '../composables/use-dialog';
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

/** 焦点陷阱、焦点接管与归还、Esc 关闭：公共行为在 useDialogBehavior 里 */
useDialogBehavior({
  visible: toRef(props, 'modelValue'),
  panelRef,
  closeOnEsc: () => props.closeOnEsc,
  close,
});
</script>
