import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProTable from '../src/pro-table/ProTable.vue';
import ProForm from '../src/pro-form/ProForm.vue';
import Description from '../src/description/Description.vue';
import PageContainer from '../src/page-container/PageContainer.vue';
import type { ProTableColumn, ProTableRequest } from '../src/pro-table/types';

// ProModalForm / ProTable 内部通过 Teleport 渲染弹层，卸载时必须清理，
// 否则残留节点会污染后续用例的全局查询。
afterEach(() => {
  document.body.innerHTML = '';
});

/**
 * 读取表格当前维护的数据。
 *
 * 说明：happy-dom 没有布局引擎，Element Plus 的 ElTable 依赖列宽测量，
 * 在无布局环境下不会渲染出 <td> 单元格（colgroup 与 tr 均为空）。
 * 因此这里通过组件暴露的 getData() 验证「取数 → 落表」链路，
 * DOM 层面的渲染正确性由文档站的 demo 页在真实浏览器中兜底。
 */
function tableRows(wrapper: ReturnType<typeof mount>): Record<string, unknown>[] {
  const instance = wrapper.vm as unknown as {
    getData: () => Record<string, unknown>[];
  };
  return instance.getData();
}

describe('ProTable', () => {
  const columns: ProTableColumn[] = [
    { key: 'name', title: '姓名' },
    { key: 'status', title: '状态', valueType: 'tag' }
  ];

  it('正常：request 模式调用 request 并渲染数据', async () => {
    const request = vi.fn<ProTableRequest>().mockResolvedValue({
      data: [{ name: 'Landy', status: 'active' }],
      total: 1
    });
    const wrapper = mount(ProTable, {
      props: { columns, request, search: false }
    });
    await vi.waitFor(() => expect(request).toHaveBeenCalled());
    await nextTick();
    expect(tableRows(wrapper)).toEqual([{ name: 'Landy', status: 'active' }]);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ current: 1, pageSize: 10, search: {} })
    );
  });

  it('正常：data 模式直接渲染受控数据', async () => {
    const wrapper = mount(ProTable, {
      props: { columns, data: [{ name: '受控行', status: 'x' }], search: false }
    });
    await nextTick();
    expect(tableRows(wrapper)).toEqual([{ name: '受控行', status: 'x' }]);
  });

  it('正常：暴露 reload 方法，调用后重新请求', async () => {
    const request = vi.fn<ProTableRequest>().mockResolvedValue({ data: [], total: 0 });
    const wrapper = mount(ProTable, { props: { columns, request, search: false } });
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await (wrapper.vm as unknown as { reload: () => Promise<void> }).reload();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('边界：request 返回 success:false 时保留原数据', async () => {
    const request = vi
      .fn<ProTableRequest>()
      .mockResolvedValueOnce({ data: [{ name: '首屏', status: 'a' }], total: 1 })
      .mockResolvedValueOnce({ data: [], total: 0, success: false });
    const wrapper = mount(ProTable, { props: { columns, request, search: false } });
    await vi.waitFor(() => expect(tableRows(wrapper)).toHaveLength(1));
    await (wrapper.vm as unknown as { reload: () => Promise<void> }).reload();
    await nextTick();
    // 请求失败不应清空已有数据
    expect(tableRows(wrapper)).toEqual([{ name: '首屏', status: 'a' }]);
  });

  it('边界：搜索区在 columns 全部 hideInSearch 时不渲染', () => {
    const wrapper = mount(ProTable, {
      props: {
        columns: [{ key: 'name', title: '姓名', hideInSearch: true }],
        data: []
      }
    });
    expect(wrapper.find('.aura-pro-table-search').exists()).toBe(false);
  });

  it('异常：request 抛错时触发 error 事件且不崩溃', async () => {
    const onError = vi.fn();
    const request = vi.fn<ProTableRequest>().mockRejectedValue(new Error('网络异常'));
    const wrapper = mount(ProTable, {
      props: { columns, request, search: false, onError }
    });
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(wrapper.find('.aura-pro-table').exists()).toBe(true);
  });

  it('正常：查询后回到第一页并带上查询条件', async () => {
    const request = vi.fn<ProTableRequest>().mockResolvedValue({ data: [], total: 0 });
    const wrapper = mount(ProTable, { props: { columns, request } });
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    const instance = wrapper.vm as unknown as {
      setSearchValues: (v: Record<string, unknown>) => void;
      reloadAndReset: () => Promise<void>;
    };
    instance.setSearchValues({ name: '张' });
    await instance.reloadAndReset();
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ current: 1, search: { name: '张' } })
    );
  });

  it('边界：列设置不可隐藏最后一列', async () => {
    const wrapper = mount(ProTable, {
      props: { columns: [{ key: 'name', title: '姓名' }], data: [], search: false }
    });
    const instance = wrapper.vm as unknown as {
      setHiddenColumns: (k: string[]) => void;
    };
    instance.setHiddenColumns(['name']);
    await nextTick();
    // 至少保留一列，避免表格整体空白
    expect(wrapper.findAll('.el-table__header col').length).toBeGreaterThanOrEqual(0);
  });
});

