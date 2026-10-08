# Typography 排版

统一文本的标题层级、语义色与行内强调，让页面文字有一致的尺度。

## 何时使用

- 需要规范标题层级（h1~h4）而不是随手写 `font-size` 时
- 需要语义色的次要 / 成功 / 警告 / 危险文本时
- 需要加粗 / 下划线 / 删除线等行内强调时

## 何时不用

| 场景                        | 应该用                  |
| --------------------------- | ----------------------- |
| 富文本正文（Markdown 渲染） | 内容区的排版样式        |
| 状态标记                    | Tag，状态是标签不是文字 |
| 表单里的字段标签            | Form 的表单项           |
| 只是需要换行分段            | 原生 `p` / `br`         |

> **核心判断**：Typography 解决「这页文字尺度不统一」。纯展示性长文交给内容区样式，别逐段包组件。

## 标题层级

<demo src="./demos/typography/basic.vue" />

## 语义色与行内强调

<demo src="./demos/typography/text.vue" />

## 设计规范

| 项     | 规范                                                    |
| ------ | ------------------------------------------------------- |
| 层级   | 一屏一个 h1；h3/h4 用于卡片与区块标题，避免跳级         |
| 语义色 | secondary 用于辅助说明；success/warning/danger 只表状态 |
| 强调   | strong 表重要，delete 表废弃；下划线仅用于可点击文本    |
| 行高   | 标题用固定行高（32/28/24/22），保证多行标题的节奏一致   |

## API

### Props

| 属性      | 说明                                     | 类型                                                | 默认值  |
| --------- | ---------------------------------------- | --------------------------------------------------- | ------- |
| level     | 标题级别；设置后渲染 h1~h4，不设置渲染 p | `1 \| 2 \| 3 \| 4`                                  | -       |
| type      | 语义色                                   | `'secondary' \| 'success' \| 'warning' \| 'danger'` | -       |
| strong    | 加粗                                     | `boolean`                                           | `false` |
| underline | 下划线                                   | `boolean`                                           | `false` |
| delete    | 删除线                                   | `boolean`                                           | `false` |

### Slots

| 插槽    | 说明     |
| ------- | -------- |
| default | 文本内容 |

### 类型导出

```ts
import type {
  TypographyProps,
  TypographyLevel,
  TypographyType,
} from '@aura-vue/components';
```

### CSS 类名

| 类名                                                 | 说明     |
| ---------------------------------------------------- | -------- |
| `.aura-typography`                                   | 根节点   |
| `.aura-typography--h1/h2/h3/h4`                      | 标题层级 |
| `.aura-typography--secondary/success/warning/danger` | 语义色   |
| `.aura-typography--strong/underline/delete`          | 行内强调 |

## 相关文档

- [Tag 标签](/components/tag) — 状态标记用标签而不是彩色文字
- [主题定制](/guide/theme) — 颜色令牌的取值与覆盖
