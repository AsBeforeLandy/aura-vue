# Button 按钮

按钮用于触发一个即时操作，是界面中最基础的交互元素。

## 何时使用

- 需要提交表单、触发查询或执行某项操作时
- 需要引导用户完成某个流程的下一步时
- 需要在一组操作中区分主次层级时

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 页面跳转 | `<a>` 或路由 `<RouterLink>`，而非按钮 |
| 只有图标的操作 | 图标按钮（待提供），避免无文字的纯按钮 |
| 表达状态而非动作 | 标签 / 徽标类组件 |
| 同一区域有多个同级操作 | 收敛主操作，其余的收进下拉菜单 |

## 按钮类型

通过 `type` 指定按钮语义层级。**同一操作区域内，`primary` 最多出现一次**，否则用户无法判断主次。

<demo src="./demos/button/type.vue" />

## 尺寸

提供 `large` / `middle` / `small` 三档，默认为 `middle`。

<demo src="./demos/button/size.vue" />

| 尺寸 | 高度 | 典型场景 |
| --- | --- | --- |
| `large` | 40px | 表单页主操作、落地页 CTA |
| `middle` | 32px | 通用场景（默认） |
| `small` | 24px | 表格行内操作、标签式按钮 |

## 加载中

添加 `loading` 后按钮进入加载态，**同时阻断点击**，避免重复提交。

<demo src="./demos/button/loading.vue" />

## 禁用

<demo src="./demos/button/disabled.vue" />

> 禁用态与加载态在视觉上共用 `--disabled` 修饰符，但语义不同：禁用是"不可用"，加载是"处理中"。用 `aria-disabled` 表达禁用语义对无障碍更友好。

## 撑满整行

添加 `block` 让按钮宽度撑满父容器，常用于移动端或表单底部。

<demo src="./demos/button/block.vue" />

## 设计规范

| 项 | 规范 |
| --- | --- |
| 最小宽度 | 建议不小于 72px，避免两字按钮过于局促 |
| 相邻间距 | 12px（同组按钮） |
| 主操作位置 | 靠右（对话框）/ 靠左（表单首列） |
| 文案 | 动词开头，2-4 字，如"提交""新建项目" |
| 禁止 | 同一区域出现两个 `primary` |

按钮组排布建议：

```
[ 取消 ]  [ 确定 ]        ← 对话框：主操作最右
[ 查询 ] [ 重置 ]         ← 表单：主操作最左
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型 | `'primary' \| 'default' \| 'dashed' \| 'text'` | `'default'` |
| size | 尺寸 | `'large' \| 'middle' \| 'small'` | `'middle'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中（同时阻断点击） | `boolean` | `false` |
| block | 是否撑满整行 | `boolean` | `false` |

### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| click | 点击时触发（禁用 / 加载中不触发） | `(evt: MouseEvent)` |

### 类型导出

```ts
import type { ButtonProps, ButtonType, ButtonSize, ButtonEmits } from '@aura/components';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-button` | 根节点 |
| `.aura-button--primary` | 主按钮 |
| `.aura-button--dashed` | 虚线按钮 |
| `.aura-button--text` | 文本按钮 |
| `.aura-button--large` / `--small` | 尺寸修饰符（middle 无类） |
| `.aura-button--block` | 撑满整行 |
| `.aura-button--disabled` | 禁用或加载中 |

## 相关文档

- [样式与令牌](/styles/) — 类名索引与 CSS 变量
- [组件设计规范](/guide/design) — 受控模式与命名约定
