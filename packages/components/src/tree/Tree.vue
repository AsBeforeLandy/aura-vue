<template>
  <ul :class="cls" role="tree">
    <TreeItem v-for="node in data" :key="node.value" :node="node" :level="1" />
  </ul>
</template>

<script setup lang="ts">
// 树的语义容器：ul role=tree；节点由内部 TreeItem 递归渲染。
// 键盘方向树导航（↑↓ 移动、→ 展开、← 收起）留作后续增强，
// 当前节点的选中 / 展开均可通过 pointer 完成。
import { computed, provide, ref } from 'vue';
import { prefixCls } from '@aura/shared';
import { useControllable } from '../composables/use-controllable';
import TreeItem from './TreeItem.vue';
import {
  treeProps,
  type TreeContext,
  type TreeEmits,
  type TreeNode,
} from './types';
import './style/index.less';

defineOptions({ name: 'ATree' });

const props = defineProps(treeProps);
const emit = defineEmits<TreeEmits>();

const selected = useControllable<string>(props, emit);

/** 展开集合：expandAll 优先，其次 defaultExpandedKeys */
const expanded = ref<Set<string>>(
  new Set(
    props.expandAll ? collectParentKeys(props.data) : props.defaultExpandedKeys,
  ),
);

/** 只收集有子节点的 value（叶子没有展开态） */
function collectParentKeys(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children?.length) {
      acc.push(node.value);
      collectParentKeys(node.children, acc);
    }
  }
  return acc;
}

function toggle(value: string) {
  const next = new Set(expanded.value);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  expanded.value = next;
}

function select(value: string) {
  const node = findNode(props.data, value);
  if (!node || node.disabled) return;
  if (selected.value !== value) {
    selected.value = value;
    emit('change', value);
  }
}

function findNode(nodes: TreeNode[], value: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.value === value) return node;
    const hit = node.children ? findNode(node.children, value) : undefined;
    if (hit) return hit;
  }
  return undefined;
}

provide<TreeContext>('aura-tree', {
  isSelected: (value) => selected.value === value,
  isExpanded: (value) => expanded.value.has(value),
  toggle,
  select,
});

const cls = computed(() => prefixCls('tree'));
</script>
