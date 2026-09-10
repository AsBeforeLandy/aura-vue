# Switch 开关

表示两种互斥状态的切换，**操作后即时生效**。

## 何时使用

- 需要切换单个设置项的开启 / 关闭状态时
- 切换后立即生效、无需二次确认时
- 表单中表达布尔字段时

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 两个选项是并列关系（如"日 / 夜"） | 单选组或分段控件 |
| 切换需要点击保存才生效 | 复选框，语义上更贴近"待提交" |
| 需要用户从多个选项中多选 | 复选框组 |
| 强调操作的过程而非状态 | 按钮 |

> **核心判断**：Switch 表达"状态"，Checkbox 表达"选择"。若开关的文案是名词短语（"开启通知"），用 Switch；若是动作（"同意协议"），用 Checkbox。

## 基础用法

<demo src="./demos/switch/basic.vue" />

## 受控 / 非受控与禁用

<demo src="./demos/switch/states.vue" />

与 Input、Select 一致，Switch 同样支持双轨模式：

| 传入 | 模式 |
| --- | --- |
| `v-model` | 受控，值由外部驱动 |
| `default-value` | 非受控，内部自持并 emit 通知 |

## 无障碍

组件内部使用 `role="switch"` + `aria-checked` 表达状态，键盘可用 `Tab` 聚焦、`Space` / `Enter` 触发。因此**不要用纯 `div` 模拟开关**，会让屏幕阅读器无法识别。

## 设计规范

| 项 | 规范 |
| --- | --- |
| 文案位置 | 开关放右侧，标签放左侧（`[开启通知]  [●—]`） |
| 文案内容 | 用肯定式名词短语描述「开启后是什么状态」，避免"是否…" |
| 反馈 | 立即生效的开关建议配合 Message 提示结果（如"已开启通知"） |
| 危险操作 | 关闭某个关键能力时，用 Modal 二次确认 |

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 受控值（传入即视为受控模式） | `boolean` | - |
| defaultValue | 非受控模式初始值 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |

### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 状态变化时触发 | `(value: boolean)` |
| change | 状态变化时触发 | `(value: boolean)` |

### 类型导出

```ts
import type { SwitchProps, SwitchEmits } from '@aura/components';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-switch` | 根节点 |
| `.aura-switch--on` | 开启态 |
| `.aura-switch--disabled` | 禁用态 |
| `.aura-switch-dot` | 滑块圆点 |

## 相关文档

- [Select 选择器](/components/select) — 多选项场景
- [组件设计规范](/guide/design#受控与非受控) — 双轨模式实现原理
