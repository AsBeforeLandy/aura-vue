<template>
  <div :class="prefixCls('pro-table')">
    <!-- 查询区：由 columns 中未标记 hideInSearch 的列自动生成 -->
    <div v-if="showSearch && searchColumns.length > 0" :class="prefixCls('pro-table-search')">
      <ElForm
        :model="searchForm"
        label-width="auto"
        @submit.prevent
      >
        <ElRow :gutter="16">
          <ElCol
            v-for="col in visibleSearchColumns"
            :key="col.key"
            :xs="24"
            :sm="12"
            :md="col.searchFullWidth ? 24 : 24 / searchSpan"
          >
            <ElFormItem :label="searchLabel(col)">
              <ElSelect
                v-if="col.searchType === 'select'"
                v-model="searchForm[col.key]"
                :placeholder="searchPlaceholder(col)"
                clearable
                style="width: 100%"
              >
                <ElOption
                  v-for="opt in bindSearchOptions(col)"
                  :key="String(opt.value)"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>
              <ElDatePicker
                v-else-if="col.searchType === 'dateRange'"
                v-model="searchForm[col.key]"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                style="width: 100%"
              />
              <ElDatePicker
                v-else-if="col.searchType === 'date'"
                v-model="searchForm[col.key]"
                type="date"
                :placeholder="searchPlaceholder(col)"
                clearable
                style="width: 100%"
              />
              <ElInputNumber
                v-else-if="col.searchType === 'number'"
                v-model="searchForm[col.key]"
                :placeholder="searchPlaceholder(col)"
                controls-position="right"
                style="width: 100%"
              />
              <ElInput
                v-else
                v-model="searchForm[col.key]"
                :placeholder="searchPlaceholder(col)"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="24 / searchSpan">
            <ElFormItem>
              <div :class="prefixCls('pro-table-search-actions')">
                <ElButton type="primary" :icon="Search" @click="handleSearch">
                  查询
                </ElButton>
                <ElButton :icon="RefreshLeft" @click="handleReset">重置</ElButton>
                <ElButton
                  v-if="searchColumns.length > searchSpan"
                  link
                  type="primary"
                  @click="searchCollapsed = !searchCollapsed"
                >
                  {{ searchCollapsed ? '展开' : '收起' }}
                  <ElIcon :class="searchArrowClass">
                    <ArrowDown />
                  </ElIcon>
                </ElButton>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <!-- 主体卡片 -->
    <div :class="prefixCls('pro-table-card')">
      <div v-if="showToolbar" :class="prefixCls('pro-table-toolbar')">
        <div :class="prefixCls('pro-table-toolbar-title')">
          <slot name="title">{{ title }}</slot>
        </div>
        <div :class="prefixCls('pro-table-toolbar-actions')">
          <slot name="toolbar" />
          <ElTooltip v-if="toolbar?.reload !== false" content="刷新" placement="top">
            <ElButton circle :icon="Refresh" @click="reload()" />
          </ElTooltip>
          <ElDropdown
            v-if="toolbar?.density !== false"
            trigger="click"
            @command="(cmd: string) => (tableSize = cmd as ProTableSize)"
          >
            <ElTooltip content="密度" placement="top">
              <ElButton circle :icon="Rank" />
            </ElTooltip>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="large">宽松</ElDropdownItem>
                <ElDropdownItem command="default">默认</ElDropdownItem>
                <ElDropdownItem command="small">紧凑</ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          <ElPopover
            v-if="toolbar?.columnSetting !== false"
            trigger="click"
            placement="bottom-end"
            :width="200"
          >
            <template #reference>
              <ElTooltip content="列设置" placement="top">
                <ElButton circle :icon="Setting" />
              </ElTooltip>
            </template>
            <div :class="prefixCls('pro-table-column-setting')">
              <ElCheckbox
                v-for="col in settingColumns"
                :key="col.key"
                :model-value="!hiddenColumnKeys.includes(col.key)"
                @update:model-value="
                  (checked: boolean | string | number) =>
                    toggleColumn(col.key, Boolean(checked))
                "
              >
                {{ col.title }}
              </ElCheckbox>
            </div>
          </ElPopover>
        </div>
      </div>

      <ElTable
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :row-key="rowKey"
        :size="tableSize"
        :stripe="stripe"
        :border="border"
        :empty-text="emptyText"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <ElTableColumn
          v-if="rowSelection"
          type="selection"
          width="48"
          :reserve-selection="true"
        />
        <ElTableColumn
          v-for="col in visibleColumns"
          :key="col.key"
          :prop="col.key"
          :label="col.title"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :sortable="col.sortable ? 'custom' : false"
          :align="col.align ?? 'left'"
          :show-overflow-tooltip="col.ellipsis"
        >
          <template #header>
            <span>{{ col.title }}</span>
            <ElTooltip v-if="col.tip" :content="col.tip" placement="top">
              <ElIcon :class="prefixCls('pro-table-header-tip')"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </template>
          <template #default="scope">
            <component :is="renderCellNode(col, scope)" />
          </template>
        </ElTableColumn>
        <template #empty>
          <ElEmpty :description="emptyText" :image-size="72" />
        </template>
      </ElTable>

      <div
        v-if="paginationConfig && tableData.length > 0"
        :class="prefixCls('pro-table-pagination')"
      >
        <ElPagination
          :current-page="paginationState.current"
          :page-size="paginationState.pageSize"
          :total="paginationState.total"
          :page-sizes="paginationConfig.pageSizes ?? [10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive, useSlots, watch, h } from 'vue';
