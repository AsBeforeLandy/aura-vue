# Input 输入框

通过键盘输入内容，支持受控 / 非受控双轨模式。

## 基础用法

<demo src="./demos/input/basic.vue" />

## 受控 / 非受控

- 传 `v-model`（即 `modelValue`）→ **受控模式**，值完全由外部驱动
- 传 `default-value` → **非受控模式**，组件内部自持状态，同时向上 emit 通知

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 受控值 | `string` | - |
| defaultValue | 非受控初始值 | `string` | - |
| placeholder | 占位文案 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 输入内容变化时触发 | `(value: string)` |
| change | 失焦且内容变化时触发 | `(value: string)` |
| clear | 点击清空按钮时触发 | - |
