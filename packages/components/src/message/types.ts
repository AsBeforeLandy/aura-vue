import type { ExtractPropTypes, PropType } from 'vue';

export type MessageType = 'info' | 'success' | 'warning' | 'danger';

/** 命令式调用的可选项 */
export interface MessageOptions {
  /**
   * 自动关闭时长（毫秒）
   * @default 3000
   */
  duration?: number;
  /** 是否显示关闭按钮 */
  closable?: boolean;
}

/** 单条消息的渲染属性（内部组件用，不进公开 API） */
export const messageItemProps = {
  type: {
    type: String as PropType<MessageType>,
    default: 'info',
  },
  content: {
    type: String,
    default: '',
  },
  closable: {
    type: Boolean,
    default: false,
  },
} as const;

export type MessageItemProps = ExtractPropTypes<typeof messageItemProps>;
