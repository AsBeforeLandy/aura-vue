import type { ExtractPropTypes, PropType } from 'vue';

export const modalProps = {
  /** 是否可见（受控） */
  modelValue: {
    type: Boolean,
    default: false
  },
  /** 标题（可用 title 插槽覆盖） */
  title: {
    type: String,
    default: ''
  },
  /** 宽度，数字按 px 处理 */
  width: {
    type: [Number, String] as PropType<number | string>,
    default: 520
  },
  /** 点击遮罩是否关闭 */
  closeOnClickMask: {
    type: Boolean,
    default: true
  },
  /** 按 ESC 是否关闭 */
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  /** 是否展示底部区域（默认取消/确定按钮，可用 footer 插槽覆盖） */
  footer: {
    type: Boolean,
    default: true
  }
} as const;

export type ModalProps = ExtractPropTypes<typeof modalProps>;

export type ModalEmits = {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'ok'): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
};
