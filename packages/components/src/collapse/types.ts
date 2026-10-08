import type { ExtractPropTypes, PropType } from 'vue';

/** Collapse 的组合上下文（CollapseItem 通过 inject 消费） */
export interface CollapseContext {
  /** 某一项是否处于展开态 */
  isOpen: (value: string) => boolean;
  /** 切换某一项的展开态（accordion 模式下同时最多展开一项） */
  toggle: (value: string) => void;
  /** 生成节点 id（header / panel 的 aria 关联用） */
  headerId: (value: string) => string;
  panelId: (value: string) => string;
}

export const collapseProps = {
  /** 展开项的 value 集合（受控，配合 v-model） */
  modelValue: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  /** 非受控模式初始展开集合 */
  defaultValue: {
    type: Array as PropType<string[]>,
    default: undefined,
  },
  /** 手风琴模式：同时最多展开一项 */
  accordion: {
    type: Boolean,
    default: false,
  },
} as const;

export type CollapseProps = ExtractPropTypes<typeof collapseProps>;

export type CollapseEmits = {
  (e: 'update:modelValue', value: string[]): void;
  (e: 'change', value: string[]): void;
};

export const collapseItemProps = {
  /** 面板标题 */
  title: {
    type: String,
    default: '',
  },
  /** 面板值（在同组内唯一，作为展开态的标识） */
  value: {
    type: String,
    required: true,
  },
  /** 是否禁用（禁用后不能展开 / 收起） */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const;

export type CollapseItemProps = ExtractPropTypes<typeof collapseItemProps>;
