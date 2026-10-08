# Space 间距

让一组元素之间保持统一间距的布局容器。**只管间距，不管语义**。

## 何时使用

- 一排按钮 / 标签 / 图标需要统一间距时
- 纵向堆叠表单项、卡片时
- 替代手写 `margin-right: 8px` 这类「间距写死在每个子元素上」的写法

## 何时不用

| 场景                     | 应该用                    |
| ------------------------ | ------------------------- |
| 需要切分内容主题         | Divider，分隔线是有语义的 |
| 表单字段的标签与控件之间 | Form 的表单项布局         |
| 需要栅格对齐的多列布局   | CSS Grid / 栅格组件       |
| 子元素之间需要紧凑无间距 | 直接并列，不加 Space      |

> **核心判断**：Space 解决的是「这组东西等间距」。一旦间距需要不一致（第一个和后面不同），就该用别的布局方式。

## 基础用法

<demo src="./demos/space/basic.vue" />

## 间距档位与换行

三档间距走全局间距令牌；传数字时按像素处理。`wrap` 开启后行间距与列间距保持一致。

<demo src="./demos/space/size.vue" />

## 设计规范

| 项   | 规范                                                                   |
| ---- | ---------------------------------------------------------------------- |
| 档位 | small 8px（图标与文字）/ middle 12px（同组按钮）/ large 16px（区块间） |
| 方向 | 同一行内并列用 horizontal；表单项堆叠用 vertical                       |
| 数字 | 需要对齐设计稿的特殊间距才传数字，否则用档位                           |
| 嵌套 | Space 可以嵌套（如水平 Space 里放垂直 Space），但两层以上应反思布局    |

## API

### Props

| 属性      | 说明                                 | 类型                                         | 默认值         |
| --------- | ------------------------------------ | -------------------------------------------- | -------------- |
| direction | 排列方向                             | `'horizontal' \| 'vertical'`                 | `'horizontal'` |
| size      | 间距：预设档位（走间距令牌）或像素值 | `'small' \| 'middle' \| 'large' \| number`   | `'middle'`     |
| wrap      | 是否允许换行（仅水平方向有意义）     | `boolean`                                    | `false`        |
| align     | 对齐方式；不传时水平居中、垂直顶对齐 | `'start' \| 'center' \| 'end' \| 'baseline'` | -              |

### Slots

| 插槽    | 说明   |
| ------- | ------ |
| default | 子元素 |

### 类型导出

```ts
import type {
  SpaceProps,
  SpaceDirection,
  SpaceSize,
  SpaceAlign,
} from '@aura-vue/components';
```

### CSS 类名

| 类名                                           | 说明                |
| ---------------------------------------------- | ------------------- |
| `.aura-space`                                  | 根节点（flex 容器） |
| `.aura-space--horizontal/vertical`             | 排列方向            |
| `.aura-space--size-small/middle/large`         | 间距档位            |
| `.aura-space--wrap`                            | 允许换行            |
| `.aura-space--align-start/center/end/baseline` | 对齐方式            |

## 相关文档

- [Divider 分割线](/components/divider) — 需要切分主题而不是拉开距离时
- [主题定制](/guide/theme) — 间距令牌的取值与覆盖
