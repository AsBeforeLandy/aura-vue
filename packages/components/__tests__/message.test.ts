import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Message } from '../src/message';

/**
 * Message 是命令式 API：直接操作 document（创建容器 / 挂载 Vue app），
 * 不走 @vue/test-utils 的 mount。计时用 fake timers 控制自动关闭。
 */
describe('Message（命令式）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // 命令式挂载的容器与消息都在 body 下，用例间必须清场
    document.body.innerHTML = '';
  });

  const findContainer = () =>
    document.body.querySelector('.aura-message-container');
  const findItems = () => document.querySelectorAll('.aura-message');

  it('正常：success() 渲染顶部容器与消息，带 alert 语义', () => {
    Message.success('已保存');

    const item = findItems()[0];
    expect(findContainer()).not.toBeNull();
    expect(item).not.toBeUndefined();
    expect(item!.getAttribute('role')).toBe('alert');
    expect(item!.classList.contains('aura-message--success')).toBe(true);
    expect(item!.textContent).toContain('已保存');
  });

  it('正常：四种类型类名正确', () => {
    Message.info('a');
    Message.success('b');
    Message.warning('c');
    Message.danger('d');

    const types = [...findItems()].map((el) =>
      [...el.classList].find((c) => c.startsWith('aura-message--')),
    );
    expect(types).toEqual([
      'aura-message--info',
      'aura-message--success',
      'aura-message--warning',
      'aura-message--danger',
    ]);
  });

  it('正常：默认 3s 自动关闭', () => {
    Message.info('稍候');

    vi.advanceTimersByTime(2999);
    expect(findItems()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(findItems()).toHaveLength(0);
  });

  it('正常：duration 传 0 不自动关闭，只能手动 close', () => {
    const handle = Message.info('常驻', { duration: 0 });

    vi.advanceTimersByTime(60_000);
    expect(findItems()).toHaveLength(1);

    handle.close();
    expect(findItems()).toHaveLength(0);
  });

  it('正常：close 句柄可提前关闭', () => {
    const handle = Message.info('x');

    handle.close();
    expect(findItems()).toHaveLength(0);
  });

  it('正常：closable 渲染原生关闭按钮，点击即关', () => {
    Message.warning('x', { duration: 0, closable: true });

    const item = findItems()[0]!;
    const close = item.querySelector('.aura-message-close')!;
    expect(close.tagName).toBe('BUTTON');
    expect(close.getAttribute('aria-label')).toBe('关闭');

    (close as HTMLButtonElement).click();
    expect(findItems()).toHaveLength(0);
  });

  it('边界：多条消息堆叠在同一容器，全部关闭后容器被移除', () => {
    const a = Message.info('一');
    Message.success('二');
    expect(findContainer()!.childElementCount).toBe(2);

    a.close();
    expect(findItems()).toHaveLength(1);

    // 剩下的一条到点自动关闭后，容器作为临时节点被一并摘除
    vi.advanceTimersByTime(3000);
    expect(findContainer()).toBeNull();
  });

  it('边界：重复创建时容器复用，不产生多个 container', () => {
    Message.info('a');
    Message.info('b');

    expect(document.querySelectorAll('.aura-message-container')).toHaveLength(
      1,
    );
  });

  it('异常：close 重复调用是安全的（幂等）', () => {
    const handle = Message.info('x', { duration: 0 });

    handle.close();
    expect(() => handle.close()).not.toThrow();
    expect(findItems()).toHaveLength(0);
  });
});
