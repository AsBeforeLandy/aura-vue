import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

/**
 * 浮层定位组合式（Tooltip / Popover 共用）。
 *
 * 方案：`position: fixed` + 触发元素的**视口矩形**（getBoundingClientRect）
 * 得到触发元素顶边中点坐标；浮层自身的对中与间距交给消费方的 CSS transform
 * 处理——这里**不测量浮层尺寸**，happy-dom（没有布局引擎）下也不会量崩，
 * 单测可以放心断言「打开后有定位样式」而不是具体坐标。
 *
 * 监听策略：只在浮层打开期间跟踪滚动（capture 才能拿到内部滚动容器）
 * 与窗口缩放，关闭即解绑——浮层是高频小件，常驻监听不划算。
 */
export function useOverlayPosition(
  triggerRef: Ref<HTMLElement | undefined>,
  open: Ref<boolean>,
) {
  const posStyle = ref<Record<string, string>>({});

  function update() {
    const rect = triggerRef.value?.getBoundingClientRect();
    if (!rect) return;
    posStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.left + rect.width / 2}px`,
    };
  }

  function bind() {
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
  }

  function unbind() {
    window.removeEventListener('scroll', update, true);
    window.removeEventListener('resize', update);
  }

  watch(open, (value) => {
    if (value) {
      update();
      bind();
    } else {
      unbind();
    }
  });

  onBeforeUnmount(unbind);

  return { posStyle, update };
}
