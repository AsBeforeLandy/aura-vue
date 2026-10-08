<template>
  <span v-if="visible" :class="cls">
    <slot />
    <!--
      用原生 button 而不是 span[role=button]：
      原生自带可聚焦性、Enter/Space 激活与焦点环（与 Modal 的关闭控件同一约定）
    -->
    <button
      v-if="closable"
      type="button"
      :class="prefixCls('tag-close')"
      aria-label="关闭"
      @click.stop="onClose"
    >
      ×
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames, pickPresetClass, prefixCls } from '@aura-vue/shared';
import { tagProps, type TagEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ATag' });

const props = defineProps(tagProps);
const emit = defineEmits<TagEmits>();

/**
 * 显隐双轨受控。
 *
 * 没有直接复用 useControllable，因为它约定的是 modelValue / defaultValue
 * 这对属性名；标签的语义是 visible / defaultVisible（v-model:visible）。
 * 逻辑与 useControllable 完全同构：受控只 emit，非受控自持状态并 emit。
 */
const innerVisible = ref(props.defaultVisible);
const isControlled = computed(() => props.visible !== undefined);
const visible = computed(() =>
  isControlled.value ? props.visible : innerVisible.value,
);

const cls = computed(() =>
  classNames(
    prefixCls('tag'),
    pickPresetClass(
      props.type,
      ['primary', 'success', 'warning', 'danger', 'info'],
      prefixCls('tag--'),
    ),
    props.closable && prefixCls('tag--closable'),
  ),
);

function onClose(evt: MouseEvent) {
  emit('close', evt);
  // 与 Switch 的双轨语义一致：受控时只发请求，由外部决定是否隐藏
  if (!isControlled.value) innerVisible.value = false;
  emit('update:visible', false);
}
</script>
