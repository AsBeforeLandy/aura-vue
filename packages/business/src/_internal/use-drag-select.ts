import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
  type ComputedRef,
  type CSSProperties,
  type Ref,
} from 'vue';

/** 归一化后的拖拽矩形（相对容器左上角，left/top 恒小于 right/bottom） */
export interface DragRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** 相对容器的坐标点 */
export interface DragPoint {
  x: number;
  y: number;
}

/** 拖拽结束时的附加信息 */
export interface DragSelectMeta {
  /**
   * 是否为「真实拖拽」
   *
   * 位移小于阈值时视为单击，调用方应交给单元格自身的 onClick 处理，
   * 避免与拖拽逻辑重复切换同一个目标。
   */
  isDrag: boolean;
}

/** 判定为拖拽所需的最小位移（px，曼哈顿距离） */
const DRAG_THRESHOLD = 3;

export interface UseDragSelectOptions {
  /** 容器元素 ref，所有坐标以此为基准 */
  containerRef: Ref<HTMLElement | null | undefined>;
  /** 拖拽结束回调，参数为归一化后的矩形与附加信息 */
  onSelect: (rect: DragRect, meta: DragSelectMeta) => void;
  /** 是否禁用拖拽（以 getter 传入，保证读到的始终是最新值） */
  disabled?: () => boolean;
  /** 选区遮罩的自定义样式 */
  selectionStyle?: CSSProperties;
}

export interface UseDragSelectResult {
  /** 是否正在拖拽中 */
  dragging: Ref<boolean>;
  /** 选区遮罩样式（配合绝对定位的遮罩元素使用） */
  overlayStyle: ComputedRef<CSSProperties>;
  /** 需要展开到容器的鼠标事件（配合 v-on 使用） */
  containerProps: {
    mousedown: (e: MouseEvent) => void;
    mousemove: (e: MouseEvent) => void;
    mouseup: () => void;
    mouseleave: () => void;
  };
}

/**
 * useDragSelect — 拖拽框选
 *
 * 自 React 版 `_internal/useDragSelect` 移植的组合式函数，供
 * WeekTimeRange / YearCalendar 共用：记录起止坐标 → 拖拽中实时渲染
 * 选区遮罩 → 抬起时回调归一化矩形。
 *
 * 命中判定交给调用方，因为不同网格结构（表格式 / 月块式）的判定方式不同。
 *
 * 性能说明：`mousemove` 的触发频率可高于屏幕刷新率，若每个事件都改状态，
 * 会让整个网格（300+ 个单元格）按事件频率重渲染。此处用 `requestAnimationFrame`
 * 把坐标更新合并为每帧至多一次，使拖拽渲染开销与事件频率解耦。
 */
export function useDragSelect({
  containerRef,
  onSelect,
  disabled,
  selectionStyle,
}: UseDragSelectOptions): UseDragSelectResult {
  const dragging = ref(false);
  const start = ref<DragPoint | null>(null);
  const end = ref<DragPoint | null>(null);
  /** 本次拖拽累计的最大位移，用于区分「单击」与「拖拽」 */
  const movedRef = ref(0);
  /** 最新坐标（尚未提交到状态） */
  const pendingRef = ref<DragPoint | null>(null);
  /** 待执行的 rAF 句柄 */
  const rafRef = ref<number | null>(null);
  /** 拖拽前 body 的 userSelect，结束后恢复 */
  let previousUserSelect: string | null = null;

  /** 把待提交坐标落到状态（每帧至多一次） */
  function flush() {
    rafRef.value = null;
    const point = pendingRef.value;
    if (point) {
      pendingRef.value = null;
      end.value = point;
    }
  }

  function scheduleFlush() {
    if (rafRef.value != null) return;
    rafRef.value = requestAnimationFrame(flush);
  }

  // 拖拽期间禁止文本选中，避免出现浏览器默认的蓝色选区
  watch(dragging, (isDragging) => {
    if (isDragging) {
      previousUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = 'none';
    } else if (previousUserSelect != null) {
      document.body.style.userSelect = previousUserSelect;
      previousUserSelect = null;
    }
  });

  onBeforeUnmount(() => {
    if (rafRef.value != null) cancelAnimationFrame(rafRef.value);
    rafRef.value = null;
    if (previousUserSelect != null) {
      document.body.style.userSelect = previousUserSelect;
      previousUserSelect = null;
    }
  });

  function toRelative(e: MouseEvent): DragPoint {
    const el = containerRef.value;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseDown(e: MouseEvent) {
    if (disabled?.()) return;
    e.preventDefault();
    const point = toRelative(e);
    movedRef.value = 0;
    pendingRef.value = null;
    dragging.value = true;
    start.value = point;
    end.value = point;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging.value) return;
    const point = toRelative(e);
    if (start.value) {
      movedRef.value = Math.max(
        movedRef.value,
        Math.abs(point.x - start.value.x) + Math.abs(point.y - start.value.y),
      );
    }
    pendingRef.value = point;
    scheduleFlush();
  }

  function finish() {
    // 抬起时可能仍有未提交的坐标，直接取用以免选区偏小
    const finalEnd = pendingRef.value ?? end.value;
    pendingRef.value = null;
    if (rafRef.value != null) {
      cancelAnimationFrame(rafRef.value);
      rafRef.value = null;
    }
    dragging.value = false;
    if (start.value && finalEnd) {
      onSelect(
        {
          left: Math.min(start.value.x, finalEnd.x),
          top: Math.min(start.value.y, finalEnd.y),
          right: Math.max(start.value.x, finalEnd.x),
          bottom: Math.max(start.value.y, finalEnd.y),
        },
        { isDrag: movedRef.value >= DRAG_THRESHOLD },
      );
    }
    start.value = null;
    end.value = null;
    movedRef.value = 0;
  }

  function handleMouseLeave() {
    if (dragging.value) finish();
  }

  const overlayStyle = computed<CSSProperties>(() => {
    if (!start.value || !end.value) {
      return { display: 'none' };
    }
    return {
      position: 'absolute',
      pointerEvents: 'none',
      left: `${Math.min(start.value.x, end.value.x)}px`,
      top: `${Math.min(start.value.y, end.value.y)}px`,
      width: `${Math.abs(start.value.x - end.value.x)}px`,
      height: `${Math.abs(start.value.y - end.value.y)}px`,
      ...selectionStyle,
    };
  });

  return {
    dragging,
    overlayStyle,
    containerProps: {
      mousedown: handleMouseDown,
      mousemove: handleMouseMove,
      mouseup: finish,
      mouseleave: handleMouseLeave,
    },
  };
}
