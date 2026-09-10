# 主题定制

Aura Vue 将设计令牌（Design Token）统一收敛到 CSS Variables，所有变量以 `--aura-` 为前缀。你无需改动组件源码，只要覆盖变量即可完成换肤。

## 令牌定义

基础令牌定义在 `packages/components/src/style/base.less`：

```less
:root {
  --aura-color-primary: #7c3aed;
  --aura-color-success: #22c55e;
  --aura-color-warning: #f59e0b;
  --aura-color-danger: #ef4444;
  --aura-border-color: #d9d9d9;
  --aura-bg: #ffffff;
  --aura-text: rgba(0, 0, 0, 0.88);
  --aura-text-secondary: rgba(0, 0, 0, 0.55);
  --aura-radius: 6px;
}
```

## 令牌一览

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

部分组件还暴露了组件级变量，用于面板、浮层等局部配色：

| 变量 | 所属组件 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `--aura-select-popup-bg` | Select | 下拉面板背景色 | `--aura-bg` |
| `--aura-select-color-scheme` | Select | 面板色彩方案 | `light` |
| `--aura-color-primary-shadow` | Select | 选项高亮底色 | `--aura-color-primary` 低透明度 |

## 全局换肤

在应用入口样式文件中覆盖 `:root` 变量即可：

```css
:root {
  /* 主色改为蓝色 */
  --aura-color-primary: #2563eb;
  /* 圆角收紧 */
  --aura-radius: 4px;
  /* 边框色加深 */
  --aura-border-color: #cbd5e1;
}
```

## 暗色模式

Aura Vue 约定使用 `[data-theme="dark"]` 选择器激活暗色主题。在应用入口定义暗色令牌：

```css
[data-theme="dark"] {
  --aura-bg: #1f2937;
  --aura-text: rgba(255, 255, 255, 0.88);
  --aura-text-secondary: rgba(255, 255, 255, 0.55);
  --aura-border-color: #374151;
  --aura-color-primary: #a78bfa;
}
```

运行时切换主题：

```ts
type Theme = 'light' | 'dark';

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // 同步原生控件的色彩方案（滚动条、原生弹层等）
  document.documentElement.style.colorScheme = theme;
}
```

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const dark = ref(false);

watchEffect(() => setTheme(dark.value ? 'dark' : 'light'));
</script>

<template>
  <Switch v-model="dark" />
</template>
```

> 组件库不自带主题状态管理，`data-theme` 由宿主应用控制。这样可以避免与业务已有的主题方案（如 VueUse `useDark`、自研 store）冲突。

## 局部换肤

CSS 变量遵循层叠继承，在任意容器上重新声明变量即可实现局部换肤：

```vue
<template>
  <!-- 这个按钮组内部是紫色主题 -->
  <div class="purple-zone">
    <Button type="primary">紫色主按钮</Button>
  </div>

  <!-- 这个按钮组内部是绿色主题 -->
  <div class="green-zone">
    <Button type="primary">绿色主按钮</Button>
  </div>
</template>

<style scoped>
.purple-zone {
  --aura-color-primary: #7c3aed;
}
.green-zone {
  --aura-color-primary: #16a34a;
}
</style>
```

## 修改基础变量文件

如果你希望团队共用一套品牌令牌，可直接修改 `packages/components/src/style/base.less`——这是所有组件样式的唯一变量来源，改一处即全局生效。

## 相关文档

- [样式与令牌](/styles/) — 类名体系与样式覆盖方式
- [布局与排版](/guide/layout) — 间距、栅格与排版约定
- [常见问题](/guide/faq#主题定制) — 主题相关问题排查
