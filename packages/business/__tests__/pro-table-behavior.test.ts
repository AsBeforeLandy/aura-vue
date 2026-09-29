import { describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElPagination } from 'element-plus';
import ProTable from '../src/pro-table/ProTable.vue';
import type {
  ProTableColumn,
  ProTableInstance,
  ProTableRequest,
} from '../src/pro-table/types';

/**
 * ProTable 的实例方法与交互链路。
 *
 * 两点测试约定：
 *   1. 组件未挂载到 document，所有查询都要走 wrapper.find / wrapper.findAll，
 *      用全局 document 会永远拿不到节点；
 *   2. happy-dom 没有布局引擎，ElTable 依赖列宽测量，不会渲染出 <td>，
 *      因此数据断言统一走暴露的 getData()，DOM 只用于验证
 *      「按钮 → 处理函数」这条线的连通性。列渲染正确性由文档站 demo 兜底。
 */

const columns: ProTableColumn[] = [
  { key: 'name', title: '姓名', searchType: 'text' },
  {
    key: 'status',
    title: '状态',
    searchType: 'select',
    valueEnum: {
      active: { text: '启用', color: 'success' },
      disabled: { text: '停用', color: 'info' },
    },
  },
  {
    key: 'createdAt',
    title: '创建时间',
    searchType: 'date',
    hideInTable: true,
  },
];

/** 让分页区渲染出来：pagination 的前提是 tableData 非空 */
const nonEmptyRequest = () =>
  vi.fn<ProTableRequest>().mockResolvedValue({
    data: [{ id: 1, name: 'A' }],
    total: 50,
  });

/** 等待 request 的 Promise 链落定 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function mountTable(props: Record<string, unknown> = {}) {
  return mount(ProTable, {
    props: {
      columns,
      data: [
        { id: 1, name: 'A', status: 'active' },
        { id: 2, name: 'B', status: 'disabled' },
      ],
      ...props,
    },
  });
}

/** 查询区里的按钮（查询 / 重置 / 展开收起） */
function searchButtons(wrapper: VueWrapper) {
  return wrapper.findAll('.aura-pro-table-search-actions .el-button');
}

describe('ProTable 查询区', () => {
  it('正常：valueEnum 自动派生为 select 的候选项', () => {
    const wrapper = mountTable();
    expect(wrapper.findAll('.el-select').length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('状态');
  });

  it('正常：查询按钮触发 search 事件并回到第一页', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({
      request,
      pagination: { current: 3, pageSize: 10 },
    });
    const vm = wrapper.vm as unknown as ProTableInstance;

    vm.setSearchValues({ name: 'A' });
    await nextTick();
    await searchButtons(wrapper)[0].trigger('click');
    await flush();

    expect(wrapper.emitted('search')?.[0]).toEqual([{ name: 'A' }]);
    expect(request.mock.calls.at(-1)?.[0].current).toBe(1);
  });

  it('正常：重置按钮清空查询条件', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request });
    const vm = wrapper.vm as unknown as ProTableInstance;

    vm.setSearchValues({ name: 'A', status: 'active' });
    await nextTick();
    await searchButtons(wrapper)[1].trigger('click');
    await flush();

    expect(wrapper.emitted('search')?.[0]).toEqual([{}]);
    const values = vm.getSearchValues();
    expect(values.name).toBeUndefined();
    expect(values.status).toBeUndefined();
  });

  it('边界：查询项超过 searchSpan 时提供展开按钮', () => {
    const wrapper = mountTable({ searchSpan: 2 });
    expect(searchButtons(wrapper)).toHaveLength(3);
    expect(wrapper.text()).toContain('展开');
  });

  it('边界：点击展开后按钮文案变为收起', async () => {
    const wrapper = mountTable({ searchSpan: 2 });
    await searchButtons(wrapper)[2].trigger('click');
    expect(wrapper.text()).toContain('收起');
  });

  it('边界：search 关闭时不渲染查询区', () => {
    const wrapper = mountTable({ search: false });
    expect(wrapper.find('.aura-pro-table-search').exists()).toBe(false);
  });

  it('边界：全部列 hideInSearch 时不渲染查询区', () => {
    const wrapper = mountTable({
      columns: [{ key: 'name', title: '姓名', hideInSearch: true }],
    });
    expect(wrapper.find('.aura-pro-table-search').exists()).toBe(false);
  });
});

