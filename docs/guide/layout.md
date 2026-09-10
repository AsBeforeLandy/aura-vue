# 布局与排版

本文档说明 Aura Vue 在布局与排版上的约定：间距节奏、尺寸阶梯、内容宽度与对齐规则。

## 间距节奏

组件库统一使用 **4px 基准栅格**。所有内边距、外边距、间隙都应是 4 的整数倍，避免出现 5px、7px 这类"野生值"。

| 名称 | 值 | 典型用途 |
| --- | --- | --- |
| `xs` | 4px | 图标与文字之间的间隙 |
| `sm` | 8px | 控件内部左右内边距、行内元素间隙 |
| `md` | 12px | 同组控件之间的间隙 |
| `lg` | 16px | 表单项之间的垂直间距 |
| `xl` | 24px | 卡片内边距、区块之间的间距 |
| `2xl` | 32px | 页面级区块分隔 |

> 组件库目前不提供 `Space` 布局组件，多控件排列请使用原生 Flex 并遵循上述节奏。组件内部已有的间距已按此规范预设。

### 行内排列

同一行内的多个控件使用 flex + `gap` 排列，**不要用 margin 拼接**——gap 不会产生首尾多余外边距：

```vue
<template>
  <div class="toolbar">
    <Input v-model="keyword" placeholder="搜索" clearable />
    <Button type="primary">查询</Button>
    <Button>重置</Button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
```

### 垂直排列

表单项之间使用 16px 垂直间距：

```vue
<template>
  <Form :model="model" class="form">
    <FormItem label="姓名" prop="name">
      <Input v-model="model.name" />
    </FormItem>
    <FormItem label="邮箱" prop="email">
      <Input v-model="model.email" />
    </FormItem>
  </Form>
</template>

<style scoped>
.form :deep(.aura-form-item) {
  margin-bottom: 16px;
}
</style>
```

## 尺寸阶梯

组件尺寸统一采用三档阶梯，命名在各组件中保持一致：

| 档位 | Button | 控件高度 | 字号 |
| --- | --- | --- | --- |
| `large` | `size="large"` | 40px | 16px |
| `middle` | 默认 | 32px | 14px |
| `small` | `size="small"` | 24px | 12px |

> 表单控件（Input / Select）默认高度与 Button 的 `middle` 对齐，混排时无需额外调整。

## 内容宽度

| 场景 | 推荐宽度 | 说明 |
| --- | --- | --- |
| 单行输入框 | 200 ~ 280px | 过宽会降低可读性 |
| 搜索框 | 240 ~ 320px | 配合搜索按钮 |
| 下拉选择器 | 与触发框等宽 | 组件已自动对齐 |
| 对话框 | 520px（默认） | 简单表单场景 |
| 表单页面 | 480 ~ 640px | 单列布局，便于纵向扫读 |

不宜设置固定宽度时，使用 `max-width` 兜底：

```vue
<Input v-model="value" placeholder="请输入内容" style="max-width: 280px" />
```

## 对齐规则

| 规则 | 说明 |
| --- | --- |
| 同行控件垂直居中 | 容器 `align-items: center` |
| 标签与控件基线对齐 | FormItem 已内置处理 |
| 按钮组右对齐 | 操作按钮统一靠右，主操作在最右 |
| 数字右对齐 | 表格中的数值列右对齐，便于位数比对 |

### 对话框底部按钮

主操作（确定）在右、次操作（取消）在左，符合从左到右的阅读终点习惯：

```
[ 取消 ]  [ 确定 ]
          ↑ 主操作最右
```

组件库的 Modal 默认底部区域已按此规则实现。

## 排版

### 字号阶梯

| 用途 | 字号 | 行高 |
| --- | --- | --- |
| 页面标题 | 20px | 1.4 |
| 区块标题 | 16px | 1.5 |
| 正文 | 14px | 1.6 |
| 辅助说明 | 13px | 1.5 |
| 标签 / 徽标 | 12px | 1.4 |

### 文本层级

| 层级 | 变量 | 用途 |
| --- | --- | --- |
| 主文本 | `--aura-text` | 正文、标题 |
| 次要文本 | `--aura-text-secondary` | 描述、提示、占位 |
| 禁用文本 | 主文本降低不透明度 | 禁用态控件 |

```vue
<template>
  <p class="title">区块标题</p>
  <p class="desc">这里是补充说明文字</p>
</template>

<style scoped>
.title {
  color: var(--aura-text);
  font-size: 16px;
}
.desc {
  color: var(--aura-text-secondary);
  font-size: 13px;
}
</style>
```

**不要在业务代码中硬编码颜色**，一律引用 `--aura-*` 变量，否则暗色模式下会出现"深色文字配深色背景"的失配问题。

## 响应式断点

| 断点 | 宽度 | 布局建议 |
| --- | --- | --- |
| sm | < 768px | 单列布局，控件撑满宽度 |
| md | 768 ~ 1024px | 两列布局 |
| lg | > 1024px | 侧边栏 + 主内容区 |

```css
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
```

## 相关文档

- [主题定制](/guide/theme) — 令牌与换肤
- [样式与令牌](/styles/) — 完整 CSS 变量与类名索引
