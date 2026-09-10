# ProForm 高级表单

配置驱动的表单。用一份 `items` 数组描述「有哪些字段、用什么控件、什么校验」，组件负责渲染、栅格布局与校验编排。

基于 [Element Plus](https://element-plus.org/) 的 `ElForm` 二次封装。

## 何时使用

- 表单项较多、字段结构相似（新增/编辑/查看共用一套配置）的后台表单
- 希望「新增 / 编辑 / 查看」三态复用同一份字段定义
- 需要统一栅格布局（一行几个字段）与标签宽度

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 只有 1~2 个字段的简单表单 | 直接用我们自己的 `Form`，不必引入这层抽象 |
| 字段之间有强联动的复杂 UI（动态增删、嵌套子表） | 手写模板更可控，配置化反而会变得笨重 |
| 需要完全自定义每个字段的渲染结构 | 用 `render` 逃生舱，或直接手写 |

## 基础用法

<demo src="./demos/pro-form/basic.vue" />

## 字段类型

`valueType` 决定渲染哪种控件：

| valueType | 控件 | 说明 |
| --- | --- | --- |
| `text` | ElInput | 默认类型 |
| `textarea` | ElInput (textarea) | 多行文本 |
| `password` | ElInput (password) | 密码，默认带显示切换 |
| `number` | ElInputNumber | 数字 |
| `select` | ElSelect | 需配合 `options` |
| `radio` | ElRadioGroup | 需配合 `options` |
| `checkbox` | ElCheckboxGroup | 值为数组，需配合 `options` |
| `switch` | ElSwitch | 布尔值 |
| `date` | ElDatePicker | 日期 |
| `datetime` | ElDatePicker | 日期时间 |
| `dateRange` | ElDatePicker (range) | 日期区间，值为数组 |
| `time` | ElTimePicker | 时间 |
| `slot` | 具名插槽 | 由使用方提供渲染 |

`slot` 类型会以字段 `name` 作为插槽名暴露 `model` 与 `item`：

```vue
<ProForm :items="items">
  <template #avatar="{ model, item }">
    <MyUploader v-model="model.avatar" :tip="item.tip" />
  </template>
</ProForm>
```

## 栅格布局

一行按 24 份划分栅格：

| 属性 | 说明 |
| --- | --- |
| `columns` | 一行显示几个字段（未显式指定 `span` 时按此平均分配） |
| `span` | 该字段占的份数，`span: 12` 即半行 |
| `fullWidth` | 独占一行（等价于 `span: 24`） |
| `gutter` | 字段间距，默认 20 |

:::tip
字段数不能被 `columns` 整除时，最后一个字段会按 `24 / columns` 取整宽度，可能出现换行。需要精确控制时显式写 `span`。
:::

## 校验

规则结构对齐 Element Plus，并做了窄化：

| 字段 | 说明 |
| --- | --- |
| `required` | 必填 |
| `min` / `max` | 长度或数值范围（配合 `type`） |
| `pattern` | 正则 |
| `validator` | 自定义校验器，**返回字符串时该字符串直接作为错误文案** |
| `trigger` | `'blur' \| 'change'`，缺省则两者都触发 |
| `message` | 错误文案 |

```ts
{
  name: 'email',
  label: '邮箱',
  rules: [
    { required: true, message: '请输入邮箱' },
    {
      validator: (value) =>
        String(value).includes('@') ? true : '邮箱格式不正确，请检查是否缺少 @'
    }
  ]
}
```

### 触发校验

通过 `ref` 调用 `validate()`：

```ts
const formRef = ref<ProFormInstance>();
const ok = await formRef.value?.validate();
if (!ok) return;
const values = formRef.value?.getValues();
```

或者用表单自带的操作区（`showActions`）触发 `submit` 事件。

## 只读模式

`readonly` 会把所有字段降级为纯文本展示——**不渲染任何可交互控件**，比给控件加 `disabled` 更彻底，也更符合"查看态"的语义：

- 枚举值（`select` / `radio` / `checkbox`）显示文案而非原始值
- 数组值用顿号连接
- 空值显示 `-`

单个字段可用 `item.readonly: true` 在整体只读时豁免（仍保持可编辑）。

<demo src="./demos/pro-form/readonly.vue" />

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 字段配置 | `ProFormItem[]` | 必填 |
| modelValue | 表单数据（`v-model`，传入即受控） | `Record<string, unknown>` | - |
| defaultValue | 非受控初始值 | `Record<string, unknown>` | `{}` |
| columns | 每行字段数 | `number` | `2` |
| labelPosition | 标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| labelWidth | 标签宽度 | `number \| string` | `96` |
| readonly | 整体只读 | `boolean` | `false` |
| disabled | 整体禁用 | `boolean` | `false` |
| size | 尺寸 | `'large' \| 'default' \| 'small'` | `'default'` |
| showActions | 显示底部操作区 | `boolean` | `false` |
| submitText / resetText | 按钮文案 | `string` | `'提交'` / `'重置'` |
| submitting | 提交中（阻断重复提交） | `boolean` | `false` |
| gutter | 字段间距 | `number` | `20` |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| `validate()` | 触发校验，返回 `Promise<boolean>` |
| `clearValidate()` | 清空校验状态 |
| `reset()` | 重置为初始值并清空校验状态 |
| `getValues()` | 获取当前全部值 |
| `setValues(values)` | 批量设置值 |
| `getValue(name)` | 获取单个字段值 |
| `setValue(name, value)` | 设置单个字段值 |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 任一字段变化时同步整个 model |
| `change` | 字段变化，参数 `{ name, value, model }` |
| `submit` | 校验通过后点击提交，参数为全部值 |
| `reset` | 重置完成 |
| `validate-error` | 校验失败 |

### 类型导出

```ts
import type {
  ProFormItem,
  ProFormOption,
  ProFormRule,
  ProFormInstance,
  ProFormValueType
} from '@aura/business';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-pro-form` | 表单根节点 |
| `.aura-pro-form-readonly` | 只读态的文本展示 |
| `.aura-pro-form-extra` | 字段下方的辅助说明 |
| `.aura-pro-form-tip` | 标签旁的问号图标 |
| `.aura-pro-form-actions` | 底部操作区 |

## 实现说明

### 为什么内部要维护 `innerModel`

`ElForm` 的校验只有在 `model` 里**能取到对应 `prop`** 时才执行。若把 `props.modelValue` 直接交给 `ElForm`：

1. `props` 对象不能被就地改写，无法补齐缺失的键
2. 使用方少传一个字段 → 该键在 model 上不存在 → 校验被静默跳过（"必填留空却能提交"）

因此组件内部始终维护 `innerModel` 作为 `model` 源：

- `ensureKeys()` 按 `items` 补齐所有声明的键（checkbox 补 `[]`，其余补 `undefined`）
- `syncFromProps()` 在受控模式下把外部值同步进来，但**不删除**外部未提供的键（那些键是 `ensureKeys` 补的，删掉会让校验失效），外部显式传 `null` 才视为"要覆盖成空"
- 对外仍通过 `emit('update:modelValue')` 同步，使用方感知不到这层影子对象

### 校验为什么不用 `formRef.validate()`

Element Plus 的聚合校验（`formRef.validate()`）在「弹窗 + 动态 items」这类字段重注册时序复杂的场景下会漏判——实测 `fields` 规则完整、单个字段能校验出错误，但聚合调用却返回通过。

因此 `validate()` 改为**逐个遍历 `formRef.fields`**，并且只校验**在 `items` 里声明了规则**的字段。后者很关键：EP 的 `field.validate()` 对「未声明任何规则」的字段返回 `false`（源码 `if (!validateEnabled.value) return false`），若把它当成校验失败，会导致「表单里只要有一个纯展示字段就永远提交不了」。

另外调用 `field.validate()` 时**不能传 `trigger` 参数**：传空串会命中 EP 内部的规则过滤分支，筛不出任何规则后直接跳过校验。

## 相关文档

- [ProTable 高级表格](/components/pro-table) — 列表页配置驱动
- [ProModalForm 弹窗表单](/components/pro-modal-form) — 表单在弹窗中的封装
- [Form 表单](/components/form) — 底层表单组件
