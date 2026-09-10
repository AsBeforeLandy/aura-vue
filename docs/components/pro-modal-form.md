# ProModalForm 弹窗表单

「弹窗 + 表单」的组合封装。把三件容易写错的事情一次做对：**打开时回填数据、确认时先校验再提交、提交失败保持弹窗打开**。

内部复用 [ProForm](/components/pro-form)，弹窗部分基于 Element Plus 的 `ElDialog`。

## 何时使用

- 新增 / 编辑 / 查看弹窗（三种模式共用一份 `items` 配置）
- 希望「提交失败不要关弹窗」这类交互成为默认行为，而不是每个页面各写一遍
- 表单字段量中等，弹窗内可以完整容纳

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 字段非常多、需要分步填写 | 独立页面 + [ProForm](/components/pro-form) |
| 只是确认操作（是/否） | 普通确认弹窗即可 |
| 需要左右分栏、侧边抽屉式表单 | 手写 `ElDrawer` + [ProForm](/components/pro-form) |

## 基础用法

一个组件覆盖三种模式，`mode` 决定默认标题与按钮文案：

<demo src="./demos/pro-modal-form/basic.vue" />

## 三种模式

| mode | 默认标题 | 提交按钮 | 表单行为 |
| --- | --- | --- | --- |
| `create` | 新增 | 确定 | 正常编辑 |
| `edit` | 编辑 | 保存 | 正常编辑 |
| `view` | 查看 | 不渲染 | 整体只读（纯文本展示） |

`title` 可以显式覆盖默认标题。

## 回填与重置

`initialValues` 在弹窗打开时写入表单：

- 默认 `resetOnOpen: true`：每次打开都以 `initialValues` 为准重置，避免上一次的残留值
- 如果希望「用户中途关闭后重开还能看到未提交的草稿」，把它设为 `false`

:::tip
`initialValues` 的赋值发生在弹窗渲染之前，因此不会出现「先渲染空表单再闪一下被覆盖」的情况。
:::

## 提交流程

`submit` 是一个可选函数，组件围绕它定义了完整的成功/失败语义：

```ts
async function submit(values: Record<string, unknown>) {
  await api.save(values);   // 抛错即视为失败
}
```

| submit 的返回 | 组件行为 |
| --- | --- |
| 正常返回（含 `Promise` resolve） | `emit('success', values)` + 自动关闭弹窗 |
| 抛错 / `Promise` reject | `emit('error', error)` + **保持弹窗打开**，让用户修正后重试 |
| 不传 `submit` | 退化为受控用法：`emit('success', values)` 后关闭，由外部处理提交 |

提交进行中时按钮进入 loading，且**屏蔽遮罩点击与 ESC 关闭**，避免请求与 UI 状态不一致。

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 是否可见（`v-model`） | `boolean` | `false` |
| items | 表单字段配置 | `ProFormItem[]` | 必填 |
| mode | 模式 | `'create' \| 'edit' \| 'view'` | `'create'` |
| title | 标题（缺省按 mode 推导） | `string` | `''` |
| submit | 提交函数 | `(values) => Promise \| unknown` | - |
| initialValues | 打开时的回填数据 | `Record<string, unknown>` | `{}` |
| resetOnOpen | 打开时重置为 `initialValues` | `boolean` | `true` |
| width | 弹窗宽度 | `number \| string` | `640` |
| columns | 表单列数 | `number` | `2` |
| labelWidth | 标签宽度 | `number \| string` | `96` |
| labelPosition | 标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| closeOnClickModal | 点击遮罩关闭 | `boolean` | `false` |
| closeOnPressEscape | 按 ESC 关闭 | `boolean` | `true` |
| okText / cancelText | 按钮文案 | `string` | 按 mode 推导 / `'取消'` |
| appendToBody | 挂载到 body | `boolean` | `true` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 可见性变化 |
| `success` | 提交成功，参数为表单值 |
| `error` | 提交失败，参数为错误对象 |
| `cancel` | 取消或关闭 |
| `open` | 弹窗打开 |
| `closed` | 弹窗关闭（含提交成功后的自动关闭） |

### 插槽

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `footer` | `{ ok, cancel, submitting }` | 完全自定义底部按钮区 |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| `getValues()` | 获取当前表单值 |
| `setValues(values)` | 设置表单值 |
| `validate()` | 手动触发校验 |
| `isSubmitting()` | 当前是否处于提交中 |

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-pro-modal-form` | 弹窗根节点 |

## 实现说明

### 为什么要等 `submit` 完成才关弹窗

「先关弹窗再请求」是很常见的写法，但一旦接口报错，用户已经看不到自己填的内容了——尤其表单较长时体验极差。

这里选择「**先请求、后关闭**」：`await props.submit(values)` 成功才 `emit('update:modelValue', false)`，失败则保持打开并触发 `error` 让外层弹提示。代价是用户要在弹窗里多等一会儿，但换来的是数据不丢失。

### `destroy-on-close` 与回填时序

弹窗使用 `destroy-on-close`，关闭即销毁表单内容，下次打开是全新实例——这避免了旧校验状态残留。

但这也带来一个时序约束：`formValues` 必须在 `ProForm` **首次渲染之前**就写好。因为 `formValues` 是通过 `v-model` 传入的，一旦传入即视为受控模式，`ProForm` 内部的 `defaultValue` 不再生效。因此 `syncValues()` 挂在 `flush: 'sync'` 的 watch 上，在渲染前同步求值。

## 相关文档

- [ProForm 高级表单](/components/pro-form) — 表单能力本体
- [ProTable 高级表格](/components/pro-table) — 列表页
- [Modal 对话框](/components/modal) — 底层基础组件
