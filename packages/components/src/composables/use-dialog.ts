import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

export interface DialogBehaviorOptions {
  /** 对话框可见性（受控值） */
  visible: Ref<boolean>;
  /**
   * 面板容器。需要带 tabindex="-1"：
   * 打开时程序化聚焦到它，读屏会先播报「对话框 + 名称」，
   * 直接聚焦内部控件会让用户先听到一个按钮，确认类场景还有误触风险。
   */
  panelRef: Ref<HTMLElement | undefined>;
  /** 是否允许 Esc 关闭 */
  closeOnEsc: () => boolean;
  /** Esc 关闭时触发 */
  close: () => void;
}

/**
 * 对话框公共行为（Modal / Drawer 共用）：
 *
 * 1. **焦点陷阱**：Tab / Shift+Tab 在面板内循环，不外逃。
 * 2. **焦点接管与归还**：打开时聚焦面板本身，关闭时还给打开前的元素。
 * 3. **Esc 关闭**：受 closeOnEsc 控制。
 *
 * 刻意**不做可聚焦元素的可见性过滤**（不用 offsetParent / getClientRects）：
 * 这类判断依赖布局引擎，在 happy-dom 下恒为空，
 * 会把焦点管理变成「测试里永远不生效」的功能；
 * 而弹层里几乎不会有隐藏控件。
 */
export function useDialogBehavior({
  visible,
  panelRef,
  closeOnEsc,
  close,
}: DialogBehaviorOptions) {
  /** 打开前持有焦点的元素，关闭后归还给它 */
  let previouslyFocused: HTMLElement | null = null;

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  function focusableElements(): HTMLElement[] {
    if (!panelRef.value) return [];
    return Array.from(
      panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
  }

  function onKeydown(evt: KeyboardEvent) {
    if (!visible.value) return;

    if (evt.key === 'Escape') {
      if (closeOnEsc()) close();
      return;
    }

    if (evt.key !== 'Tab') return;

    const panel = panelRef.value;
    if (!panel) return;

    const items = focusableElements();
    if (items.length === 0) {
      // 没有任何可聚焦项时把焦点按在面板上，
      // 否则 Tab 会把焦点带到弹层背后的页面内容（对键盘用户等于「弹层失效」）
      evt.preventDefault();
      panel.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;

    // 焦点已跑到弹层外（例如用户点了浏览器地址栏再按 Tab）时，先拉回弹层内
    if (!active || !panel.contains(active)) {
      evt.preventDefault();
      (evt.shiftKey ? last : first).focus();
      return;
    }

    // 焦点在**面板本身**（tabindex="-1" 的容器）上时，它不在可聚焦列表里，
    // 下面两个「首尾互换」分支都不会命中——必须单独处理，
    // 否则打开弹层后立刻 Shift+Tab 会直接逃出去（这是 E2E 抓到的真实缺陷：
    // happy-dom 的用例都是先把焦点移到某个控件上，覆盖不到这条路径）。
    if (active === panel) {
      evt.preventDefault();
      (evt.shiftKey ? last : first).focus();
      return;
    }

    if (evt.shiftKey && active === first) {
      evt.preventDefault();
      last.focus();
    } else if (!evt.shiftKey && active === last) {
      evt.preventDefault();
      first.focus();
    }
  }

  // 打开时接管焦点、关闭时归还。
  // immediate：组件挂载时就已经 visible 的场景（如路由驱动）也要接管焦点——
  // 否则「挂载即打开」时焦点永远不会落到面板上（Modal 的用例都是先挂载
  // 后置 true，掩盖过这条路径）。
  watch(
    visible,
    async (value) => {
      if (typeof document === 'undefined') return;

      if (value) {
        const current = document.activeElement as HTMLElement | null;
        // 焦点在 body 上（初始态）不算「用户焦点」，关闭时不需要归还
        previouslyFocused =
          current && current !== document.body ? current : null;
        await nextTick();
        panelRef.value?.focus();
        return;
      }

      const target = previouslyFocused;
      previouslyFocused = null;
      if (target && document.contains(target)) target.focus();
    },
    { immediate: true },
  );

  onMounted(() => document.addEventListener('keydown', onKeydown));
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown);
    // 组件在打开状态下被卸载时，同样把焦点还回去，避免焦点落到 body
    const target = previouslyFocused;
    previouslyFocused = null;
    if (
      target &&
      typeof document !== 'undefined' &&
      document.contains(target)
    ) {
      target.focus();
    }
  });
}
