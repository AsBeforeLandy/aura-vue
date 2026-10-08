# Collapse 折叠面板

把成组的内容**按需展开收起**，减少长页面的视觉负担。

## 何时使用

- FAQ / 帮助中心的一问一答
- 设置页的低频分组（默认收起，需要时展开）
- 长表单的辅助说明区域

## 何时不用

| 场景                 | 应该用                   |
| -------------------- | ------------------------ |
| 同级内容需要并排对比 | Tabs，一屏只见一个也一样 |
| 内容需要默认可见     | 直接排版，别折叠重要信息 |
| 步骤性的引导         | Steps                    |
| 页面级导航           | 菜单 / Tree              |

> **核心判断**：Collapse 折起来的内容应该是「可选读的补充」；用户完成任务必须看到的内容不要折叠。

## 基础用法

<demo src="./demos/collapse/basic.vue" />

## 组合方式

`Collapse` + `CollapseItem` 组合使用（item 通过 provide/inject 拿到展开状态）：

```vue
<Collapse v-model="openKeys" accordion>
  <CollapseItem title="问题" value="q1">答案</CollapseItem>
</Collapse>
```

`v-model` 绑定**展开项 value 的数组**；`accordion` 模式下同时最多展开一项。`value` 必填且组内唯一。

## 无障碍

标题行是原生 `<button>`（`aria-expanded` + `aria-controls`），面板是 `role="region"` 并通过 `aria-labelledby` 回指标题——读屏用户能听到每块面板「是否展开、属于谁」。禁用项不可展开，读屏播报禁用态。

## 设计规范

| 项     | 规范                                                         |
| ------ | ------------------------------------------------------------ |
| 层级   | 只做一层折叠；嵌套折叠说明信息结构有问题                     |
| 动效   | 网格展开动画（0fr → 1fr），prefers-reduced-motion 下直接切换 |
| 默认态 | 最多默认展开一项；FAQ 类页面可以全部收起                     |

## API

### Collapse Props

| 属性         | 说明                      | 类型       | 默认值  |
| ------------ | ------------------------- | ---------- | ------- |
| modelValue   | 展开项 value 集合（受控） | `string[]` | -       |
| defaultValue | 非受控初始展开集合        | `string[]` | -       |
| accordion    | 手风琴模式                | `boolean`  | `false` |

### CollapseItem Props

| 属性     | 说明                     | 类型      | 默认值  |
| -------- | ------------------------ | --------- | ------- |
| title    | 面板标题（可用插槽覆盖） | `string`  | `''`    |
| value    | 面板值（组内唯一，必填） | `string`  | -       |
| disabled | 是否禁用                 | `boolean` | `false` |

### Events（Collapse）

| 事件              | 说明         | 回调参数            |
| ----------------- | ------------ | ------------------- |
| update:modelValue | 展开集合变化 | `(value: string[])` |
| change            | 展开集合变化 | `(value: string[])` |

### Slots

| 插槽    | 归属         | 说明                      |
| ------- | ------------ | ------------------------- |
| default | Collapse     | CollapseItem 列表         |
| default | CollapseItem | 面板内容                  |
| title   | CollapseItem | 标题（优先于 title 属性） |

### 类型导出

```ts
import type {
  CollapseProps,
  CollapseItemProps,
  CollapseContext,
} from '@aura/components';
```

### CSS 类名

| 类名                                        | 说明             |
| ------------------------------------------- | ---------------- |
| `.aura-collapse-item`                       | 条目容器         |
| `.aura-collapse-header`                     | 标题行（button） |
| `.aura-collapse-title / -arrow`             | 标题 / 箭头      |
| `.aura-collapse-content` / `-content-inner` | 面板（网格动画） |
| `.aura-collapse-item--open / --disabled`    | 状态修饰         |

## 相关文档

- [Tabs 标签页](/components/tabs) — 同级内容互斥展示
- [Empty 空状态](/components/empty) — 折叠内容为空时
