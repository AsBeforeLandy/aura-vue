<template>
  <div :class="prefixCls('year-calendar')" :style="sizeVarStyle">
    <h3 v-if="!props.hideYearTitle" :class="prefixCls('year-calendar-title')">
      {{ year }}年
    </h3>

    <div :class="prefixCls('year-calendar-scroll')">
      <div :class="prefixCls('year-calendar-inner')">
        <!-- 月份标签：位置由实际布局测量得出（测量月首列） -->
        <div :class="prefixCls('year-calendar-months')">
          <div
            v-for="span in spans"
            :key="span.month"
            :class="prefixCls('year-calendar-month-label')"
            :style="
              labelPos[span.month]
                ? {
                    left: `${labelPos[span.month].left}px`,
                    width: `${labelPos[span.month].width}px`,
                  }
                : { visibility: 'hidden' }
            "
          >
            {{ monthLabels[span.month] }}
          </div>
        </div>

        <div :class="prefixCls('year-calendar-main')">
          <div :class="prefixCls('year-calendar-weeks')">
            <div
              v-for="label in labels"
              :key="label"
              :class="prefixCls('year-calendar-week-label')"
            >
              {{ label }}
            </div>
          </div>

          <div
            ref="gridRef"
            :class="prefixCls('year-calendar-grid')"
            v-on="containerProps"
          >
            <div
              v-for="(column, colIndex) in weeks"
              :key="colIndex"
              :class="prefixCls('year-calendar-week')"
              :data-month="
                monthIndexOf(column) >= 0 ? monthIndexOf(column) : undefined
              "
              :style="{
                marginLeft:
                  hasFirstOfMonth(column) && colIndex > 0
                    ? 'var(--aura-yc-month-gap)'
                    : 0,
              }"
            >
              <template v-for="cell in column" :key="cell.date">
                <div
                  v-if="cell.outside"
                  :class="[
                    prefixCls('year-calendar-day'),
                    prefixCls('year-calendar-day-outside'),
                  ]"
                  :style="{ backgroundColor: props.outsideColor }"
                  aria-hidden
                />
                <div
                  v-else
                  :data-date="cell.date"
                  role="checkbox"
                  :aria-checked="selectedSet.has(cell.date)"
                  :aria-label="cell.date"
                  :title="cell.date"
                  :class="dayClass(cell)"
                  :style="{
                    backgroundColor: selectedSet.has(cell.date)
                      ? props.selectedColor
                      : props.color,
                  }"
                  @click="onDayClick(cell.date)"
                />
              </template>
            </div>
            <div
              :class="prefixCls('year-calendar-selection')"
              :style="overlayStyle"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="slots.default || currentValue.length > 0"
      :class="prefixCls('year-calendar-extra')"
    >
      <slot :selected-dates="currentValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  useSlots,
  watch,
  type CSSProperties,
} from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { useDragSelect } from '../_internal/use-drag-select';
import type { DragRect, DragSelectMeta } from '../_internal/use-drag-select';
import {
  buildYearWeeks,
  MONTH_LABELS,
  WEEK_LABELS_MONDAY_FIRST,
  WEEK_LABELS_SUNDAY_FIRST,
} from './utils';
import type { DayCell, WeekColumn } from './utils';
import { yearCalendarProps, type YearCalendarEmits } from './types';
import './style/index.less';

defineOptions({ name: 'AYearCalendar' });

const props = defineProps(yearCalendarProps);
const emit = defineEmits<YearCalendarEmits>();
const slots = useSlots();

const gridRef = ref<HTMLDivElement>();
/** 拖拽结束后抑制紧随其后的 click，避免同一日期被切换两次 */
const suppressClickRef = ref(false);

const year = computed(() => props.year ?? new Date().getFullYear());

const isControlled = computed(() => props.modelValue !== undefined);
const innerValue = ref<string[]>(props.defaultValue ?? []);
const currentValue = computed<string[]>(() =>
  isControlled.value ? (props.modelValue as string[]) : innerValue.value,
);

const selectedSet = computed(() => new Set(currentValue.value));

const yearGrid = computed(() =>
  buildYearWeeks(year.value, props.weekStartsOn as 0 | 1),
);
const weeks = computed<WeekColumn[]>(() => yearGrid.value.weeks);
const spans = computed(() => yearGrid.value.spans);

/**
 * 各月标签的实际位置：渲染后测量「月首列」的布局得出，
 * 因此无论格子尺寸 / 月份间隔如何调整，标签都能精确对齐。
 */
const labelPos = ref<Record<number, { left: number; width: number }>>({});