import {
  ElButton,
  ElCheckbox,
  ElCol,
  ElDatePicker,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElPagination,
  ElPopover,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTooltip,
  vLoading
} from 'element-plus';
import { ArrowDown, QuestionFilled, Rank, Refresh, RefreshLeft, Search, Setting } from '@element-plus/icons-vue';
import { prefixCls, classNames } from '@aura/shared';
import {
  proTableProps,
  type ProTableColumn,
  type ProTableEmits,
  type ProTableInstance,
  type ProTablePagination,
  type ProTableRequestParams,
  type ProTableSize
} from './types';
import { clonePlain, omitEmpty, pickSearchItems, renderCell } from './utils';
import './style/index.less';

defineOptions({ name: 'AProTable' });

const props = defineProps(proTableProps);
const emit = defineEmits<ProTableEmits>();

const tableRef = ref();
const loading = ref(false);
const tableData = ref<Record<string, unknown>[]>([]);
const tableSize = ref<ProTableSize>(props.size);
const hiddenColumnKeys = ref<string[]>([]);
const searchCollapsed = ref(props.searchDefaultCollapsed);
const selectedRows = ref<Record<string, unknown>[]>([]);

/** 分页状态：与 props.pagination 合并，缺省补齐 current / pageSize */
const paginationState = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

const paginationConfig = computed<ProTablePagination | null>(() => {
  if (props.pagination === false) return null;
  return props.pagination ?? {};
});

/** columns 中参与查询的项 */
const searchColumns = computed(() => pickSearchItems(props.columns as ProTableColumn[]));

/** 折叠时只显示前 searchSpan 项 */
const visibleSearchColumns = computed(() =>
  searchCollapsed.value
    ? searchColumns.value.slice(0, props.searchSpan)
    : searchColumns.value
);

const showSearch = computed(() => props.search && searchColumns.value.length > 0);

const showToolbar = computed(() => {
  const t = props.toolbar ?? {};
  const hasButton = t.reload !== false || t.density !== false || t.columnSetting !== false;
  return Boolean(props.title) || hasButton || Boolean(useSlots().toolbar);
});

/** 列设置面板里的候选项：隐藏列也应可选，故用全部列 */
const settingColumns = computed(() =>
  (props.columns as ProTableColumn[]).filter((col) => !col.hideInTable)
);

/** 实际渲染的列：排除 hideInTable 与用户手动隐藏的列 */
const visibleColumns = computed(() =>
  (props.columns as ProTableColumn[]).filter(
    (col) => !col.hideInTable && !hiddenColumnKeys.value.includes(col.key)
  )
);

/** 查询表单：以 columns 中参与查询的 key 初始化。
 *  这里刻意用宽松类型——查询控件的 model 值域横跨 string/number/Date/array，
 *  用 unknown 会让 EP 控件的 v-model 类型校验失败，闭包内是运行时校验的边界。 */
const searchForm = reactive<Record<string, any>>({});
function initSearchForm() {
  for (const col of searchColumns.value) {
    if (!(col.key in searchForm)) searchForm[col.key] = undefined;
  }
}

/** 供模板使用的渲染节点：包一层函数组件，把 renderCell 结果变成真正的 VNode */
function renderCellNode(col: ProTableColumn, scope: { row: Record<string, unknown>; $index: number }) {
  return () => renderCell(col, { row: scope.row, value: scope.row[col.key], index: scope.$index });
}

/** 展开箭头：展开状态时旋转 180° */
const searchArrowClass = computed(() =>
  classNames(prefixCls('pro-table-search-arrow'), !searchCollapsed.value && 'is-open')
);

/** 把 valueEnum 转成 select 可用的 options */
function enumToOptions(valueEnum: NonNullable<ProTableColumn['valueEnum']>) {
  return Object.entries(valueEnum).map(([value, item]) => ({ label: item.text, value }));
}

/** select 的候选项：优先用 searchOptions，其次从 valueEnum 推导 */
function bindSearchOptions(col: ProTableColumn): Array<{ label: string; value: string | number }> {
  if (col.searchOptions?.length) return col.searchOptions;
  if (col.valueEnum) return enumToOptions(col.valueEnum);
  return [];
}

function searchLabel(col: ProTableColumn): string {
  return col.title;
}

