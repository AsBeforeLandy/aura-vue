# Spin 加载中

表示局部数据正在加载的指示器，**只表达「在加载」，不承载进度**。

## 何时使用

- 区域首次加载、数据量不确定时的占位
- 提交按钮之外的独立区块加载（如卡片、面板）

## 何时不用

| 场景               | 应该用                                  |
| ------------------ | --------------------------------------- |
| 表格 / 列表的加载  | ProTable 自带 loading（v-loading 指令） |
| 已知进度的长任务   | 进度条（后续提供）                      |
| 按钮提交中的状态   | Button 的 `loading` 属性                |
| 操作结果的短暂反馈 | Message（后续提供）                     |

> **核心判断**：Spin 是「区块级占位」。按钮内用 Button loading，表格内用 ProTable 自带 loading，别三层套娃。

## 基础用法

<demo src="./demos/spin/basic.vue" />

## 无障碍

根节点带 `role="status"` + `aria-live="polite"`，加载状态出现与消失会被读屏播报；旋转图形对读屏隐藏（`aria-hidden`），**加载信息由 tip 文案承载**，重要场景请给 `tip`。

## 设计规范

| 项   | 规范                                                            |
| ---- | --------------------------------------------------------------- |
| 尺寸 | small 14px（行内）/ middle 20px（默认）/ large 28px（整块区域） |
| 文案 | 3~8 字，说清「在加载什么」；不带文案时仅适合纯装饰场景          |
| 时长 | 超过 300ms 的加载才显示 Spin，避免闪烁                          |

## API

### Props

| 属性     | 说明                               | 类型                             | 默认值     |
| -------- | ---------------------------------- | -------------------------------- | ---------- |
| spinning | 是否处于加载状态；false 不渲染内容 | `boolean`                        | `true`     |
| size     | 尺寸                               | `'small' \| 'middle' \| 'large'` | `'middle'` |
| tip      | 加载文案（也可用 tip 插槽）        | `string`                         | `''`       |

### Slots

| 插槽 | 说明                        |
| ---- | --------------------------- |
| tip  | 加载文案（优先于 tip 属性） |

### 类型导出

```ts
import type { SpinProps, SpinSize } from '@aura-vue/components';
```

### CSS 类名

| 类名                             | 说明       |
| -------------------------------- | ---------- |
| `.aura-spin`                     | 根节点     |
| `.aura-spin--small/middle/large` | 尺寸档位   |
| `.aura-spin-indicator`           | 旋转指示器 |
| `.aura-spin-tip`                 | 加载文案   |

## 相关文档

- [Button 按钮](/components/button) — 按钮内加载用 loading 属性
- [ProTable 高级表格](/business/pro-table) — 表格自带 loading
