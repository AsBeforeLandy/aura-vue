# 样式与令牌

Aura Vue 的样式能力建立在一套稳定的契约之上：**可预测的类名 + 可覆盖的 CSS 变量**。使用方无需修改组件源码，即可完成换肤与局部样式调整。

## 样式加载方式

组件库的样式与逻辑分离，每个组件的样式存放在 `style/index.less`：

```
packages/components/src/
├── style/base.less              # 全局设计令牌（必须先引入）
└── button/style/index.less      # 组件样式
```

在应用入口引入：

```ts
// 全局样式（含 CSS 变量）
import '@aura/components/src/style/base.less';

// 按需引入组件样式
import '@aura/components/src/button/style/index.less';
import '@aura/components/src/input/style/index.less';
```

## 类名体系

### prefixCls

所有类名由 `@aura/shared` 的 `prefixCls` 生成，统一带 `aura-` 前缀：

```ts
prefixCls('button');           // 'aura-button'
prefixCls('button--primary');  // 'aura-button--primary'
```

### BEM 结构

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| Block | `aura-{block}` | `aura-button`、`aura-select` |
| Modifier | `aura-{block}--{modifier}` | `aura-button--primary`、`aura-switch--on` |
| Element | `aura-{block}-{element}` | `aura-select-trigger`、`aura-modal-title` |

### 完整类名索引

**Button 按钮**

| 类名 | 说明 |
| --- | --- |
| `.aura-button` | 按钮根节点 |
| `.aura-button--primary` | 主按钮 |
| `.aura-button--default` | 默认按钮（无修饰符类） |
| `.aura-button--dashed` | 虚线按钮 |
| `.aura-button--text` | 文本按钮 |
| `.aura-button--large` | 大尺寸（middle 无修饰符类） |
| `.aura-button--small` | 小尺寸 |
| `.aura-button--block` | 撑满整行 |
| `.aura-button--disabled` | 禁用或加载中 |
| `.aura-button-loading-dot` | 加载态圆点 |

**Input 输入框**

| 类名 | 说明 |
| --- | --- |
| `.aura-input` | 输入框容器 |
| `.aura-input--disabled` | 禁用态 |
| `.aura-input-inner` | 原生 `input` 元素 |
| `.aura-input-clear` | 清空按钮 |

**Switch 开关**

| 类名 | 说明 |
| --- | --- |
| `.aura-switch` | 开关根节点 |
| `.aura-switch--on` | 开启态 |
| `.aura-switch--disabled` | 禁用态 |
| `.aura-switch-dot` | 滑块圆点 |

**Select 选择器**

| 类名 | 说明 |
| --- | --- |
| `.aura-select` | 选择器容器 |
| `.aura-select--disabled` | 禁用态 |
| `.aura-select-trigger` | 触发按钮 |
| `.aura-select-trigger--open` | 面板展开中 |
| `.aura-select-label` | 已选值文本 |
| `.aura-select-placeholder` | 占位文本 |
| `.aura-select-arrow` | 下拉箭头（`--open` 时旋转） |
| `.aura-select-dropdown` | 面板（Teleport 到 body） |
| `.aura-select-option` | 选项（`--active` / `--selected` / `--disabled`） |

**Form 表单**

| 类名 | 说明 |
| --- | --- |
| `.aura-form` | 表单根节点 |
| `.aura-form-item` | 表单项 |
| `.aura-form-item-label` | 标签 |
| `.aura-form-item-control` | 控件区 |
| `.aura-form-item-error` | 错误提示 |

**Modal 对话框**

| 类名 | 说明 |
| --- | --- |
| `.aura-modal` | 对话框容器 |
| `.aura-modal-mask` | 遮罩层 |
| `.aura-modal-wrap` | 定位包裹层 |
| `.aura-modal-panel` | 面板主体 |
| `.aura-modal-header` | 头部 |
| `.aura-modal-title` | 标题 |
| `.aura-modal-close` | 关闭按钮 |
| `.aura-modal-body` | 内容区 |
| `.aura-modal-footer` | 底部按钮区 |

## Design Token

所有设计变量以 `--aura-` 前缀定义在 `style/base.less` 的 `:root` 中。