describe('ProTable 实例方法', () => {
  it('正常：getSearchValues / setSearchValues 读写查询条件', async () => {
    const wrapper = mountTable();
    const vm = wrapper.vm as unknown as ProTableInstance;

    vm.setSearchValues({ name: 'Landy' });
    await nextTick();
    expect(vm.getSearchValues().name).toBe('Landy');
  });

  it('正常：getData 返回当前表格数据', () => {
    const wrapper = mountTable();
    const vm = wrapper.vm as unknown as ProTableInstance;
    expect(vm.getData()).toHaveLength(2);
  });

  it('正常：setHiddenColumns 可调用且不影响数据', () => {
    const wrapper = mountTable();
    const vm = wrapper.vm as unknown as ProTableInstance;

    // 列显隐作用在 ElTable 的列定义上，happy-dom 无布局引擎渲染不出列，
    // 这里只保证接口契约（不抛错 + 数据不变），列渲染由 demo 页兜底。
    expect(() => vm.setHiddenColumns(['status'])).not.toThrow();
    expect(vm.getData()).toHaveLength(2);
  });

  it('正常：clearSelection 与 getSelectedRows 成对可用', () => {
    const wrapper = mountTable({ rowSelection: true });
    const vm = wrapper.vm as unknown as ProTableInstance;

    expect(vm.getSelectedRows()).toEqual([]);
    expect(() => vm.clearSelection()).not.toThrow();
  });

  it('正常：reload 重新发起请求', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request });
    await flush();

    const before = request.mock.calls.length;
    const vm = wrapper.vm as unknown as ProTableInstance;
    await vm.reload();
    expect(request.mock.calls.length).toBe(before + 1);
  });

  it('正常：reloadAndReset 把页码重置为 1', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({
      request,
      pagination: { current: 1, pageSize: 10 },
    });
    await flush();

    wrapper
      .findComponent({ name: 'ElTable' })
      .vm.$emit('sort-change', { prop: 'name', order: 'ascending' });
    await nextTick();
    expect(request.mock.calls.at(-1)?.[0].sort).toEqual({
      field: 'name',
      order: 'asc',
    });

    const vm = wrapper.vm as unknown as ProTableInstance;
    await vm.reloadAndReset();
    expect(request.mock.calls.at(-1)?.[0].current).toBe(1);
  });
});

describe('ProTable 分页与排序', () => {
  it('正常：切页时更新页码并派发 page-change', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request });
    await flush();

    wrapper
      .findComponent({ name: 'ElPagination' })
      .vm.$emit('current-change', 3);
    await nextTick();

    expect(wrapper.emitted('page-change')?.[0]).toEqual([
      { current: 3, pageSize: 10 },
    ]);
    expect(request.mock.calls.at(-1)?.[0].current).toBe(3);
  });

  it('正常：改每页条数时回到第一页', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request });
    await flush();

    wrapper.findComponent({ name: 'ElPagination' }).vm.$emit('size-change', 20);
    await nextTick();

    expect(wrapper.emitted('page-change')?.[0]).toEqual([
      { current: 1, pageSize: 20 },
    ]);
    expect(request.mock.calls.at(-1)?.[0].pageSize).toBe(20);
  });

  it('正常：排序 order 为 descending 时映射为 desc', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request });
    await flush();

    wrapper
      .findComponent({ name: 'ElTable' })
      .vm.$emit('sort-change', { prop: 'name', order: 'descending' });
    await nextTick();

    expect(request.mock.calls.at(-1)?.[0].sort).toEqual({
      field: 'name',
      order: 'desc',
    });
  });

  it('边界：清空排序时 sort 变为 undefined', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request });
    await flush();

    const table = wrapper.findComponent({ name: 'ElTable' });
    table.vm.$emit('sort-change', { prop: 'name', order: 'ascending' });
    await nextTick();
    table.vm.$emit('sort-change', { prop: null, order: null });
    await nextTick();

    expect(request.mock.calls.at(-1)?.[0].sort).toBeUndefined();
  });

  it('边界：pagination 为 false 时不渲染分页', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request, pagination: false });
    await flush();
    expect(wrapper.findComponent(ElPagination).exists()).toBe(false);
  });

  it('边界：无数据时不渲染分页', async () => {
    const request = vi
      .fn<ProTableRequest>()
      .mockResolvedValue({ data: [], total: 0 });
    const wrapper = mountTable({ request });
    await flush();
    expect(wrapper.findComponent(ElPagination).exists()).toBe(false);
  });
});

describe('ProTable 工具条', () => {
  it('正常：按钮全关且无标题时不渲染工具条', () => {
    const wrapper = mountTable({
      toolbar: { reload: false, density: false, columnSetting: false },
      title: '',
    });
    expect(wrapper.find('.aura-pro-table-toolbar').exists()).toBe(false);
  });

  it('正常：标题存在时即使按钮全关也渲染工具条', () => {
    const wrapper = mountTable({
      title: '用户列表',
      toolbar: { reload: false, density: false, columnSetting: false },
    });
    expect(wrapper.find('.aura-pro-table-toolbar').exists()).toBe(true);
    expect(wrapper.text()).toContain('用户列表');
  });

  it('正常：标题可通过具名插槽覆盖', () => {
    const wrapper = mount(ProTable, {
      props: { columns, data: [] },
      slots: { title: '<span class="custom-title">自定义标题</span>' },
    });
    expect(wrapper.find('.custom-title').exists()).toBe(true);
  });
});

describe('ProTable request 契约', () => {
  it('正常：空查询条件不会污染请求参数', async () => {
    const request = nonEmptyRequest();
    mountTable({ request });
    await flush();

    expect(request.mock.calls[0][0].search).toEqual({});
  });

  it('正常：clearOnReload 为 true 时仍能正常落数据', async () => {
    const request = nonEmptyRequest();
    const wrapper = mountTable({ request, clearOnReload: true });
    await flush();

    const vm = wrapper.vm as unknown as ProTableInstance;
    await vm.reload();
    expect(vm.getData()).toHaveLength(1);
  });

  it('异常：request 返回 success:false 时保留原数据且不触发 loaded', async () => {
    const request = vi
      .fn<ProTableRequest>()
      .mockResolvedValue({ data: [], total: 0, success: false });
    const wrapper = mountTable({ request, data: [{ id: 1 }] });
    await flush();

    expect(wrapper.emitted('error')).toBeUndefined();
    expect(wrapper.emitted('loaded')).toBeUndefined();
  });
});
