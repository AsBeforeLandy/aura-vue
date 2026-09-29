import { describe, expect, it, vi } from 'vitest';
import type { VNode } from 'vue';
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
} from 'element-plus';
import { normalizeRules, renderControl } from '../src/pro-form/render-control';
import type { ProFormItem, ProFormRule } from '../src/pro-form/types';

/**
 * render-control 是「配置 → Element Plus 控件」的映射中枢，
 * 十几个 valueType 分支各自独立，是 business 包覆盖率最薄弱的一环。
 * 这里按「每个分支至少命中一次 + 关键 prop 正确」的口径补齐。
 */

const ctx = {
  value: undefined as unknown,
  disabled: false,
  onUpdate: vi.fn(),
};

/** 生成字段配置，只写需要覆盖的差异部分 */
function item(patch: Partial<ProFormItem>): ProFormItem {
  return { name: 'field', ...patch };
}

/** renderControl 的返回类型是 VNodeChild，测试里统一收窄成 VNode 断言 */
function render(patch: Partial<ProFormItem>) {
  return renderControl(item(patch), { ...ctx, value: 'v' }) as VNode;
}

describe('renderControl 控件映射', () => {
  it('正常：text 渲染 ElInput 且默认可清空', () => {
    const vnode = render({ valueType: 'text' });
    expect(vnode.type).toBe(ElInput);
    expect(vnode.props?.clearable).toBe(true);
  });

  it('正常：未指定 valueType 时回退为 text', () => {
    const vnode = render({});
    expect(vnode.type).toBe(ElInput);
    expect(vnode.props?.type).toBeUndefined();
  });

  it('正常：textarea 渲染多行输入并带默认行数', () => {
    const vnode = render({ valueType: 'textarea' });
    expect(vnode.type).toBe(ElInput);
    expect(vnode.props?.type).toBe('textarea');
    expect(vnode.props?.rows).toBe(3);
  });

  it('边界：textarea 的 rows 可被 props 覆盖', () => {
    const vnode = render({ valueType: 'textarea', props: { rows: 6 } });
    expect(vnode.props?.rows).toBe(6);
  });

  it('正常：password 渲染密码框并开启可见性切换', () => {
    const vnode = render({ valueType: 'password' });
    expect(vnode.type).toBe(ElInput);
    expect(vnode.props?.type).toBe('password');
    expect(vnode.props?.showPassword).toBe(true);
  });

  it('正常：number 渲染数字输入且宽度撑满', () => {
    const vnode = render({ valueType: 'number' });
    expect(vnode.type).toBe(ElInputNumber);
    expect(vnode.props?.controlsPosition).toBe('right');
  });

  it('正常：select 渲染下拉并生成等量选项', () => {
    const vnode = render({
      valueType: 'select',
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    });
    expect(vnode.type).toBe(ElSelect);
    expect(vnode.props?.clearable).toBe(true);
    // 选项通过 default 插槽渲染
    const slot = vnode.children as { default: () => VNode[] };
    const options = slot.default();
    expect(options).toHaveLength(2);
    expect(options[0].props?.value).toBe('a');
  });

  it('边界：select 未配置 options 时不报错', () => {
    const vnode = render({ valueType: 'select' });
    const slot = vnode.children as { default: () => VNode[] };
    expect(slot.default()).toHaveLength(0);
  });

  it('正常：radio 渲染单选组并传递禁用态', () => {
    const vnode = render({
      valueType: 'radio',
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0, disabled: true },
      ],
    });
    expect(vnode.type).toBe(ElRadioGroup);
    const slot = vnode.children as { default: () => VNode[] };
    const radios = slot.default();
    expect(radios).toHaveLength(2);
    expect(radios[0].type).toBe(ElRadio);
    expect(radios[1].props?.disabled).toBe(true);
  });

  it('边界：radio 在整体禁用时所有项都禁用', () => {
    const vnode = renderControl(
      item({ valueType: 'radio', options: [{ label: 'A', value: 'a' }] }),
      { value: '', disabled: true, onUpdate: vi.fn() },
    ) as VNode;
    const slot = vnode.children as { default: () => VNode[] };
    expect(slot.default()[0].props?.disabled).toBe(true);
  });

  it('正常：checkbox 渲染多选组', () => {
    const vnode = render({
      valueType: 'checkbox',
      options: [{ label: 'Vue', value: 'vue' }],
    });
    expect(vnode.type).toBe(ElCheckboxGroup);
    const slot = vnode.children as { default: () => VNode[] };
    expect(slot.default()[0].type).toBe(ElCheckbox);
  });

  it('正常：switch 渲染开关', () => {
    expect(render({ valueType: 'switch' }).type).toBe(ElSwitch);
  });

  it('正常：date 使用日期格式与 date 类型', () => {
    const vnode = render({ valueType: 'date' });
    expect(vnode.type).toBe(ElDatePicker);
    expect(vnode.props?.type).toBe('date');
    expect(vnode.props?.valueFormat).toBe('YYYY-MM-DD');
  });

  it('正常：datetime 使用到秒的格式', () => {
    const vnode = render({ valueType: 'datetime' });
    expect(vnode.props?.type).toBe('datetime');
    expect(vnode.props?.valueFormat).toBe('YYYY-MM-DD HH:mm:ss');
  });

  it('正常：dateRange 渲染区间并给出中文占位', () => {
    const vnode = render({ valueType: 'dateRange' });
    expect(vnode.props?.type).toBe('daterange');
    expect(vnode.props?.startPlaceholder).toBe('开始日期');
    expect(vnode.props?.endPlaceholder).toBe('结束日期');
  });

  it('正常：time 使用时间格式', () => {
    const vnode = render({ valueType: 'time' });
    expect(vnode.props?.type).toBe('time');
    expect(vnode.props?.valueFormat).toBe('HH:mm:ss');
  });

  it('边界：slot 类型返回 null，交由外部具名插槽渲染', () => {
    expect(render({ valueType: 'slot' })).toBeNull();
  });

  it('正常：passthrough props 会覆盖默认值', () => {
    const vnode = render({ valueType: 'text', props: { clearable: false } });
    expect(vnode.props?.clearable).toBe(false);
  });

  it('正常：显式 placeholder 优先于自动生成的提示', () => {
    const vnode = render({
      valueType: 'text',
      label: '姓名',
      placeholder: '自定义',
    });
    expect(vnode.props?.placeholder).toBe('自定义');
  });
});

