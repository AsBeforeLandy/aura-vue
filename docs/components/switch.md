# Switch 开关

布尔值切换，支持受控 / 非受控双轨。

## 基础用法

<demo src="./demos/switch/basic.vue" />

## 禁用

<demo src="./demos/switch/disabled.vue" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 受控值 | `boolean` | - |
| defaultValue | 非受控初始值 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 状态变化时触发 | `(value: boolean)` |
| change | 状态变化时触发 | `(value: boolean)` |
