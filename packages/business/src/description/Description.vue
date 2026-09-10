<template>
  <div :class="prefixCls('description')">
    <div v-if="title" :class="prefixCls('description-title')">{{ title }}</div>

    <!-- 分组模式：块之间用分隔标题与留白区分 -->
    <template v-if="resolvedGroups.length > 0">
      <div
        v-for="(group, gi) in resolvedGroups"
        :key="gi"
        :class="prefixCls('description-group')"
      >
        <div v-if="group.title" :class="prefixCls('description-group-title')">
          {{ group.title }}
        </div>
        <div :class="tableClass">
          <div
            v-for="item in visibleItems(group.items)"
            :key="item.key"
            :class="cellClass(item)"
            :style="cellStyle(item)"
          >
            <div :class="prefixCls('description-label')" :style="labelStyle">
              {{ item.label }}
            </div>
            <div :class="prefixCls('description-value')">
              <component :is="valueNode(item)" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 扁平模式 -->
    <div v-else :class="tableClass">
      <div
        v-for="item in visibleItems(flatItems)"
        :key="item.key"
        :class="cellClass(item)"
        :style="cellStyle(item)"
      >
        <div :class="prefixCls('description-label')" :style="labelStyle">
          {{ item.label }}
        </div>
        <div :class="prefixCls('description-value')">
          <component :is="valueNode(item)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, type VNodeChild } from 'vue';
import { ElTag } from 'element-plus';
import { prefixCls, classNames } from '@aura/shared';
import { formatDate, formatMoney, getByPath } from '../pro-table/utils';
import { descriptionProps, type DescriptionItem } from './types';
import './style/index.less';

defineOptions({ name: 'ADescription' });

const props = defineProps(descriptionProps);

/** 分组模式与扁平模式统一成同一种内部结构，渲染路径只写一次 */
const resolvedGroups = computed(() => props.groups ?? []);
const flatItems = computed(() => props.items ?? []);

const tableClass = computed(() =>
  classNames(
    prefixCls('description-table'),
    props.bordered && 'is-bordered',
    `is-${props.direction}`,
    `is-${props.size}`
  )
);

const labelStyle = computed(() => {
  if (props.direction === 'vertical') return undefined;
  const width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth;
  return { width };
});

/** 有效占列数：不允许超过总列数，否则布局会溢出 */
function effectiveSpan(item: DescriptionItem): number {
  return Math.min(item.span ?? 1, props.columns);
}

function cellClass(item: DescriptionItem) {
  return classNames(prefixCls('description-cell'), `is-span-${effectiveSpan(item)}`);
}

/** 单元格宽度用行内样式，避免为 1-4 列的所有组合穷举类名 */
function cellStyle(item: DescriptionItem) {
  const percent = (effectiveSpan(item) / props.columns) * 100;
  return { flex: `0 0 ${percent}%`, maxWidth: `${percent}%` };
}

function visibleItems(items: DescriptionItem[]) {
  return items.filter((item) => !item.hidden);
}

/** 把描述项的值渲染成节点，渲染优先级与 ProTable 保持一致 */
function valueNode(item: DescriptionItem) {
  return (): VNodeChild => {
    const raw = getByPath(props.data, item.key);

    if (item.render) return item.render({ value: raw, item });

    const empty = item.emptyText ?? props.emptyText;
    if (raw === null || raw === undefined || raw === '') return empty;

    if (item.valueEnum) {
      const matched = item.valueEnum[String(raw)];
      if (!matched) return String(raw);
      return h(ElTag as never, { type: matched.color ?? 'info', size: 'small' }, () => matched.text);
    }

    switch (item.valueType) {
      case 'tag':
        return h(ElTag as never, { type: 'info', size: 'small' }, () => String(raw));
      case 'date':
        return formatDate(raw, item.dateFormat ?? 'YYYY-MM-DD');
      case 'datetime':
        return formatDate(raw, item.dateFormat ?? 'YYYY-MM-DD HH:mm:ss');
      case 'money':
        return formatMoney(raw);
      default:
        // 数组用顿号连接更符合中文详情页的阅读习惯
        if (Array.isArray(raw)) return raw.join('、');
        if (typeof raw === 'object') return JSON.stringify(raw);
        return String(raw);
    }
  };
}
</script>