function searchPlaceholder(col: ProTableColumn): string {
  if (col.searchPlaceholder) return col.searchPlaceholder;
  const prefix = col.searchType === 'select' ? '请选择' : '请输入';
  return `${prefix}${col.title}`;
}

/** 组装请求参数：分页 + 查询 + 排序，并剔除空值 */
function buildParams(): ProTableRequestParams {
  return {
    current: paginationState.current,
    pageSize: paginationState.pageSize,
    search: omitEmpty(clonePlain(searchForm)),
    sort: sortState.value
  };
}

const sortState = ref<{ field: string; order: 'asc' | 'desc' } | undefined>(undefined);

/** 核心取数逻辑：request 模式走网络，data 模式走本地切片 */
async function load() {
  if (!props.request) {
    // 受控数据模式：只负责渲染，分页信息交给外部维护
    tableData.value = props.data ?? [];
    paginationState.total = props.data?.length ?? 0;
    return;
  }

  loading.value = true;
  if (props.clearOnReload) tableData.value = [];
  try {
    const result = await props.request(buildParams());
    if (result.success === false) return;
    tableData.value = result.data ?? [];
    paginationState.total = result.total ?? 0;
    emit('loaded', { data: tableData.value, total: paginationState.total });
  } catch (error) {
    emit('error', error);
  } finally {
    loading.value = false;
  }
}

/** 对外暴露：刷新当前页 */
async function reload() {
  await load();
}

/** 对外暴露：回到第一页并刷新（查询后使用） */
async function reloadAndReset() {
  paginationState.current = 1;
  await load();
}

function handleSearch() {
  emit('search', omitEmpty(clonePlain(searchForm)));
  reloadAndReset();
}

function handleReset() {
  for (const key of Object.keys(searchForm)) searchForm[key] = undefined;
  sortState.value = undefined;
  emit('search', {});
  reloadAndReset();
}

function handleCurrentChange(page: number) {
  paginationState.current = page;
  emit('page-change', { current: page, pageSize: paginationState.pageSize });
  load();
}

function handleSizeChange(size: number) {
  paginationState.pageSize = size;
  // 改变每页条数后回到第一页，否则可能落在空页
  paginationState.current = 1;
  emit('page-change', { current: 1, pageSize: size });
  load();
}

function handleSelectionChange(rows: Record<string, unknown>[]) {
  selectedRows.value = rows;
  emit('selection-change', rows);
}

function handleSortChange(payload: { prop: string | null; order: string | null }) {
  sortState.value =
    payload.order && payload.prop
      ? { field: payload.prop, order: payload.order === 'ascending' ? 'asc' : 'desc' }
      : undefined;
  reloadAndReset();
}

function toggleColumn(key: string, visible: boolean) {
  if (visible) {
    hiddenColumnKeys.value = hiddenColumnKeys.value.filter((k) => k !== key);
  } else if (!hiddenColumnKeys.value.includes(key)) {
    // 至少保留一列，否则表格会变成空白
    if (visibleColumns.value.length <= 1) return;
    hiddenColumnKeys.value = [...hiddenColumnKeys.value, key];
  }
}

function clearSelection() {
  tableRef.value?.clearSelection?.();
  selectedRows.value = [];
}

function getSearchValues() {
  return clonePlain(searchForm);
}

function setSearchValues(values: Record<string, unknown>) {
  Object.assign(searchForm, values);
}

/** 获取当前表格数据（供外部读取渲染结果，也便于测试断言） */
function getData() {
  return tableData.value;
}

/** 获取当前选中的行 */
function getSelectedRows() {
  return selectedRows.value;
}

/** 恢复用户持久化的列显示偏好 */
function setHiddenColumns(keys: string[]) {
  hiddenColumnKeys.value = [...keys];
}

defineExpose<ProTableInstance>({
  reload,
  reloadAndReset,
  clearSelection,
  getSearchValues,
  setSearchValues,
  getData,
  getSelectedRows,
  setHiddenColumns
});

// columns 变化时补齐查询表单字段（动态列场景）
watch(
  () => props.columns,
  () => initSearchForm(),
  { deep: true }
);

// 外部传入 pagination 时同步内部状态
watch(
  () => props.pagination,
  (val) => {
    if (val && typeof val === 'object') {
      if (val.current !== undefined) paginationState.current = val.current;
      if (val.pageSize !== undefined) paginationState.pageSize = val.pageSize;
      if (val.total !== undefined) paginationState.total = val.total;
    }
  },
  { immediate: true, deep: true }
);

// 受控数据变化时同步到表格
watch(
  () => props.data,
  (val) => {
    if (!props.request) {
      tableData.value = val ?? [];
      paginationState.total = val?.length ?? 0;
    }
  },
  { immediate: true }
);

watch(
  () => props.size,
  (val) => (tableSize.value = val)
);

onMounted(() => {
  initSearchForm();
  if (props.request) load();
});

// 供模板使用的空组件引用，避免 eslint 未使用告警
void h;
</script>
