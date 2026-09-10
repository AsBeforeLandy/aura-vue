# Select 选择器

自定义下拉面板，支持受控 / 非受控双轨、键盘导航（↑ ↓ 移动高亮，Enter 选中，Esc 关闭）、点击外部关闭，下方空间不足时自动向上展开。

面板配色通过 CSS 变量配置：`--aura-select-popup-bg`（面板背景，默认 `--aura-bg`）、`--aura-color-primary-shadow`（高亮底色）。

## 基础用法

<demo src="./demos/select/basic.vue" />

## 字符串选项

<demo src="./demos/select/strings.vue" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 受控值 | `string` | - |
| defaultValue | 非受控初始值 | `string` | - |
| options | 选项，支持对象或字符串 | `Array<{ label, value, disabled? } \| string>` | `[]` |
| placeholder | 占位选项 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中变化时触发 | `(value: string)` |
| change | 选中变化时触发 | `(value: string)` |
