# Tabs 标签页

在同一层级的内容之间切换，**同屏只显示一个**。

## 何时使用

- 详情页的多块信息（基本信息 / 安全设置 / 日志）
- 工作区的多视图切换
- 设置页的分类分节

## 何时不用

| 场景                   | 应该用            |
| ---------------------- | ----------------- |
| 分步流程（有先后依赖） | Steps             |
| 即选即用的过滤开关     | Segmented         |
| 只是页面路径的跳转     | Breadcrumb / 导航 |
| 内容需要同时可见对比   | 分栏布局          |

> **核心判断**：Tabs 表达「同级内容、互斥展示」。步骤流程用 Steps，轻量开关用 Segmented。

## 基础用法

<demo src="./demos/tabs/basic.vue" />

## 面板渲染方式

面板内容从具名插槽 `panel-<value>` 取，**只渲染当前激活项**（懒渲染，切换即重建）：

```vue
<Tabs v-model="active" :items="items">
  <template #panel-base>...</template>
  <template #panel-security>...</template>
</Tabs>
```

没有对应插槽的标签退化为「纯导航 tab」——只渲染 tablist，内容由消费方自行切换。需要面板保活（切换不销毁）的场景请用 tab-only 用法配合 `v-show`。

## 无障碍

完整的 WAI-ARIA tabs 模式：`tablist` / `tab` / `tabpanel`，`aria-selected` + `aria-controls` / `aria-labelledby` 双向关联。键盘遵循 tabs 惯例：只有选中项可 Tab 到达（roving tabindex），左右方向键在**可用项**之间循环（跳过禁用项）。

## 设计规范

| 项   | 规范                                                       |
| ---- | ---------------------------------------------------------- |
| 数量 | 2~7 个；更多用 Select 或二级导航                           |
| 文案 | 2~5 字名词；各标签内容体量接近，避免面板高度剧烈跳动       |
| 禁用 | 禁用标签保留位置并给提示；第一项禁用时默认选中第一个可用项 |

## API

### Props

| 属性         | 说明                                      | 类型        | 默认值 |
| ------------ | ----------------------------------------- | ----------- | ------ |
| items        | 标签列表（`{ label, value, disabled? }`） | `TabItem[]` | `[]`   |
| modelValue   | 受控值（传入即视为受控模式）              | `string`    | -      |
| defaultValue | 非受控模式初始值；不传时选中第一个可用项  | `string`    | -      |

### Events

| 事件              | 说明       | 回调参数          |
| ----------------- | ---------- | ----------------- |
| update:modelValue | 切换时触发 | `(value: string)` |
| change            | 切换时触发 | `(value: string)` |

### Slots

| 插槽            | 说明                               |
| --------------- | ---------------------------------- |
| panel-\<value\> | 对应标签的面板内容（只渲染激活项） |

### 类型导出

```ts
import type { TabsProps, TabItem, TabsEmits } from '@aura-vue/components';
```

### CSS 类名

| 类名                                         | 说明              |
| -------------------------------------------- | ----------------- |
| `.aura-tabs-list`                            | 标签栏（tablist） |
| `.aura-tabs-tab` / `--active` / `--disabled` | 标签按钮          |
| `.aura-tabs-panel`                           | 面板（tabpanel）  |

## 相关文档

- [Steps 步骤条](/components/steps) — 有先后依赖的流程
- [Segmented 分段控制器](/components/segmented) — 轻量视图开关
