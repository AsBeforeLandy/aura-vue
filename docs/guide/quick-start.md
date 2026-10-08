# 快速开始

本节介绍如何在 5 分钟内把 Aura Vue 接入到你的 Vue 3 项目。

## 环境要求

| 依赖     | 版本                                 |
| -------- | ------------------------------------ |
| Node.js  | ^18.0.0                              |
| Vue      | ^3.4.0                               |
| 包管理器 | pnpm ^7（推荐）/ npm ^9 / yarn ^1.22 |

## 安装

:::code-group

```bash [pnpm]
# 安装组件库
pnpm add @aura-vue/components
```

```bash [yarn]
# 安装组件库
yarn add @aura-vue/components
```

```bash [npm]
# 安装组件库
npm install @aura-vue/components
```

:::

> `vue` 作为 peerDependency 声明，请确保宿主项目已安装 Vue 3.4+。

## 引入样式

组件库的样式以 Less 源码形式提供，需要在应用入口引入基础变量：

```ts
// main.ts
import '@aura-vue/components/src/style/base.less';
```

如果你只想引入用到的组件样式，可以按需引入：

```ts
import '@aura-vue/components/src/style/base.less';
import '@aura-vue/components/src/button/style/index.less';
import '@aura-vue/components/src/input/style/index.less';
```

> 每个组件的 `style/index.less` 内部已 `@import` 依赖的基础变量，重复引入不会产生副作用。

## 基本使用

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Switch } from '@aura-vue/components';

const keyword = ref('');
const onlyMine = ref(false);
</script>

<template>
  <div class="toolbar">
    <Input v-model="keyword" placeholder="搜索关键字" clearable />
    <Switch v-model="onlyMine" />
    <Button type="primary" @click="onSearch">查询</Button>
  </div>
</template>
```

## 按需引入

从根入口具名导入即可，构建工具会做 tree-shaking，未使用的组件不会进入业务包：

```vue
<script setup lang="ts">
import { Button } from '@aura-vue/components';
</script>
```

样式则按组件按需引入：

```ts
import '@aura-vue/components/src/button/style/index.less';
```

:::warning
组件库**没有**按组件的子路径导出，它只在包内 `exports` 暴露根入口、`./style.css` 与样式源码路径。

❌ `import { Button } from '@aura-vue/components/button'` —— 打包时会报 Module not found。
:::

## 受控 / 非受控

组件库所有表单控件都支持两种模式：

```vue
<!-- 受控模式：值由外部驱动 -->
<Input v-model="form.name" />

<!-- 非受控模式：组件内部自持状态，同时向上 emit 通知 -->
<Input :default-value="'初始值'" @change="onChange" />
```

判断依据很简单：**传了 `modelValue` 就是受控，传 `defaultValue` 就是非受控**。详见[组件设计规范](/guide/design#受控与非受控)。

## 主题

Aura Vue 使用 CSS Variables 承载设计令牌，切换暗色模式只需修改根节点属性：

```ts
// 切换到暗色
document.documentElement.setAttribute('data-theme', 'dark');
```

详细的令牌列表与覆盖方式请参考[主题定制](/guide/theme)。

## 下一步

- 浏览[组件列表](/components/button)了解所有可用组件
- 阅读[主题定制](/guide/theme)了解如何自定义样式
- 查看[常见问题](/guide/faq)排查接入过程中的疑难
