# Tree 树形控件

展示**层级结构数据**并支持节点选中。

## 何时使用

- 组织架构、目录结构、分类树
- 层级数据的单选定位（选中一个节点）

## 何时不用

| 场景               | 应该用                                    |
| ------------------ | ----------------------------------------- |
| 面包屑式的当前位置 | Breadcrumb                                |
| 扁平列表的选择     | Select                                    |
| 多选 / 勾选        | 暂未提供（Tree 的 checkbox 模式在规划中） |
| 需要拖拽排序       | 暂未提供                                  |

> **核心判断**：Tree 表达「层级 + 逐层展开」。数据不是树形就别硬套。

## 基础用法

<demo src="./demos/tree/basic.vue" />

## 展开与选中

展开状态由组件内部维护（`default-expanded-keys` 指定初始展开，`expand-all` 一键全开）；**选中**是双轨受控（`v-model`），点击有子节点的节点会顺带切换展开。

## 无障碍

`ul role="tree"` / `li role="treeitem"`（带 `aria-level`、`aria-expanded`、`aria-selected`）/ 子级 `role="group"`。节点行是原生 `<button>`，可 Tab 到达、Enter 激活。**方向键树导航（↑↓ 移动、→ 展开、← 收起）是已知限制**，当前版本请用指针操作。

## 设计规范

| 项     | 规范                                                          |
| ------ | ------------------------------------------------------------- |
| 层级   | 建议不超过 4 层；过深的层级先考虑信息架构                     |
| 文案   | 节点名一致长度最佳；过长省略号截断                            |
| 默认态 | 常用入口用 default-expanded-keys 预展开，避免用户盲目逐层点开 |

## API

### Props

| 属性                | 说明                                                 | 类型         | 默认值  |
| ------------------- | ---------------------------------------------------- | ------------ | ------- |
| data                | 树形数据（`{ label, value, children?, disabled? }`） | `TreeNode[]` | `[]`    |
| modelValue          | 受控选中值                                           | `string`     | -       |
| defaultValue        | 非受控初始选中值                                     | `string`     | -       |
| defaultExpandedKeys | 初始展开的节点集合                                   | `string[]`   | `[]`    |
| expandAll           | 是否默认展开全部（优先于 expandedKeys）              | `boolean`    | `false` |

### Events

| 事件              | 说明     | 回调参数          |
| ----------------- | -------- | ----------------- |
| update:modelValue | 选中变化 | `(value: string)` |
| change            | 选中变化 | `(value: string)` |

### 类型导出

```ts
import type { TreeProps, TreeNode, TreeEmits } from '@aura/components';
```

### CSS 类名

| 类名                                           | 说明                |
| ---------------------------------------------- | ------------------- |
| `.aura-tree`                                   | 根节点（role=tree） |
| `.aura-tree-group`                             | 子级分组            |
| `.aura-tree-row` / `--selected` / `--disabled` | 节点行              |
| `.aura-tree-arrow / -label`                    | 箭头 / 文案         |

## 已知限制

- 暂不支持多选勾选、拖拽排序、异步加载子节点
- 方向键导航待实现（见无障碍说明）

## 相关文档

- [Breadcrumb 面包屑](/components/breadcrumb) — 层级位置展示
- [Segmented 分段控制器](/components/segmented) — 方向键循环切换的实现参照
