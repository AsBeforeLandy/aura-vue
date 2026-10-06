# Alert 提醒

向用户展示需要**关注但不必立即处理**的信息，按语义分四级。

## 何时使用

- 页面顶部展示全局状态（维护通知、配额告警）
- 操作结果需要较长时间驻留（不是几秒后消失的轻提示）
- 表单 / 详情页顶部展示校验或同步状态

## 何时不用

| 场景                     | 应该用                   |
| ------------------------ | ------------------------ |
| 几秒后自动消失的操作反馈 | 轻量 Message（后续提供） |
| 标记列表行的状态         | Tag，状态是标签不是横幅  |
| 需要用户做出选择才能继续 | Modal，强交互用对话框    |
| 纯装饰性的文案说明       | Typography 的次要色文本  |

> **核心判断**：Alert 驻留且带语义色；会消失的用 Message，要打断的用 Modal。

## 基础用法

<demo src="./demos/alert/basic.vue" />

## 可关闭与双轨显隐

显隐双轨与 Tag 一致：`v-model:visible` 受控 / `default-visible` 非受控。

<demo src="./demos/alert/closable.vue" />

## 无障碍

根节点带 `role="alert"`，内容变化会被读屏播报；关闭控件是原生 `<button>`（`aria-label="关闭"`）。图标是纯装饰（`aria-hidden`），**状态语义不要只靠图标颜色表达**，标题文字要写清楚。

## 设计规范

| 项   | 规范                                                    |
| ---- | ------------------------------------------------------- |
| 层级 | 一屏最多一条常驻 Alert；多条说明信息架构有问题          |
| 用色 | 与 Tag 同源：柔和表面 + 加深文字；danger 只用于真正出错 |
| 文案 | 标题写结论（「同步失败」），描述写原因和下一步动作      |
| 图标 | `show-icon` 用于需要快速扫视的横幅；普通说明可省        |
| 关闭 | 用户可以「不再看到」的提示才给 `closable`               |

## API

### Props

| 属性           | 说明                           | 类型                                           | 默认值   |
| -------------- | ------------------------------ | ---------------------------------------------- | -------- |
| type           | 提示类型；`info` 为中性        | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |
| title          | 标题（也可用 title 插槽）      | `string`                                       | `''`     |
| showIcon       | 是否显示类型图标               | `boolean`                                      | `false`  |
| closable       | 是否显示关闭按钮               | `boolean`                                      | `false`  |
| visible        | 受控显隐（传入即视为受控模式） | `boolean`                                      | -        |
| defaultVisible | 非受控模式初始显隐             | `boolean`                                      | `true`   |

### Events

| 事件           | 说明               | 回调参数            |
| -------------- | ------------------ | ------------------- |
| update:visible | 显隐请求变化时触发 | `(value: boolean)`  |
| close          | 点击关闭按钮时触发 | `(evt: MouseEvent)` |

### Slots

| 插槽    | 说明                     |
| ------- | ------------------------ |
| default | 描述内容                 |
| title   | 标题内容（优先于 title） |

### 类型导出

```ts
import type { AlertProps, AlertType } from '@aura/components';
```

### CSS 类名

| 类名                                                    | 说明                   |
| ------------------------------------------------------- | ---------------------- |
| `.aura-alert`                                           | 根节点（中性外观）     |
| `.aura-alert--info/success/warning/danger`              | 语义色                 |
| `.aura-alert--show-icon`                                | 显示图标               |
| `.aura-alert--with-title`                               | 带标题（描述退为次级） |
| `.aura-alert-icon / -content / -title / -desc / -close` | 内部结构               |

## 相关文档

- [Tag 标签](/components/tag) — 行内状态标记
- [Modal 对话框](/components/modal) — 需要用户处理才能继续时