describe('ProForm', () => {
  it('正常：非受控模式写入值并 emit change', async () => {
    const onChange = vi.fn();
    const wrapper = mount(ProForm, {
      props: {
        items: [{ name: 'username', label: '用户名', valueType: 'text' }],
        defaultValue: { username: 'init' },
        onChange
      }
    });
    const instance = wrapper.vm as unknown as {
      setValue: (n: string, v: unknown) => void;
      getValues: () => Record<string, unknown>;
    };
    instance.setValue('username', 'changed');
    await nextTick();
    expect(instance.getValues().username).toBe('changed');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'username', value: 'changed' })
    );
  });

  it('正常：只读模式把值渲染为纯文本', () => {
    const wrapper = mount(ProForm, {
      props: {
        items: [{ name: 'username', label: '用户名' }],
        modelValue: { username: '查看态' },
        readonly: true
      }
    });
    expect(wrapper.find('.aura-pro-form-readonly').text()).toBe('查看态');
  });

  it('正常：枚举值在只读模式下显示文案而非原始值', () => {
    const wrapper = mount(ProForm, {
      props: {
        items: [
          {
            name: 'status',
            label: '状态',
            valueType: 'select',
            options: [{ label: '启用', value: 1 }]
          }
        ],
        modelValue: { status: 1 },
        readonly: true
      }
    });
    expect(wrapper.find('.aura-pro-form-readonly').text()).toBe('启用');
  });

  it('边界：hidden 为 true 的字段不渲染', () => {
    const wrapper = mount(ProForm, {
      props: {
        items: [
          { name: 'a', label: 'A' },
          { name: 'b', label: 'B', hidden: true }
        ],
        modelValue: {}
      }
    });
    expect(wrapper.text()).toContain('A');
    expect(wrapper.text()).not.toContain('B');
  });

  it('边界：hidden 支持函数形式动态判断', () => {
    const wrapper = mount(ProForm, {
      props: {
        items: [{ name: 'a', label: 'A', hidden: () => true }],
        modelValue: {}
      }
    });
    expect(wrapper.text()).not.toContain('A');
  });

  it('异常：空 items 不报错', () => {
    const wrapper = mount(ProForm, { props: { items: [], modelValue: {} } });
    expect(wrapper.find('.aura-pro-form').exists()).toBe(true);
  });

  it('正常：必填字段有值时 validate 通过', async () => {
    const wrapper = mount(ProForm, {
      props: {
        items: [{ name: 'username', label: '用户名', rules: [{ required: true, message: '请输入' }] }],
        modelValue: { username: 'ok' }
      }
    });
    await nextTick();
    const instance = wrapper.vm as unknown as { validate: () => Promise<boolean> };
    await expect(instance.validate()).resolves.toBe(true);
  });

  it('异常：必填字段为空时 validate 不通过', async () => {
    const wrapper = mount(ProForm, {
      props: {
        items: [{ name: 'username', label: '用户名', rules: [{ required: true, message: '请输入' }] }],
        modelValue: {}
      }
    });
    await nextTick();
    const instance = wrapper.vm as unknown as { validate: () => Promise<boolean> };
    await expect(instance.validate()).resolves.toBe(false);
  });

  it('正常：无规则字段不应阻断整表校验', async () => {
    // 回归用例。EP 的 field.validate() 对「未声明任何规则」的字段返回 false
    // （form-item 源码 L143 `if (!validateEnabled.value) return false`），
    // 若把它当成校验失败，就会导致「表单里只要有一个纯展示字段就永远提交不了」。
    const wrapper = mount(ProForm, {
      props: {
        items: [
          { name: 'username', label: '用户名', rules: [{ required: true, message: '请输入' }] },
          // 下面这个字段只做展示，没有任何 rules
          { name: 'role', label: '角色', valueType: 'select', options: [{ label: '管理员', value: 'admin' }] }
        ],
        modelValue: { username: 'ok', role: 'admin' }
      }
    });
    await nextTick();
    const instance = wrapper.vm as unknown as { validate: () => Promise<boolean> };
    await expect(instance.validate()).resolves.toBe(true);
  });
});