### 全局令牌

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--aura-color-primary` | 品牌主色 | `#7c3aed` |
| `--aura-color-success` | 成功态色 | `#22c55e` |
| `--aura-color-warning` | 警告态色 | `#f59e0b` |
| `--aura-color-danger` | 危险态色 | `#ef4444` |
| `--aura-border-color` | 边框色 | `#d9d9d9` |
| `--aura-bg` | 容器背景色 | `#ffffff` |
| `--aura-text` | 主文本色 | `rgba(0, 0, 0, 0.88)` |
| `--aura-text-secondary` | 次要文本色 | `rgba(0, 0, 0, 0.55)` |
| `--aura-radius` | 圆角基准值 | `6px` |

### 组件级令牌

| 变量 | 组件 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `--aura-select-popup-bg` | Select | 下拉面板背景色 | `--aura-bg` |
| `--aura-select-color-scheme` | Select | 面板色彩方案（`light` / `dark`） | `light` |
| `--aura-color-primary-shadow` | Select | 选项高亮底色 | 主色低透明度 |

> 组件级令牌的默认值通常引用全局令牌，因此改全局令牌即可连带生效；需要单独调整时才覆盖组件级变量。

## 覆盖样式的三种方式

### 1. 覆盖 CSS 变量（推荐）

只改变量值，不动类名结构，对组件升级最友好：

```css
:root {
  --aura-color-primary: #2563eb;
  --aura-radius: 4px;
}
```

### 2. `:deep()` 穿透 scoped

在 `<style scoped>` 中需要覆盖组件内部样式时使用：

```vue
<style scoped>
:deep(.aura-button) {
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
```

### 3. 追加自定义类名

组件支持 `class` 透传，可在业务侧追加语义类：

```vue
<template>
  <Button type="primary" class="submit-btn">提交</Button>
</template>

<style scoped>
.submit-btn {
  min-width: 96px;
}
</style>
```

> **不要用 `:global{}` 去匹配不存在的类名**。`:global{}` 只保证选择器不被哈希化，并不会凭空匹配到组件根节点上没有的类。详见[常见问题](/guide/faq#为什么-global-覆盖不了组件样式)。

## 样式覆盖优先级

覆盖时的选择顺序建议：

```
覆盖 CSS 变量  >  :deep() 穿透  >  追加类名改版式
      ↑ 最稳                              ↑ 影响面最大
```

| 场景 | 推荐方式 |
| --- | --- |
| 换品牌色、调圆角 | 覆盖 CSS 变量 |
| 调整组件的字重、间距 | `:deep()` 穿透 |
| 单个业务页面特殊排版 | 追加自定义类名 |
| 整站换肤 | 修改 `base.less` 中的 `:root` |

## 为什么不用 CSS Modules？

| 维度 | CSS Modules | prefixCls + BEM（当前方案） |
| --- | --- | --- |
| 类名稳定性 | 哈希化，构建即变 | 稳定可预测 |
| 使用方覆盖 | 只能靠 `:global` 硬掰 | 直接写类名即可 |
| 主题能力 | 无原生支持 | CSS 变量天然支持 |
| 调试体验 | 类名无意义 | 一眼看出组件与状态 |
| 适用场景 | 业务页面级样式隔离 | **组件库** |

CSS Modules 的设计目标是**样式隔离**，而组件库恰恰需要**样式开放**——使用方必须能稳定地命中并覆盖类名。两者的目标相反，因此组件库采用 prefixCls + BEM，把隔离性交给 CSS 变量的作用域来承担。

## 暗色模式

约定使用 `[data-theme="dark"]` 选择器激活：

```css
[data-theme="dark"] {
  --aura-bg: #1f2937;
  --aura-text: rgba(255, 255, 255, 0.88);
  --aura-text-secondary: rgba(255, 255, 255, 0.55);
  --aura-border-color: #374151;
  --aura-color-primary: #a78bfa;
}
```

```ts
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.style.colorScheme = 'dark'; // 同步原生控件
```

## 相关文档

- [主题定制](/guide/theme) — 令牌覆盖与换肤实践
- [布局与排版](/guide/layout) — 间距、尺寸与对齐约定
- [组件设计规范](/guide/design) — 新增组件时的样式约定
