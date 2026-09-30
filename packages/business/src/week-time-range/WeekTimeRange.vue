<template>
  <div :class="rootClass" :style="sizeVarStyle">
    <div :class="prefixCls('week-time-range-scroll')">
      <div :class="prefixCls('week-time-range-frame')">
        <!-- 统一网格：表头两行 + 7 个数据行共用一套行列轨道，间隔天然一致 -->
        <div
          ref="bodyRef"
          :class="prefixCls('week-time-range-matrix')"
          :style="gridStyle"
          v-on="containerProps"
        >
          <!-- 表头行 1：角标签跨两行（与小时刻度行合并），文本居中 -->
          <div :class="prefixCls('week-time-range-corner')">星期/时间</div>
          <div
            :class="prefixCls('week-time-range-half')"
            :style="{ gridColumn: `span ${halfSlots}` }"
          >
            00:00-12:00
          </div>
          <div
            :class="prefixCls('week-time-range-half')"
            :style="{ gridColumn: `span ${halfSlots}` }"
          >
            12:00-24:00
          </div>

          <!-- 表头行 2：小时刻度（第 1 列已被角标签占据） -->
          <div
            v-for="hour in 24"
            :key="hour"
            :class="prefixCls('week-time-range-hour')"
            :style="{ gridColumn: `span ${slotsPerHour}` }"
          >
            {{ hour - 1 }}
          </div>

          <!-- 数据行：星期标签 + 时间格 -->
          <template v-for="(label, dayIndex) in labels" :key="label">
            <div :class="prefixCls('week-time-range-week')">{{ label }}</div>
            <div
              v-for="(slot, slotIndex) in slots"
              :key="slot.label"
              :data-slot="`${dayIndex}-${slotIndex}`"
              :title="`${label} ${slot.label}`"
              :class="cellClass(dayIndex, slotIndex)"
              :style="
                isCellSelected(dayIndex, slotIndex)
                  ? { backgroundColor: props.color }
                  : undefined
              "
              @click="onCellClick(dayIndex, slotIndex)"
            />
          </template>
          <div
            :class="prefixCls('week-time-range-selection')"
            :style="overlayStyle"
          />
        </div>

        <!-- 底部摘要（宽度与矩阵保持一致） -->
        <div
          v-if="props.showSummary"
          :class="prefixCls('week-time-range-summary')"
        >
          <div :class="prefixCls('week-time-range-summary-head')">
            <span>
              {{
                selectedDayCount
                  ? `已选择 ${selectedDayCount} 天的时间段`
                  : '可拖拽鼠标框选时间段'
              }}
            </span>
            <button
              type="button"
              :class="prefixCls('week-time-range-clear')"
              :disabled="props.disabled || !selectedDayCount"
              @click="commit(createEmptyValue())"
            >
              清空
            </button>
          </div>
          <template
            v-for="(ranges, dayIndex) in currentValue"
            :key="labels[dayIndex]"
          >
            <div
              v-if="ranges.length > 0"
              :class="prefixCls('week-time-range-summary-row')"
            >
              <span :class="prefixCls('week-time-range-summary-label')">
                {{ labels[dayIndex] }}：
              </span>
              <span>{{
                ranges.map((r) => `${r.start}-${r.end}`).join('、')
              }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue';
import { classNames, prefixCls } from '@aura/shared';
import { useDragSelect } from '../_internal/use-drag-select';
import type { DragRect, DragSelectMeta } from '../_internal/use-drag-select';
import {
  buildSlots,
  createEmptyValue,
  formatMinutes,
  isCovered,
  mergeRanges,
  subtractRange,
  WEEK_LABELS_MONDAY_FIRST,
  WEEK_LABELS_SUNDAY_FIRST,
} from './utils';
import type { WeekTimeRangeValue } from './utils';
import { weekTimeRangeProps, type WeekTimeRangeEmits } from './types';
import './style/index.less';

defineOptions({ name: 'AWeekTimeRange' });

const props = defineProps(weekTimeRangeProps);
const emit = defineEmits<WeekTimeRangeEmits>();

const bodyRef = ref<HTMLDivElement>();
/** 拖拽结束后抑制紧随其后的 click，避免同一时段被切换两次 */
const suppressClickRef = ref(false);

/** 自定义单元格尺寸：以 CSS 变量注入，矩阵与表头自动跟随 */
const sizeVarStyle = computed<CSSProperties | undefined>(() => {
  if (props.cellWidth == null && props.cellHeight == null) return undefined;
  const toSize = (v: number | string | undefined) =>
    v == null ? undefined : typeof v === 'number' ? `${v}px` : v;
  return {
    ...(props.cellWidth != null
      ? { '--aura-wtr-cell-width': toSize(props.cellWidth) }
      : null),
    ...(props.cellHeight != null
      ? { '--aura-wtr-cell-height': toSize(props.cellHeight) }
      : null),
  };
});

const isControlled = computed(() => props.modelValue !== undefined);
const innerValue = ref<WeekTimeRangeValue>(
  props.defaultValue ?? createEmptyValue(),
);
const currentValue = computed<WeekTimeRangeValue>(() =>
  isControlled.value
    ? (props.modelValue as WeekTimeRangeValue)
    : innerValue.value,
);

const slots = computed(() => buildSlots(props.stepMinutes));
const slotsPerHour = computed(() => 60 / props.stepMinutes);
const halfSlots = computed(() => slots.value.length / 2);

const labels = computed(() => {
  if (props.weekLabels) return props.weekLabels;
  return props.weekStartsOn === 1
    ? WEEK_LABELS_MONDAY_FIRST
    : WEEK_LABELS_SUNDAY_FIRST;
});

function commit(next: WeekTimeRangeValue) {
  if (!isControlled.value) innerValue.value = next;
  emit('update:modelValue', next);
  emit('change', next);
}

/** 单击切换单个槽 */
function toggleSlot(dayIndex: number, slotIndex: number) {
  if (props.disabled) return;
  const target: [number, number] = [
    slots.value[slotIndex].start,
    slots.value[slotIndex].end,
  ];
  const next = currentValue.value.map((ranges, i) => {
    if (i !== dayIndex) return ranges;
    return isCovered(ranges, target)
      ? subtractRange(ranges, target)
      : mergeRanges([
          ...ranges,
          {
            start: formatMinutes(target[0]),
            end: formatMinutes(target[1]),
          },
        ]);
  });
  commit(next);
}

/** 拖拽框选：用首个命中的槽决定本次是「选中」还是「取消」 */
function handleDragSelect(rect: DragRect, meta: DragSelectMeta) {
  // 位移未超过阈值视为单击，交给单元格自身的 onClick 处理；
  // 否则同一时段会被拖拽逻辑与 click 各切换一次而相互抵消
  if (!meta.isDrag) return;

  // 真实拖拽后浏览器仍会补发一次 click，这里将其抑制
  suppressClickRef.value = true;
  window.setTimeout(() => {
    suppressClickRef.value = false;
  }, 0);

  const bodyEl = bodyRef.value;
  if (!bodyEl) return;
  const bodyRect = bodyEl.getBoundingClientRect();

  const hits: Array<{ day: number; slot: number }> = [];
  bodyEl.querySelectorAll<HTMLElement>('[data-slot]').forEach((cell) => {
    const cellRect = cell.getBoundingClientRect();
    const left = cellRect.left - bodyRect.left;
    const top = cellRect.top - bodyRect.top;
    const intersect =
      left + cellRect.width >= rect.left &&
      left <= rect.right &&
      top + cellRect.height >= rect.top &&
      top <= rect.bottom;
    if (!intersect) return;
    const [day, slot] = (cell.dataset.slot ?? '').split('-').map(Number);
    hits.push({ day, slot });
  });
  if (!hits.length) return;

  const first = hits[0];
  const shouldSelect = !isCovered(currentValue.value[first.day] ?? [], [
    slots.value[first.slot].start,
    slots.value[first.slot].end,
  ]);

  const grouped = new Map<number, number[]>();
  hits.forEach(({ day, slot }) => {
    const list = grouped.get(day);
    if (list) list.push(slot);
    else grouped.set(day, [slot]);
  });

  const next = currentValue.value.map((ranges) => ranges);
  grouped.forEach((slotIndexes, day) => {
    let ranges = next[day] ?? [];
    if (shouldSelect) {
      ranges = mergeRanges([
        ...ranges,
        ...slotIndexes.map((i) => ({
          start: formatMinutes(slots.value[i].start),
          end: formatMinutes(slots.value[i].end),
        })),
      ]);
    } else {
      ranges = slotIndexes.reduce(
        (acc, i) =>
          subtractRange(acc, [slots.value[i].start, slots.value[i].end]),
        ranges,
      );
    }
    next[day] = ranges;
  });
  commit(next);
}

const { overlayStyle, containerProps } = useDragSelect({
  containerRef: bodyRef,
  onSelect: handleDragSelect,
  disabled: () => props.disabled,
});

const selectedDayCount = computed(
  () => currentValue.value.filter((ranges) => ranges.length > 0).length,
);

function isCellSelected(dayIndex: number, slotIndex: number): boolean {
  return isCovered(currentValue.value[dayIndex] ?? [], [
    slots.value[slotIndex].start,
    slots.value[slotIndex].end,
  ]);
}

function cellClass(dayIndex: number, slotIndex: number) {
  return classNames(
    prefixCls('week-time-range-cell'),
    isCellSelected(dayIndex, slotIndex) &&
      prefixCls('week-time-range-cell-selected'),
  );
}

function onCellClick(dayIndex: number, slotIndex: number) {
  if (suppressClickRef.value) return;
  toggleSlot(dayIndex, slotIndex);
}

// 列宽通过 CSS 变量暴露，可在外部覆盖调整（见 index.less）
const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: `var(--aura-wtr-label-width) repeat(${slots.value.length}, var(--aura-wtr-cell-width))`,
}));

const rootClass = computed(() =>
  classNames(
    prefixCls('week-time-range'),
    props.disabled && prefixCls('week-time-range--disabled'),
  ),
);
</script>
