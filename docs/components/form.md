# Form 表单

表单容器 + 表单项，内置轻量校验（必填 / 长度 / 正则 / 自定义异步校验器），Input 处于 FormItem 内时自动接入校验钩子。

## 基础用法

<demo src="./demos/form/basic.vue" />

## 校验触发时机

- `submit`：调用 `formRef.validate()` 时触发全部规则
- `change`：控件输入时触发未声明 trigger 的规则
- `blur`：控件失焦时触发，可给规则声明 `trigger: 'blur'`

## API

### Form

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model | 表单数据源（响应式对象） | `Record<string, unknown>` | 必填 |

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| validate | 触发全部校验 | `Promise<{ valid: boolean; errors: Record<string, string> }>` |
| resetValidation | 清空所有错误状态 | `void` |

### FormItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label | 标签文本 | `string` | `''` |
| prop | 对应 model 的字段名 | `string` | - |
| rules | 校验规则 | `Rule[]` | `[]` |
| required | 是否展示必填星号 | `boolean` | `false` |

### Rule

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| required | 必填 | `boolean` |
| min / max | 长度范围 | `number` |
| pattern | 正则校验 | `RegExp` |
| validator | 自定义校验器（支持异步） | `(value) => boolean \| string \| Promise` |
| trigger | 触发时机 | `'change' \| 'blur'` |
| message | 错误文案 | `string` |
