# Button 按钮

常用的操作按钮。

## 基础用法

<demo src="./demos/button/basic.vue" />

## 不同尺寸

<demo src="./demos/button/size.vue" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型 | `'primary' \| 'default' \| 'dashed' \| 'text'` | `'default'` |
| size | 尺寸 | `'large' \| 'middle' \| 'small'` | `'middle'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| block | 是否撑满整行 | `boolean` | `false` |

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| click | 点击按钮时触发 | `(evt: MouseEvent)` |
