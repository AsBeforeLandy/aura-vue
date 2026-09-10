<template>
  <button
    type="button"
    role="switch"
    :aria-checked="!!model"
    :class="cls"
    @click="toggle"
  >
    <span :class="prefixCls('switch-dot')" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { useControllable } from '../composables/use-controllable';
import { switchProps, type SwitchEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ASwitch' });

const props = defineProps(switchProps);
const emit = defineEmits<SwitchEmits>();

const model = useControllable<boolean>(props, emit);

const cls = computed(() =>
  classNames(
    prefixCls('switch'),
    model.value && prefixCls('switch--on'),
    props.disabled && prefixCls('switch--disabled')
  )
);

function toggle() {
  if (props.disabled) return;
  model.value = !model.value;
  emit('change', !!model.value);
}
</script>