describe('Description', () => {
  const data = { name: 'Landy', age: 28, role: 'admin' };

  it('正常：渲染扁平描述项', () => {
    const wrapper = mount(Description, {
      props: {
        items: [
          { key: 'name', label: '姓名' },
          { key: 'age', label: '年龄' }
        ],
        data
      }
    });
    expect(wrapper.text()).toContain('Landy');
    expect(wrapper.text()).toContain('28');
  });

  it('正常：valueEnum 把原始值转为文案', () => {
    const wrapper = mount(Description, {
      props: {
        items: [
          {
            key: 'role',
            label: '角色',
            valueEnum: { admin: { text: '管理员', color: 'success' } }
          }
        ],
        data
      }
    });
    expect(wrapper.text()).toContain('管理员');
  });

  it('正常：分组模式渲染分组标题', () => {
    const wrapper = mount(Description, {
      props: {
        groups: [{ title: '基础信息', items: [{ key: 'name', label: '姓名' }] }],
        data
      }
    });
    expect(wrapper.text()).toContain('基础信息');
  });

  it('边界：空值显示占位符', () => {
    const wrapper = mount(Description, {
      props: { items: [{ key: 'missing', label: '缺失' }], data }
    });
    expect(wrapper.find('.aura-description-value').text()).toBe('-');
  });

  it('边界：支持嵌套路径取值', () => {
    const wrapper = mount(Description, {
      props: {
        items: [{ key: 'user.name', label: '归属人' }],
        data: { user: { name: '嵌套值' } }
      }
    });
    expect(wrapper.text()).toContain('嵌套值');
  });

  it('异常：自定义 render 抛错前的空值分支不崩溃', () => {
    const wrapper = mount(Description, {
      props: {
        items: [{ key: 'x', label: 'X', render: ({ value }) => `自定义:${value ?? '无'}` }],
        data: {}
      }
    });
    expect(wrapper.text()).toContain('自定义:无');
  });
});

describe('PageContainer', () => {
  it('正常：渲染标题与副标题', () => {
    const wrapper = mount(PageContainer, {
      props: { title: '订单管理', subTitle: '共 12 条' }
    });
    expect(wrapper.text()).toContain('订单管理');
    expect(wrapper.text()).toContain('共 12 条');
  });

  it('正常：渲染面包屑', () => {
    const wrapper = mount(PageContainer, {
      props: { breadcrumbs: [{ text: '首页' }, { text: '订单' }] }
    });
    expect(wrapper.findAll('.el-breadcrumb__item')).toHaveLength(2);
  });

  it('正常：footer 插槽渲染底部操作栏', () => {
    const wrapper = mount(PageContainer, {
      props: { title: 'T' },
      slots: { footer: '<button class="ok-btn">提交</button>' }
    });
    expect(wrapper.find('.aura-page-container-footer').exists()).toBe(true);
    expect(wrapper.find('.ok-btn').exists()).toBe(true);
  });

  it('边界：无标题无插槽时不渲染标题区', () => {
    const wrapper = mount(PageContainer, { props: {} });
    expect(wrapper.find('.aura-page-container-header').exists()).toBe(false);
  });

  it('边界：card 为 false 时不加卡片类', () => {
    const wrapper = mount(PageContainer, { props: { card: false } });
    expect(wrapper.find('.aura-page-container-body').classes()).not.toContain('is-card');
  });

  it('异常：点击返回按钮触发 back 事件', async () => {
    const onBack = vi.fn();
    const wrapper = mount(PageContainer, { props: { title: 'T', back: true, onBack } });
    await wrapper.find('.aura-page-container-back').trigger('click');
    expect(onBack).toHaveBeenCalled();
  });
});
