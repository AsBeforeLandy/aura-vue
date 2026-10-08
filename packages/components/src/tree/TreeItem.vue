<template>
  <li
    role="treeitem"
    :aria-level="level"
    :aria-expanded="hasChildren ? expanded : undefined"
    :aria-selected="selected"
  >
    <button
      type="button"
      :class="rowCls"
      :disabled="node.disabled"
      :aria-label="node.label"
      @click="onSelect"
    >
      <!-- 展开 / 收起箭头：叶子节点留白对齐，保证同级标签纵向对齐 -->
      <span :class="prefixCls('tree-arrow')" aria-hidden="true">
        <svg
          v-if="hasChildren"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="expanded && prefixCls('tree-arrow--open')"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>
      <span :class="prefixCls('tree-label')">{{ node.label }}</span>
    </button>

    <ul
      v-if="hasChildren && expanded"
      role="group"
      :class="prefixCls('tree-group')"
    >
      <TreeItem
        v-for="child in node.children"
        :key="child.value"
        :node="child"
        :level="level + 1"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { type TreeContext, type TreeNode } from './types';

defineOptions({ name: 'ATreeItem' });

const props = defineProps<{
  /** 节点数据 */
  node: TreeNode;
  /** 层级（从 1 开始，aria-level 用） */
  level: number;
}>();

// 内部组件：上下文由 ATree 提供
const context = inject<TreeContext | null>('aura-tree', null);

const hasChildren = computed(() => Boolean(props.node.children?.length));
const expanded = computed(() => context?.isExpanded(props.node.value) ?? false);
const selected = computed(() => context?.isSelected(props.node.value) ?? false);

function onSelect() {
  context?.select(props.node.value);
  // 点选有子节点的节点时顺带切换展开（常见树交互）
  if (hasChildren.value) context?.toggle(props.node.value);
}

const rowCls = computed(() =>
  classNames(
    prefixCls('tree-row'),
    selected.value && prefixCls('tree-row--selected'),
    props.node.disabled && prefixCls('tree-row--disabled'),
  ),
);
</script>