// 首次测量挂在 onMounted（immediate 的 watch 回调会在 setup 阶段同步执行，
// 早于模板 ref 就绪，React useLayoutEffect 的语义需要这样对应）；
// 依赖变化后走 flush: 'post' 的 watch，在 DOM 更新后、绘制前重测，
// 避免标签位置跳动的闪烁
onMounted(() => measureLabels());
watch(
  [weeks, () => props.year, () => props.cellSize],
  () => {
    measureLabels();
  },
  { flush: 'post' },
);

function measureLabels() {
  const grid = gridRef.value;
  if (!grid) return;
  const cs = getComputedStyle(grid);
  const gap = parseFloat(cs.getPropertyValue('--aura-yc-gap')) || 2;
  const monthGap = parseFloat(cs.getPropertyValue('--aura-yc-month-gap')) || 0;

  const starts = Array.from(grid.querySelectorAll<HTMLElement>('[data-month]'));
  const pos: Record<number, { left: number; width: number }> = {};
  starts.forEach((el, i) => {
    const month = Number(el.dataset.month);
    const left = el.offsetLeft;
    const next = starts[i + 1];
    const width = next
      ? next.offsetLeft - monthGap - gap - left
      : (el.parentElement?.offsetWidth ?? 0) - left;
    pos[month] = { left, width };
  });
  labelPos.value = pos;
}

/** 自定义单元格尺寸：以 CSS 变量注入，矩阵与标签定位全部自动跟随 */
const sizeVarStyle = computed<CSSProperties | undefined>(() =>
  props.cellSize != null
    ? {
        '--aura-yc-cell':
          typeof props.cellSize === 'number'
            ? `${props.cellSize}px`
            : props.cellSize,
      }
    : undefined,
);

const labels = computed(() => {
  if (props.weekLabels) return props.weekLabels;
  return props.weekStartsOn === 1
    ? WEEK_LABELS_MONDAY_FIRST
    : WEEK_LABELS_SUNDAY_FIRST;
});

const monthLabels = computed(() => props.monthLabels ?? MONTH_LABELS);

function commit(next: string[]) {
  if (!isControlled.value) innerValue.value = next;
  emit('update:modelValue', next);
  emit('change', next);
}

/** 按日期升序输出，保证结果稳定可预期 */
const sortDates = (dates: string[]) => [...dates].sort();

function toggleDate(date: string) {
  const next = new Set(selectedSet.value);
  if (next.has(date)) next.delete(date);
  else next.add(date);
  commit(sortDates([...next]));
}

function onDayClick(date: string) {
  if (suppressClickRef.value) return;
  toggleDate(date);
}

/** 拖拽框选：用首个命中的日期决定本次是「选中」还是「取消」 */
function handleDragSelect(rect: DragRect, meta: DragSelectMeta) {
  // 位移未超过阈值视为单击，交给单元格自身的 onClick 处理；
  // 否则同一日期会被拖拽逻辑与 click 各切换一次而相互抵消
  if (!meta.isDrag) return;

  // 真实拖拽后浏览器仍会补发一次 click，这里将其抑制
  suppressClickRef.value = true;
  window.setTimeout(() => {
    suppressClickRef.value = false;
  }, 0);

  const gridEl = gridRef.value;
  if (!gridEl) return;
  const gridRect = gridEl.getBoundingClientRect();

  const hits: string[] = [];
  gridEl.querySelectorAll<HTMLElement>('[data-date]').forEach((cell) => {
    const cellRect = cell.getBoundingClientRect();
    const left = cellRect.left - gridRect.left;
    const top = cellRect.top - gridRect.top;
    const intersect =
      left + cellRect.width >= rect.left &&
      left <= rect.right &&
      top + cellRect.height >= rect.top &&
      top <= rect.bottom;
    if (intersect && cell.dataset.date) hits.push(cell.dataset.date);
  });
  if (!hits.length) return;

  const shouldSelect = !selectedSet.value.has(hits[0]);
  const next = new Set(selectedSet.value);
  hits.forEach((date) => {
    if (shouldSelect) next.add(date);
    else next.delete(date);
  });
  commit(sortDates([...next]));
}

const { overlayStyle, containerProps } = useDragSelect({
  containerRef: gridRef,
  onSelect: handleDragSelect,
  selectionStyle: props.selectionStyle,
});

/** 月首列（包含当月 1 号）：前方留出月份分组间隔 */
function hasFirstOfMonth(column: WeekColumn): boolean {
  return column.some((c) => !c.outside && c.date.endsWith('-01'));
}

/** 存月份索引（0-11），与 spans 的 month 对齐 */
function monthIndexOf(column: WeekColumn): number {
  const firstOfMonth = column.find((c) => !c.outside && c.date.endsWith('-01'));
  return firstOfMonth ? new Date(firstOfMonth.date).getMonth() : -1;
}

function dayClass(cell: DayCell) {
  return classNames(
    prefixCls('year-calendar-day'),
    selectedSet.value.has(cell.date) && prefixCls('year-calendar-day-selected'),
  );
}
</script>
