import type { ExtractPropTypes, PropType } from 'vue';

export type DrawerPlacement = 'right' | 'bottom';

export const drawerProps = {
  /** 是否可见（受控，配合 v-model） */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 标题（可用 title 插槽覆盖） */
  title: {
    type: String,
    default: '',
  },
  /** 抽屉贴边方向；right 侧滑，bottom 底滑 */
  placement: {
    type: String as PropType<DrawerPlacement>,
    default: 'right',
  },
  /**
   * 抽屉尺寸：placement=right 时是宽度，placement=bottom 时是高度。
   * 数字按 px 处理。
   */
  size: {
    type: [Number, String] as PropType<number | string>,
    default: 420,
  },
  /** 点击遮罩是否关闭 */
  closeOnClickMask: {
    type: Boolean,
    default: true,
  },
  /** 按 ESC 是否关闭 */
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
} as const;

export type DrawerProps = ExtractPropTypes<typeof drawerProps>;

export type DrawerEmits = {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
};