describe('renderControl 默认占位文案', () => {
  it('正常：选择类控件生成「请选择 + 标签」', () => {
    const vnode = render({ valueType: 'select', label: '状态' });
    expect(vnode.props?.placeholder).toBe('请选择状态');
  });

  it('正常：输入类控件生成「请输入 + 标签」', () => {
    const vnode = render({ valueType: 'text', label: '姓名' });
    expect(vnode.props?.placeholder).toBe('请输入姓名');
  });

  it('边界：无标签时只保留动作词', () => {
    const vnode = render({ valueType: 'text' });
    expect(vnode.props?.placeholder).toBe('请输入');
  });
});

describe('normalizeRules 规则归一化', () => {
  it('异常：未传规则时返回 undefined', () => {
    expect(normalizeRules(undefined)).toBeUndefined();
  });

  it('正常：单条规则被包装成数组', () => {
    const rules = normalizeRules({ required: true, message: '必填' });
    expect(rules).toHaveLength(1);
    expect(rules?.[0].required).toBe(true);
    expect(rules?.[0].message).toBe('必填');
  });

  it('正常：缺省 trigger 时补成 blur + change', () => {
    const rules = normalizeRules([{ required: true }]);
    expect(rules?.[0].trigger).toEqual(['blur', 'change']);
  });

  it('正常：显式 trigger 被保留', () => {
    const rules = normalizeRules([{ required: true, trigger: 'blur' }]);
    expect(rules?.[0].trigger).toBe('blur');
  });

  it('正常：min / max / pattern / type 按需透传', () => {
    const rules = normalizeRules([
      { min: 2, max: 8, pattern: /^\d+$/, type: 'string' },
    ]);
    expect(rules?.[0].min).toBe(2);
    expect(rules?.[0].max).toBe(8);
    expect(rules?.[0].pattern).toBeInstanceOf(RegExp);
    expect(rules?.[0].type).toBe('string');
  });

  it('边界：未声明的字段不会污染规则对象', () => {
    const rules = normalizeRules([{ required: true }]);
    expect(rules?.[0]).not.toHaveProperty('min');
    expect(rules?.[0]).not.toHaveProperty('pattern');
    expect(rules?.[0]).not.toHaveProperty('type');
  });

  it('正常：多条规则按顺序映射', () => {
    const rules = normalizeRules([
      { required: true, message: 'a' },
      { min: 3, message: 'b' },
    ]);
    expect(rules).toHaveLength(2);
    expect(rules?.[1].min).toBe(3);
  });
});

