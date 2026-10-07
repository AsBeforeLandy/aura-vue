import { createApp, h } from 'vue';
import MessageItem from './Message.vue';
import type { MessageOptions, MessageType } from './types';
import './style/index.less';

/** 关闭句柄：命令式调用方可以用它提前收掉某条消息 */
export interface MessageHandle {
  close(): void;
}

const CONTAINER_CLASS = 'aura-message-container';
const DEFAULT_DURATION = 3000;

function open(
  type: MessageType,
  content: string,
  options: MessageOptions = {},
): MessageHandle {
  // 命令式 API 依赖真实 DOM；SSR 构建期不会执行到这里，
  // 但为了保险（比如消费方在服务端误调用）静默降级而不是抛错
  if (typeof document === 'undefined') {
    return { close() {} };
  }

  // 所有消息共享一个顶部容器，随最后一条消息一起移除
  let container = document.body.querySelector<HTMLDivElement>(
    `.${CONTAINER_CLASS}`,
  );
  if (!container) {
    container = document.createElement('div');
    container.className = CONTAINER_CLASS;
    document.body.appendChild(container);
  }

  const host = document.createElement('div');
  container.appendChild(host);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  function dismiss() {
    if (closed) return;
    closed = true;
    if (timer !== undefined) clearTimeout(timer);
    app.unmount();
    host.remove();
    // 容器是临时节点：空了就摘掉，不在页面里留孤儿
    if (container && container.childElementCount === 0) container.remove();
  }

  const app = createApp({
    render: () =>
      h(MessageItem, {
        type,
        content,
        closable: options.closable === true,
        onClose: dismiss,
      }),
  });
  app.mount(host);

  // duration 传 0 表示不自动关闭
  const duration = options.duration ?? DEFAULT_DURATION;
  if (duration > 0) {
    timer = setTimeout(dismiss, duration);
  }

  return { close: dismiss };
}

/**
 * 全局消息提示（命令式）：
 *
 *   import { Message } from '@aura/components';
 *   Message.success('已保存');
 *   Message.danger('同步失败', { duration: 0, closable: true });
 *
 * 不作为组件使用、也不进 components 全量注册清单——
 * 它没有模板语义，注册到 app 反而会误导使用方写 `<Message />`。
 */
export const Message = {
  info: (content: string, options?: MessageOptions) =>
    open('info', content, options),
  success: (content: string, options?: MessageOptions) =>
    open('success', content, options),
  warning: (content: string, options?: MessageOptions) =>
    open('warning', content, options),
  danger: (content: string, options?: MessageOptions) =>
    open('danger', content, options),
};
