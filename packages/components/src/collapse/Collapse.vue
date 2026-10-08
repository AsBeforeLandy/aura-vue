<template>
  <div :class="prefixCls('collapse')">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, watch } from 'vue';
import { prefixCls } from '@aura/shared';
import { useControllable } from '../composables/use-controllable';
import {
  collapseProps,
  type CollapseContext,
  type CollapseEmits,
} from './types';
import './style/index.less';

defineOptions({ name: 'ACollapse' });

const props = defineProps(collapseProps);
const emit = defineEmits<CollapseEmits>();

let uid = 0;
const listId = `aura-collapse-${++uid}`;

// T = string[]：modelValue / defaultValue 都是字符串数组
const openKeys = useControllable<string[]>(props, emit);

function commit(next: string[]) {
  openKeys.value = next;
  emit('change', next);
}

function toggle(value: string) {
  const current = openKeys.value ?? [];
  let next: string[];
  if (props.accordion) {
    // 手风琴：再点已展开项是收起，点其他项是换页
    next = current.includes(value) ? [] : [value];
  } else {
    next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
  }
  commit(next);
}

// 受控值外部变化时同步内部集合（引用变化即认为外部驱动）
watch(
  () => props.modelValue,
  (value) => {
    if (value) openKeys.value = value;
  },
);

provide<CollapseContext>('aura-collapse', {
  isOpen: (value) => Boolean(openKeys.value?.includes(value)),
  toggle,
  headerId: (value) => `${listId}-header-${value}`,
  panelId: (value) => `${listId}-panel-${value}`,
});
</script>
