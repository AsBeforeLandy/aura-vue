import type { ExtractPropTypes, PropType } from 'vue';

/** 树节点；value 在整棵树内唯一 */
export interface TreeNode {
  /** 节点文案 */
  label: string;
  /** 节点值（唯一） */
  value: string;
  /** 子节点 */
  children?: TreeNode[];
  /** 是否禁用（禁用后不能选中） */
  disabled?: boolean;
}

export const treeProps = {
  /** 树形数据 */
  data: {
    type: Array as PropType<TreeNode[]>,
    default: () => [],
  },
  /** 受控选中值（传入即视为受控模式，配合 v-model） */
  modelValue: {
    type: String,
    default: undefined,
  },
  /** 非受控模式初始选中值 */
  defaultValue: {
    type: String,
    default: undefined,
  },
  /** 初始展开的节点 value 集合（与 expandAll 互斥，expandAll 优先） */
  defaultExpandedKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 是否默认展开全部 */
  expandAll: {
    type: Boolean,
    default: false,
  },
} as const;

export type TreeProps = ExtractPropTypes<typeof treeProps>;

export type TreeEmits = {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
};

/** 内部递归节点的上下文（Tree 通过 provide 传给 TreeItem） */
export interface TreeContext {
  isSelected: (value: string) => boolean;
  isExpanded: (value: string) => boolean;
  toggle: (value: string) => void;
  select: (value: string) => void;
}
