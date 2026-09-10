# Modal 对话框

在当前页面之上弹出模态浮层，用于承载需要用户集中注意力的内容。

## 何时使用

- 需要用户处理事务，但不想离开当前页面时
- 需要承载表单、确认操作或详细信息时
- 需要阻断式交互，强制用户做出决定时

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 只是提示信息，不需要用户响应 | Message 全局提示（待提供） |
| 轻量确认（删除一行数据） | Popconfirm 气泡确认框（待提供） |
| 内容较多、需要独立地址可分享 | 独立的页面或抽屉 |
| 频繁打开关闭 | 考虑内联展开，弹窗会打断操作流 |

## 基础用法

<demo src="./demos/modal/basic.vue" />

## 自定义底部

通过 `footer` 插槽完全接管底部区域：

<demo src="./demos/modal/custom-footer.vue" />

也可以设置 `:footer="false"` 隐藏整个底部区域。

## 事件

组件在不同关闭路径上触发不同事件，便于你区分用户意图：

<demo src="./demos/modal/events.vue" />

| 触发路径 | `ok` | `cancel` | `close` |
| --- | --- | --- | --- |
| 点击「确定」 | ✅ | - | ✅ |
| 点击「取消」 | - | ✅ | ✅ |
| 点击遮罩 | - | - | ✅ |
| 按 `Esc` | - | - | ✅ |
| 点击右上角 `×` | - | - | ✅ |

> `close` 是「无论怎么关都触发」的事件，适合做埋点或状态清理；`ok` / `cancel` 用于区分用户意图。

## 表单 + 对话框

最常见的组合形态：对话框内嵌表单，点击确定时先校验、通过后再关闭。

<demo src="./demos/form/in-modal.vue" />

:::tip
打开对话框前建议先 `resetValidation()`，避免上一次的错误提示残留到下一次。
:::

## 宽度

`width` 支持数字（按 px 处理）或字符串（任意 CSS 宽度值）：

```vue
<Modal v-model="open" width="720">   <!-- 数字 -->
<Modal v-model="open" width="60%">   <!-- 字符串 -->
<Modal v-model="open" width="48rem"> <!-- 任意 CSS 值 -->
```

<demo src="./demos/modal/form.vue" />

## 渲染位置

对话框通过 `Teleport to="body"` 渲染，因此**不受父级 `overflow`、`transform`、`z-index` 层叠上下文影响**。这是把弹层挂在 DOM 树末端换来的稳定性。

## 设计规范

| 项 | 规范 |
| --- | --- |
| 宽度 | 简单确认 400px，表单 520px，复杂内容 640 ~ 720px |
| 标题 | 动词短语，说明这是要做什么（如"新建项目"），而非"提示" |
| 按钮 | 主操作在右（确定），次操作在左（取消） |
| 遮罩点击 | 含未保存内容的表单弹窗，建议 `:close-on-click-mask="false"` |
| 内容高度 | 超过视口时应在 body 区域内部滚动，而非整页滚动 |

:::warning
**Modal 不会锁定页面滚动**。当前版本的遮罩不做 `overflow: hidden` 处理，遮罩外的页面仍可滚动。若需锁定，请在打开时自行处理：

```ts
watch(open, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});
```
:::

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 是否可见 | `boolean` | `false` |
| title | 标题（可用 `title` 插槽覆盖） | `string` | `''` |
| width | 宽度，数字按 px 处理 | `number \| string` | `520` |
| closeOnClickMask | 点击遮罩是否关闭 | `boolean` | `true` |
| closeOnEsc | 按 ESC 是否关闭 | `boolean` | `true` |
| footer | 是否展示底部按钮区 | `boolean` | `true` |

### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 显隐变化时触发 | `(value: boolean)` |
| ok | 点击确定时触发 | - |
| cancel | 点击取消时触发 | - |
| close | 关闭时触发（含遮罩 / ESC / 右上角 ×） | - |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| default | 主体内容 |
| title | 自定义标题 |
| footer | 自定义底部按钮区 |

### 类型导出

```ts
import type { ModalProps, ModalEmits } from '@aura/components';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-modal` | 容器 |
| `.aura-modal-mask` | 遮罩层 |
| `.aura-modal-wrap` | 定位包裹层 |
| `.aura-modal-panel` | 面板主体 |
| `.aura-modal-header` | 头部 |
| `.aura-modal-title` | 标题 |
| `.aura-modal-close` | 关闭按钮 |
| `.aura-modal-body` | 内容区 |
| `.aura-modal-footer` | 底部按钮区 |

## 相关文档

- [Form 表单](/components/form) — 对话框内嵌表单的校验联动
- [样式与令牌](/styles/) — 完整类名索引
