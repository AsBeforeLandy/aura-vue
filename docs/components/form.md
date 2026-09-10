# Form 表单

表单容器 + 表单项，提供**声明式**的校验能力。控件（Input / Select / Switch）处于 `FormItem` 内时会自动接入校验，无需手动绑定。

## 何时使用

- 需要收集并提交多项用户输入时
- 需要统一的标签布局、错误提示位置时
- 需要集中式校验（提交前一次性检查全部字段）时

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 只有单个输入框（如搜索框） | 直接用 Input，无需 Form 包装 |
| 无需校验的展示型表单 | 原生布局即可 |
| 数据由后端一次返回、仅作展示 | 描述列表组件（待提供） |

## 基础用法

<demo src="./demos/form/basic.vue" />

## 校验规则

`Rule` 支持五类校验能力，规则**串行执行、返回第一个错误即停止**：

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `required` | 必填（`undefined` / `null` / `''` 视为空） | `boolean` |
| `min` / `max` | 长度范围（按 `String(value).length` 计算） | `number` |
| `pattern` | 正则匹配 | `RegExp` |
| `validator` | 自定义校验器，支持异步 | `(value) => boolean \| string \| Promise` |
| `trigger` | 触发时机，缺省则三种时机都触发 | `'change' \| 'blur'` |
| `message` | 错误文案 | `string` |

### 自定义与异步校验

`validator` 返回 `false` 时使用规则的 `message`；**返回字符串时该字符串直接作为错误文案**，这让校验器可以针对不同情况给出不同提示。

<demo src="./demos/form/custom-validator.vue" />

## 触发时机

| trigger | 时机 | 典型用途 |
| --- | --- | --- |
| `'change'` | 控件输入时 | 实时反馈的格式校验 |
| `'blur'` | 控件失焦时 | 必填、长度类校验 |
| 不声明 | change / blur / submit 三者都触发 | 通用规则 |

:::tip
必填类规则建议声明 `trigger: 'blur'`——否则用户刚聚焦输入框还没来得及打字，错误提示就跳出来了，体验很差。
:::

## 提交校验

通过 `ref` 调用 `validate()`，返回一个 Promise：

```ts
const formRef = ref();

async function submit() {
  const { valid, errors } = await formRef.value.validate();
  if (!valid) return;
  // 提交逻辑
}
```

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| `validate()` | 触发全部表单项校验，聚合并返回错误 | `Promise<{ valid: boolean; errors: Record<string, string> }>` |
| `resetValidation()` | 清空所有错误状态（不改数据） | `void` |

## 对话框内嵌表单

最常见的组合形态，打开时清错误、确定时先校验再关闭：

<demo src="./demos/form/in-modal.vue" />

## 设计规范

| 项 | 规范 |
| --- | --- |
| 布局 | 单列纵向排列，表单项间距 16px |
| 标签位置 | 标签在左时右对齐，宽度 80 ~ 120px |
| 必填标识 | 用 FormItem 的 `required` 标红星，不要手动写 `*` |
| 错误提示 | 紧跟控件下方，红色、13px |
| 主操作 | 提交按钮放在表单末尾，或对话框底部右侧 |
| 重置 | 表单较长时才提供"重置"，且需要二次确认 |

### 校验文案建议

| 规则 | 文案 |
| --- | --- |
| 必填 | 请输入 / 请选择 + 字段名 |
| 长度 | XX 长度为 3-12 个字符 |
| 格式 | XX 格式不正确 |
| 业务 | 该 XX 已被占用 / 不存在 |

文案要说清「哪里错」和「怎么改」，避免"输入有误"这类无信息量的提示。

## API

### Form Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model | 表单数据源（响应式对象） | `Record<string, unknown>` | 必填 |

### Form 方法

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| validate | 触发全部校验 | `Promise<{ valid: boolean; errors: Record<string, string> }>` |
| resetValidation | 清空所有错误状态 | `void` |

### FormItem Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label | 标签文本 | `string` | `''` |
| prop | 对应 model 的字段名 | `string` | - |
| rules | 校验规则 | `Rule[]` | `[]` |
| required | 是否展示必填星号（仅视觉，实际校验靠 rules） | `boolean` | `false` |

### Rule

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| required | 必填 | `boolean` |
| min / max | 长度范围 | `number` |
| pattern | 正则校验 | `RegExp` |
| validator | 自定义校验器（支持异步） | `(value) => boolean \| string \| Promise` |
| trigger | 触发时机 | `'change' \| 'blur'` |
| message | 错误文案 | `string` |

### 类型导出

```ts
import type { FormProps, FormItemProps, Rule, FormRules } from '@aura/components';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-form` | 表单根节点 |
| `.aura-form-item` | 表单项 |
| `.aura-form-item-label` | 标签 |
| `.aura-form-item-control` | 控件区 |
| `.aura-form-item-error` | 错误提示 |

## 实现说明

控件之所以"自动"接入校验，依赖 `provide / inject`：

1. `Form` 通过 `provide` 暴露 `model` 与表单项注册表
2. `FormItem` 向 `Form` 注册自身，并把校验触发器下传
3. `Input` 用 `inject(formItemHookKey, null)` 取到钩子，在 `input` / `blur` 时调用

这带来一个好处：**控件对表单是无感知的**。脱离 `FormItem` 单独使用时，`inject` 拿到 `null`，校验逻辑自然失效且不会报错。

## 相关文档

- [Input 输入框](/components/input) — 校验联动细节
- [组件设计规范](/guide/design#表单校验接入) — provide/inject 设计思路
