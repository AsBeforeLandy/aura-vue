# Modal 对话框

居中模态框，支持遮罩/ESC 关闭、自定义底部按钮，基于 Teleport 渲染到 body。

## 基础用法

<demo src="./demos/modal/basic.vue" />

## 自定义底部

<demo src="./demos/modal/custom-footer.vue" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 是否可见 | `boolean` | `false` |
| title | 标题（可用 title 插槽覆盖） | `string` | `''` |
| width | 宽度，数字按 px | `number \| string` | `520` |
| closeOnClickMask | 点击遮罩是否关闭 | `boolean` | `true` |
| closeOnEsc | 按 ESC 是否关闭 | `boolean` | `true` |
| footer | 是否展示底部按钮区 | `boolean` | `true` |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 显隐变化时触发 | `(value: boolean)` |
| ok | 点击确定时触发 | - |
| cancel | 点击取消时触发 | - |
| close | 关闭时触发（含遮罩/ESC/右上角×） | - |

| 插槽 | 说明 |
| --- | --- |
| default | 主体内容 |
| title | 自定义标题 |
| footer | 自定义底部按钮区 |
