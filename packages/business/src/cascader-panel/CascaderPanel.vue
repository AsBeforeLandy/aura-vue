<template>
  <div ref="scrollRef" :class="prefixCls('cascader-panel')">
    <template v-for="col in columns" :key="col.level">
      <div v-if="col.opts.length" :class="prefixCls('cascader-panel-column')">
        <div
          v-if="columnTitle(col.level)"
          :class="prefixCls('cascader-panel-column-title')"
        >
          {{ columnTitle(col.level) }}
        </div>

        <ElCheckbox
          :class="prefixCls('cascader-panel-check-all')"
          :model-value="allSelected(col.opts)"
          :indeterminate="someSelected(col.opts) && !allSelected(col.opts)"
          @update:model-value="
            (checked: boolean | string | number) =>
              handleCheckLevelAll(Boolean(checked), col.opts)
          "
        >
          全选
        </ElCheckbox>

        <div :class="prefixCls('cascader-panel-column-list')">
          <div
            v-for="option in col.opts"
            :key="option.value"
            :class="optionClass(col.level, option)"
            @click="handleSelect(col.level, option)"
          >
            <div :class="prefixCls('cascader-panel-option-main')">
              <ElCheckbox
                :model-value="isChecked(option.value)"
                :indeterminate="
                  someSelected(option.children ?? []) &&
                  !isChecked(option.value)
                "
                @update:model-value="
                  (checked: boolean | string | number) =>
                    handleCheck(Boolean(checked), option, col.level, true)
                "
                @click.stop
              />
              <ElTooltip
                :content="option.tooltips ?? ''"
                :disabled="!option.tooltips"
                :show-after="500"
                placement="top"
              >
                <span :class="prefixCls('cascader-panel-option-label')">
                  {{ option.label }}
                </span>
              </ElTooltip>
            </div>
            <span
              v-if="option.children?.length"
              :class="prefixCls('cascader-panel-option-arrow')"
            >
              ›
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElCheckbox, ElTooltip } from 'element-plus';
import { classNames, prefixCls } from '@aura/shared';
import {
  collectSubtree,
  expandWithDescendants,
  pickTopSelected,
  refreshTreeStates,
} from './utils';
import type { CascaderOption } from './utils';
import { cascaderPanelProps, type CascaderPanelEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ACascaderPanel' });

const props = defineProps(cascaderPanelProps);
const emit = defineEmits<CascaderPanelEmits>();

const scrollRef = ref<HTMLDivElement>();

/** 展开路径：每一级当前点开的选项 */
const selectedPaths = ref<CascaderOption[]>([]);
/** 选中值（含级联子孙） */
const selectedValues = ref<string[]>([]);
/** 半选值（父级的部分子级被选中） */
const indeterminateValues = ref<string[]>([]);

/**
 * 同步受控 modelValue
 *
 * 直接以 options / modelValue 为依赖，不做整树 JSON 序列化签名：
 * 序列化成本随节点数线性增长，是大数据量下的热点。
 */
watch(
  [() => props.options, () => props.modelValue],
  () => {
    if (props.modelValue) {
      selectedValues.value = [
        ...expandWithDescendants(props.options, new Set(props.modelValue)),
      ];
    }
  },
  { immediate: true, deep: true },
);

/** 提交一次状态变更：重算树状态并只触发一次对外事件 */
function commit(values: Iterable<string>, indeterminate: Iterable<string>) {
  selectedValues.value = [...values];
  indeterminateValues.value = [...indeterminate];
  const selected = new Set(values);
  const result = pickTopSelected(props.options, selected);
  emit('update:modelValue', result.selectedValues);
  emit('change', result.selectedValues, result.selectedOptions);
}

/** 选中态的 Set 视图：把逐项 includes 的 O(n) 查找降为 O(1) */
const selectedSet = computed(() => new Set(selectedValues.value));

function isChecked(value: string): boolean {
  return selectedSet.value.has(value);
}

function allSelected(opts: CascaderOption[]): boolean {
  return opts.every((opt) => selectedSet.value.has(opt.value));
}

function someSelected(opts: CascaderOption[]): boolean {
  return opts.some(
    (opt) =>
      selectedSet.value.has(opt.value) ||
      (opt.children?.length ? someSelected(opt.children) : false),
  );
}

/** 沿展开路径得到列描述：首列固定为 options，之后跟随展开路径下钻 */
const columns = computed(() => {
  const list: { opts: CascaderOption[]; level: number }[] = [];
  let current: CascaderOption[] = props.options;

  for (let level = 0; level <= selectedPaths.value.length; level += 1) {
    list.push({ opts: current, level });
    const next = selectedPaths.value[level];
    if (next?.children) {
      current = next.children;
    } else {
      break;
    }
  }
  return list;
});

function columnTitle(level: number): string {
  return level === 0
    ? props.title
    : (selectedPaths.value[level - 1]?.label ?? '');
}

function optionClass(
  level: number,
  option: CascaderOption,
): string | unknown[] {
  return classNames(
    prefixCls('cascader-panel-option'),
    selectedPaths.value[level]?.value === option.value &&
      prefixCls('cascader-panel-option-active'),
  );
}

/** 点开某一级：截断展开路径并自动向右滚动 */
function handleSelect(level: number, option: CascaderOption) {
  scrollRef.value?.scrollBy?.({
    left: level * 212,
    behavior: 'smooth',
  });
  selectedPaths.value = [...selectedPaths.value.slice(0, level), option];
  emit('current-click', option);
}

/** 勾选 / 取消勾选：级联作用于整棵子树，全树重算状态，单次提交 */
function handleCheck(
  checked: boolean,
  option: CascaderOption,
  level: number,
  alsoExpand?: boolean,
) {
  if (alsoExpand) handleSelect(level, option);

  const values = new Set(selectedValues.value);
  const subtree = new Set<string>();
  collectSubtree(option, subtree);

  if (checked) {
    subtree.forEach((val) => values.add(val));
  } else {
    subtree.forEach((val) => values.delete(val));
  }

  const state = refreshTreeStates(
    props.options,
    values,
    new Set(indeterminateValues.value),
  );
  commit(state.values, state.indeterminate);
}

/** 整列全选 / 取消全选（含全部子孙） */
function handleCheckLevelAll(checked: boolean, opts: CascaderOption[]) {
  const values = new Set(selectedValues.value);
  const subtree = new Set<string>();
  opts.forEach((opt) => collectSubtree(opt, subtree));

  if (checked) {
    subtree.forEach((val) => values.add(val));
  } else {
    subtree.forEach((val) => values.delete(val));
  }

  const state = refreshTreeStates(
    props.options,
    values,
    new Set(indeterminateValues.value),
  );
  commit(state.values, state.indeterminate);
}
</script>
