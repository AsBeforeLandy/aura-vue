# Tooltip 文字提示

鼠标悬停或键盘聚焦时出现的轻量说明，**补充而非替代界面文案**。

## 何时使用

- 图标按钮的含义需要补充说明
- 被截断的文本需要展示全文
- 表单字段的补充解释（比帮助文字更轻）

## 何时不用

| 场景                           | 应该用                      |
| ------------------------------ | --------------------------- |
| 内容是操作的主体               | 直接展示文案                |
| 需要用户点击才能看到的复杂说明 | Popover（后续提供）         |
| 移动端长按才出现的提示         | 不适合 hover 交互，直接展示 |
| 重要到不能错过的警告           | Alert / Modal               |

> **核心判断**：Tooltip 的内容「看不到也不影响完成任务」。必须被看到的信息要直接展示。

## 基础用法

<demo src="./demos/tooltip/basic.vue" />

## 插槽内容与禁用

<demo src="./demos/tooltip/slots.vue" />

## 无障碍与键盘

触发元素带 `aria-describedby` 指向浮层（`role="tooltip"`），**focus 聚焦同样弹出**，`Escape` 关闭——纯 hover 触发对键盘用户不可达，因此两种触发方式同时生效。

## 设计规范

| 项   | 规范                                            |
| ---- | ----------------------------------------------- |
| 文案 | 一短句；超过两行说明信息太重，应放到页面里      |
| 位置 | 默认上方；贴近视口底部时用 `placement="bottom"` |
| 时机 | 纯装饰性提示；不能承载用户必须处理的告警        |

## 已知限制

浮层 Teleport 到 body 并用 `position: fixed` 定位，跟随触发元素滚动（内部滚动容器也会跟踪）。但**不做视口边缘翻转**——触发元素贴着视口上边缘时，`top` 方向的浮层可能溢出，此时请显式指定 `placement="bottom"`。

## API

### Props

| 属性      | 说明                            | 类型                | 默认值  |
| --------- | ------------------------------- | ------------------- | ------- |
| content   | 浮层内容（也可用 content 插槽） | `string`            | `''`    |
| placement | 浮层出现方向                    | `'top' \| 'bottom'` | `'top'` |
| disabled  | 是否禁用                        | `boolean`           | `false` |

### Events

| 事件           | 说明           | 回调参数           |
| -------------- | -------------- | ------------------ |
| visible-change | 显隐变化时触发 | `(value: boolean)` |

### Slots

| 插槽    | 说明                       |
| ------- | -------------------------- |
| default | 触发元素                   |
| content | 浮层内容（优先于 content） |

### 类型导出

```ts
import type { TooltipProps, TooltipPlacement } from '@aura/components';
```

### CSS 类名

| 类名                            | 说明                     |
| ------------------------------- | ------------------------ |
| `.aura-tooltip`                 | 浮层（Teleport 到 body） |
| `.aura-tooltip--top / --bottom` | 出现方向                 |
| `.aura-tooltip-trigger`         | 触发容器                 |

## 相关文档

- [Modal 对话框](/components/modal) — 需要交互的浮层
- [Typography 排版](/components/typography) — 被截断文本的展示
