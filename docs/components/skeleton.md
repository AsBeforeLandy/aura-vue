# Skeleton 骨架屏

内容加载前的**结构预告**，用灰块勾勒即将出现的布局。

## 何时使用

- 首屏或区块首次加载，且布局已知（卡片、详情页）
- 比 Spin 更好的场景：**页面结构固定**，骨架能减少布局跳动

## 何时不用

| 场景                    | 应该用                 |
| ----------------------- | ---------------------- |
| 布局不确定的加载        | Spin                   |
| 操作反馈（提交 / 保存） | Button 的 loading      |
| 内容为空的最终状态      | Empty，骨架不是空状态  |
| 局部小按钮 / 图标的加载 | 对应组件自身的 loading |

> **核心判断**：Skeleton 是「布局已知时的占位」。布局都不确定就谈不上骨架；加载完成但没数据，要用 Empty 而不是一直转骨架。

## 基础用法

<demo src="./demos/skeleton/basic.vue" />

## 无障碍

根节点带 `aria-busy`：加载中为 `true`，加载完成为 `false`；骨架块对读屏隐藏（`aria-hidden`），真实内容由 `loading=false` 后的插槽承载。**不要让骨架屏停留超过必要时间**——超时的加载该暴露错误，而不是一直占位。

## 设计规范

| 项   | 规范                                                   |
| ---- | ------------------------------------------------------ |
| 结构 | 骨架的块数与位置应贴近真实内容，避免加载完成后大幅跳动 |
| 组合 | 列表页用 avatar + rows；详情页用 title + rows          |
| 动效 | 呼吸脉冲（respect reduced-motion：自动静止）           |

## API

### Props

| 属性    | 说明                                     | 类型      | 默认值  |
| ------- | ---------------------------------------- | --------- | ------- |
| loading | 是否处于加载态；`false` 渲染插槽真实内容 | `boolean` | `true`  |
| title   | 是否显示标题条                           | `boolean` | `true`  |
| avatar  | 是否显示头像圆                           | `boolean` | `false` |
| rows    | 段落条数（负数按 0 处理）                | `number`  | `3`     |

### Slots

| 插槽    | 说明                             |
| ------- | -------------------------------- |
| default | 真实内容（loading=false 时渲染） |

### 类型导出

```ts
import type { SkeletonProps } from '@aura-vue/components';
```

### CSS 类名

| 类名                                    | 说明                   |
| --------------------------------------- | ---------------------- |
| `.aura-skeleton`                        | 根节点                 |
| `.aura-skeleton-header / -content`      | 头像区 / 内容区        |
| `.aura-skeleton-avatar / -title / -row` | 头像 / 标题条 / 段落条 |
| `.aura-skeleton-row--last`              | 末行（短一截）         |

## 相关文档

- [Spin 加载中](/components/spin) — 布局不确定时
- [Empty 空状态](/components/empty) — 加载完成但没有数据时
