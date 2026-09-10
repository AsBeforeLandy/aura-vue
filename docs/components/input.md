# Input 输入框

通过键盘输入文本内容，支持受控 / 非受控双轨模式与清空能力。

## 何时使用

- 需要用户输入短文本时（名称、标题、关键字、邮箱等）
- 需要与 Form 配合做声明式校验时
- 需要受控地过滤、格式化输入内容时

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 长文本、多行输入 | Textarea（待提供） |
| 从固定选项中挑一个 | Select 选择器 |
| 是 / 否的布尔选择 | Switch 开关 |
| 纯数字且范围固定 | 数字输入框 / 滑块（待提供） |

## 基础用法

<demo src="./demos/input/basic.vue" />

## 清空按钮

添加 `clearable` 后，有内容时显示清空按钮。清空会触发 `update:modelValue`、`change` 与 `clear`。

<demo src="./demos/input/clearable.vue" />

## 受控 / 非受控

组件支持两种值管理模式，判定规则很简单：

| 传入 | 模式 | 行为 |
| --- | --- | --- |
| `v-model`（即 `modelValue`） | 受控 | 值完全由外部驱动，外部不更新则显示不变 |
| `defaultValue` | 非受控 | 组件内部自持状态，同时向上 emit 通知 |

<demo src="./demos/input/uncontrolled.vue" />

:::warning
受控模式下必须让值回流，否则输入会被"吃掉"：

```vue
<!-- 错误：输入框无法输入 -->
<Input :model-value="value" />

<!-- 正确 -->
<Input v-model="value" />
```
:::

## 禁用

<demo src="./demos/input/form-usage.vue" />

禁用态下不响应输入，清空按钮也不会出现。

## 中文输入（IME）

组件内部使用 `compositionstart` / `compositionend` 守卫输入法组词过程——组词期间不写值、不复位 DOM，`compositionend` 之后再取最终文本。这与 Vue 原生 `v-model` 的策略一致，因此在中文、日文等输入法下可以正常组词，不会出现"输入被打断"或"字符消失"。

## 设计规范

| 项 | 规范 |
| --- | --- |
| 单行宽度 | 200 ~ 280px，过宽降低可读性 |
| 占位文案 | 用「请输入 + 名词」，如"请输入项目名称" |
| 必填标识 | 交给 FormItem 的 `required`，不要在 placeholder 里加星号 |
| 高度 | 默认 32px，与 Button `middle` 对齐 |

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 受控值（传入即视为受控模式） | `string` | - |
| defaultValue | 非受控模式初始值 | `string` | - |
| placeholder | 占位文案 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |

### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 输入内容变化时触发 | `(value: string)` |
| change | 失焦且内容变化时触发 | `(value: string)` |
| clear | 点击清空按钮时触发 | - |

### 类型导出

```ts
import type { InputProps, InputEmits } from '@aura/components';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-input` | 容器 |
| `.aura-input--disabled` | 禁用态 |
| `.aura-input-inner` | 原生 `input` 元素 |
| `.aura-input-clear` | 清空按钮 |

### 表单联动

Input 处于 `FormItem` 内时会自动接入校验：`input` 时触发 `change` 类规则，`blur` 时触发 `blur` 类规则。无需任何额外配置，详见 [Form 表单](/components/form)。

## 相关文档

- [Form 表单](/components/form) — 声明式校验
- [组件设计规范](/guide/design#受控与非受控) — 双轨模式实现原理
