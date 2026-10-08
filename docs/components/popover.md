# Popover 弹出框

点击触发的**可交互**浮层，比 Tooltip 承载更重的内容。

## 何时使用

- 单元格 / 图标的快捷操作（确认删除、快捷设置）
- 表单字段的补充说明（带链接或按钮的富内容）
- 轻量的二级确认（带动作区）

## 何时不用

| 场景                   | 应该用                |
| ---------------------- | --------------------- |
| 纯文字的悬停提示       | Tooltip，hover 更轻   |
| 需要打断用户的全局操作 | Modal，强交互用对话框 |
| 几秒后消失的操作反馈   | Message               |
| 内容多到需要滚动       | 抽屉 / 独立页面       |

> **核心判断**：Popover 是「轻量的就地操作面板」。内容里放不下两行文字就升级 Modal，纯提示就降级 Tooltip。

## 基础用法

<demo src="./demos/popover/basic.vue" />

## 与 Tooltip 的分工

| 维度     | Tooltip                                       | Popover              |
| -------- | --------------------------------------------- | -------------------- |
| 触发     | hover / focus                                 | click                |
| 内容     | 纯文字（一短句）                              | 标题 + 富内容 + 动作 |
| 可交互   | 否（不吃指针）                                | 是（点击面板不关闭） |
| 定位方案 | 同一套（共用组合式），方向均支持 top / bottom |

## 无障碍

触发元素带 `aria-expanded` / `aria-controls`；面板是 `role="dialog"` + `aria-modal="false"` 的**非模态**对话框，带标题时通过 `aria-labelledby` 关联。`Escape` 与点击外部都会关闭。

## 设计规范

| 项     | 规范                                            |
| ------ | ----------------------------------------------- |
| 内容   | 一两句话 + 至多两个动作；再多就该用 Modal       |
| 动作区 | 放主操作（确定 / 取消），危险操作用 danger 色   |
| 方向   | 默认上方；贴近视口底部时用 `placement="bottom"` |

## 已知限制

与 Tooltip 同源：不做视口边缘翻转，触发元素贴边时请显式指定 `placement`。

## API

### Props

| 属性      | 说明                      | 类型                | 默认值  |
| --------- | ------------------------- | ------------------- | ------- |
| title     | 标题（也可用 title 插槽） | `string`            | `''`    |
| placement | 浮层出现方向              | `'top' \| 'bottom'` | `'top'` |
| disabled  | 是否禁用                  | `boolean`           | `false` |

### Events

| 事件           | 说明           | 回调参数           |
| -------------- | -------------- | ------------------ |
| visible-change | 显隐变化时触发 | `(value: boolean)` |

### Slots

| 插槽    | 说明                          |
| ------- | ----------------------------- |
| default | 触发元素                      |
| title   | 标题内容（优先于 title 属性） |
| content | 面板内容                      |
| footer  | 动作区（按钮组）              |

### 类型导出

```ts
import type { PopoverProps, PopoverPlacement } from '@aura-vue/components';
```

### CSS 类名

| 类名                                       | 说明                     |
| ------------------------------------------ | ------------------------ |
| `.aura-popover`                            | 面板（Teleport 到 body） |
| `.aura-popover--top / --bottom`            | 出现方向                 |
| `.aura-popover-title / -content / -footer` | 内部结构                 |
| `.aura-popover-trigger`                    | 触发容器                 |

## 相关文档

- [Tooltip 文字提示](/components/tooltip) — 纯文字悬停提示
- [Modal 对话框](/components/modal) — 需要打断用户时