describe('normalizeRules 的 validator 适配层', () => {
  type Adapter = (
    rule: unknown,
    value: unknown,
    callback: (error?: Error) => void,
  ) => void;

  /** 取出归一化后挂到 EP rule 上的校验器 */
  function adapterOf(validator: ProFormRule['validator']) {
    const rules = normalizeRules([{ validator }]);
    return rules?.[0].validator as Adapter;
  }

  it('正常：返回 true 视为通过', () => {
    const callback = vi.fn();
    adapterOf(() => true)(null, 'v', callback);
    expect(callback).toHaveBeenCalledWith();
  });

  it('异常：返回 false 时使用规则 message 作为错误文案', () => {
    const callback = vi.fn();
    const rules = normalizeRules([
      { message: '自定义失败文案', validator: () => false },
    ]);
    (rules?.[0].validator as Adapter)(null, 'v', callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect((callback.mock.calls[0][0] as Error).message).toBe('自定义失败文案');
  });

  it('边界：返回 false 且未给 message 时回退到默认文案', () => {
    const callback = vi.fn();
    adapterOf(() => false)(null, 'v', callback);
    expect((callback.mock.calls[0][0] as Error).message).toBe('校验未通过');
  });

  it('正常：返回字符串时直接用该字符串作为错误文案', () => {
    const callback = vi.fn();
    adapterOf(() => '长度不合法')(null, 'v', callback);
    expect((callback.mock.calls[0][0] as Error).message).toBe('长度不合法');
  });

  it('正常：异步 resolve(true) 视为通过', async () => {
    const callback = vi.fn();
    adapterOf(async () => true)(null, 'v', callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalled());
    expect(callback).toHaveBeenCalledWith();
  });

  it('异常：异步 resolve 字符串时作为错误文案', async () => {
    const callback = vi.fn();
    adapterOf(async () => '服务端已存在')(null, 'v', callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalled());
    expect((callback.mock.calls[0][0] as Error).message).toBe('服务端已存在');
  });

  it('异常：异步 resolve(false) 时回退到 message', async () => {
    const callback = vi.fn();
    const rules = normalizeRules([
      { message: '兜底文案', validator: async () => false },
    ]);
    (rules?.[0].validator as Adapter)(null, 'v', callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalled());
    expect((callback.mock.calls[0][0] as Error).message).toBe('兜底文案');
  });

  it('异常：异步抛错时把原始错误交给 EP 展示', async () => {
    const callback = vi.fn();
    const boom = new Error('网络异常');
    adapterOf(async () => {
      throw boom;
    })(null, 'v', callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalled());
    expect(callback).toHaveBeenCalledWith(boom);
  });
});
