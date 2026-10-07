# Message 全局消息

操作结果的**轻量反馈**，顶部居中出现、数秒后自动消失。

## 何时使用

- 保存 / 提交 / 删除成功的结果确认
- 操作失败但用户可以自行重试
- 需要用户知晓但不必立即处理的状态变化

## 何时不用

| 场景                   | 应该用                   |
| ---------------------- | ------------------------ |
| 需要用户处理才能继续   | Modal                    |
| 需要驻留查看的详细说明 | Alert，反馈要能停留      |
| 某个区域的加载状态     | Spin / Button 的 loading |
| 引导用户做下一步决策   | Popover / 页面内布局     |

> **核心判断**：Message 是「告知结果」。用户扫一眼就行；需要他看清、看完、照着做的，用 Alert。

## 基础用法

<demo src="./demos/message/basic.vue" />

## 使用方式

Message 是**命令式 API**（函数调用），不是组件——不要写 `<Message />`，也不要注册到全局组件：

```ts
import { Message } from '@aura/components';

Message.success('已保存');
Message.danger('同步失败', { duration: 0, closable: true });
```

默认 3 秒自动关闭；`duration: 0` 表示不自动关闭（须配合 `closable`），返回值上的 `close()` 可以提前手动收掉某一条。

## 无障碍

容器带 `role="alert"` 语义：消息出现时读屏会播报。**不要用 Message 传递需要阅读多秒的长文本**——读屏与视觉用户都来不及。

## 设计规范

| 项   | 规范                                                       |
| ---- | ---------------------------------------------------------- |
| 文案 | 一句话结论（「已保存」「同步失败」），原因与下一步交给详情 |
| 时长 | 默认 3s；含「重试」类动作时给 `closable` + `duration: 0`   |
| 数量 | 连续操作会堆叠，同一动作不要重复触发多条相同消息           |

## API

### 方法

| 方法              | 说明            | 参数                          |
| ----------------- | --------------- | ----------------------------- |
| `Message.info`    | 普通消息        | `(content: string, options?)` |
| `Message.success` | 成功消息        | 同上                          |
| `Message.warning` | 警告消息        | 同上                          |
| `Message.danger`  | 失败 / 危险消息 | 同上                          |

### MessageOptions

| 属性     | 说明                                   | 类型      | 默认值  |
| -------- | -------------------------------------- | --------- | ------- |
| duration | 自动关闭时长（ms）；`0` 表示不自动关闭 | `number`  | `3000`  |
| closable | 是否显示关闭按钮                       | `boolean` | `false` |

### 返回值

`MessageHandle`：`{ close(): void }`，可提前手动关闭该条消息。

### 类型导出

```ts
import type {
  MessageOptions,
  MessageType,
  MessageHandle,
} from '@aura/components';
```

### CSS 类名

| 类名                                         | 说明                       |
| -------------------------------------------- | -------------------------- |
| `.aura-message-container`                    | 顶部容器（共享、自动移除） |
| `.aura-message`                              | 单条消息                   |
| `.aura-message--info/success/warning/danger` | 语义色                     |
| `.aura-message-icon / -content / -close`     | 内部结构                   |

## 相关文档

- [Alert 提醒](/components/alert) — 需要驻留查看时
- [Modal 对话框](/components/modal) — 需要用户决策时
