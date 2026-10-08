<template>
  <div :class="prefixCls('tabs')">
    <div role="tablist" :class="prefixCls('tabs-list')" @keydown="onKeydown">
      <button
        v-for="item in items"
        :id="tabId(item.value)"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="item.value === fallbackValue"
        :aria-controls="panelId(item.value)"
        :tabindex="item.value === fallbackValue ? 0 : -1"
        :disabled="item.disabled"
        :class="tabCls(item)"
        @click="select(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <!--
      面板按 value 从具名插槽 `panel-<value>` 取内容，只渲染当前激活项
      （懒渲染，切换即重建；需要保活的场景请用 tab-only 用法自行 v-show）。
      没有对应插槽时该标签退化为「纯导航 tab」，不带 aria-controls 对应的面板。
    -->
    <div
      v-if="activeItem && hasPanel(activeItem.value)"
      :id="panelId(activeItem.value)"
      role="tabpanel"
      :aria-labelledby="tabId(activeItem.value)"
      :class="prefixCls('tabs-panel')"
    >
      <slot :name="panelSlot(activeItem.value)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { useControllable } from '../composables/use-controllable';
import { tabsProps, type TabItem, type TabsEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ATabs' });

const props = defineProps(tabsProps);
const emit = defineEmits<TabsEmits>();
const slots = useSlots();

let uid = 0;
const listId = `aura-tabs-${++uid}`;
const tabId = (value: string) => `${listId}-tab-${value}`;
const panelId = (value: string) => `${listId}-panel-${value}`;
const panelSlot = (value: string) => `panel-${value}`;
const hasPanel = (value: string) => Boolean(slots[panelSlot(value)]);

const activeValue = useControllable<string>(props, emit);
const fallbackValue = computed(
  () => activeValue.value ?? enabledItems.value[0]?.value,
);

/** 默认选中「第一个可用项」：第一项被禁用时不能成为初始选中 */
const enabledItems = computed(() => props.items.filter((i) => !i.disabled));

const activeItem = computed(() =>
  props.items.find((item) => item.value === fallbackValue.value),
);

function select(next: string) {
  const item = props.items.find((i) => i.value === next);
  if (!item || item.disabled || next === fallbackValue.value) return;
  activeValue.value = next;
  emit('change', next);
}

/** roving tabindex + 左右方向键在**可用项**之间循环（跳过禁用项） */
function onKeydown(evt: KeyboardEvent) {
  const candidates = enabledItems.value;
  if (candidates.length < 2) return;
  if (evt.key !== 'ArrowLeft' && evt.key !== 'ArrowRight') return;
  evt.preventDefault();

  const current = candidates.findIndex((i) => i.value === fallbackValue.value);
  const base = current === -1 ? 0 : current;
  const delta = evt.key === 'ArrowRight' ? 1 : -1;
  const next =
    candidates[(base + delta + candidates.length) % candidates.length];

  select(next.value);
}

const tabCls = (item: TabItem) =>
  classNames(
    prefixCls('tabs-tab'),
    item.value === fallbackValue.value && prefixCls('tabs-tab--active'),
    item.disabled && prefixCls('tabs-tab--disabled'),
  );
</script>
