# Drawer 抽屉

从屏幕边缘滑出的**就地操作面板**，不离开当前上下文。

## 何时使用

- 列表项的详情 / 编辑（不丢失列表上下文）
- 复杂筛选条件（表单类内容，需要稍大空间）
- 次级任务的快速处理

## 何时不用

| 场景                 | 应该用            |
| -------------------- | ----------------- |
| 简单确认（是 / 否）  | Modal             |
| 轻量提示与快捷操作   | Popover / Tooltip |
| 需要全屏专注的大表单 | 独立页面          |
| 操作结果的短暂反馈   | Message           |

> **核心判断**：Drawer 是「不打断上下文的侧边工作区」。需要用户必须先处理才能继续的用 Modal；一个按钮放得下的用 Popover。

## 基础用法

<demo src="./demos/drawer/basic.vue" />

## 与 Modal 的关系

两者都是 `role="dialog"` + `aria-modal="true"`，共享同一套焦点管理（`use-dialog` 组合式）：打开时焦点移入面板，Tab 在面板内循环，关闭后焦点归还。区别只在**布局与进场动画**——Modal 居中缩放，Drawer 贴边滑动。焦点陷阱、Esc、遮罩点击的行为完全一致。

## 无障碍

`role="dialog"` + `aria-modal="true"` + `aria-label`（取 title）；打开时焦点落到面板本身（读屏先播报对话框名称）；关闭按钮是原生 `<button>`（`aria-label="关闭"`）。

## 设计规范

| 项     | 规范                                                        |
| ------ | ----------------------------------------------------------- |
| 方向   | 默认右侧（B 端惯例）；移动端 / 矮内容可用 bottom            |
| 尺寸   | right 默认 420px；内容为表单时建议 480~560px                |
| 层级   | 同屏只开一层抽屉；叠加抽屉说明信息架构需要重新设计          |
| 动作区 | footer 放主动作（应用 / 取消），与 Modal 的按钮顺序保持一致 |

## API

### Props

| 属性             | 说明                                               | 类型                  | 默认值    |
| ---------------- | -------------------------------------------------- | --------------------- | --------- |
| modelValue       | 是否可见（受控，配合 v-model）                     | `boolean`             | `false`   |
| title            | 标题（可用 title 插槽覆盖）                        | `string`              | `''`      |
| placement        | 贴边方向                                           | `'right' \| 'bottom'` | `'right'` |
| size             | 尺寸：right 时为宽度，bottom 时为高度（数字按 px） | `number \| string`    | `420`     |
| closeOnClickMask | 点击遮罩是否关闭                                   | `boolean`             | `true`    |
| closeOnEsc       | 按 ESC 是否关闭                                    | `boolean`             | `true`    |

### Events

| 事件              | 说明           | 回调参数           |
| ----------------- | -------------- | ------------------ |
| update:modelValue | 显隐变化时触发 | `(value: boolean)` |
| close             | 关闭时触发     | -                  |

### Slots

| 插槽    | 说明                      |
| ------- | ------------------------- |
| default | 内容区                    |
| title   | 标题（优先于 title 属性） |
| footer  | 底部动作区                |

### 类型导出

```ts
import type {
  DrawerProps,
  DrawerPlacement,
  DrawerEmits,
} from '@aura/components';
```

### CSS 类名

| 类名                                                      | 说明                    |
| --------------------------------------------------------- | ----------------------- |
| `.aura-drawer-mask`                                       | 遮罩                    |
| `.aura-drawer-wrap`                                       | 定位容器（role=dialog） |
| `.aura-drawer-panel`                                      | 抽屉面板（焦点容器）    |
| `.aura-drawer--right / --bottom`                          | 贴边方向                |
| `.aura-drawer-header / -title / -close / -body / -footer` | 内部结构                |

## 相关文档

- [Modal 对话框](/components/modal) — 需要打断用户时
- [Popover 弹出框](/components/popover) — 轻量快捷操作
