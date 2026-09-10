<template>
  <Teleport to="body">
    <Transition name="aura-modal">
      <div v-if="modelValue" :class="prefixCls('modal')">
        <div :class="prefixCls('modal-mask')" @click="onMaskClick" />
        <div :class="prefixCls('modal-wrap')" role="dialog" aria-modal="true">
          <div :class="prefixCls('modal-panel')" :style="panelStyle">
            <div :class="prefixCls('modal-header')">
              <slot name="title">
                <span :class="prefixCls('modal-title')">{{ title }}</span>
              </slot>
              <span
                :class="prefixCls('modal-close')"
                role="button"
                aria-label="关闭"
                @click="close"
              >×</span>
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
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { prefixCls } from '@aura/shared';
import { Button } from '../button';
import { modalProps, type ModalEmits } from './types';
import './style/index.less';

defineOptions({ name: 'AModal' });

const props = defineProps(modalProps);
const emit = defineEmits<ModalEmits>();

const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width
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

function onKeydown(evt: KeyboardEvent) {
  if (evt.key === 'Escape' && props.modelValue && props.closeOnEsc) {
    close();
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>
