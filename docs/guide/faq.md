# 常见问题

## 通用

### Vue 版本要求是什么？

Aura Vue 基于 Vue 3 构建，需要 ^3.4.0 及以上版本。组件库全量使用 Composition API 与 `<script setup>`，**不支持 Vue 2**。

### 是否支持 TypeScript？

完全支持。所有组件均以 TypeScript 编写，导出完整类型定义。Props 使用 `ExtractPropTypes` 推导，IDE 中可获得完整类型提示与默认值信息。

### 是否支持 SSR？

当前版本尚未对 SSR（如 Nuxt 3）进行专门适配。使用时需注意：

- Modal 组件使用 `Teleport to="body"`，SSR 环境下需确保仅在客户端挂载
- Select 的下拉面板同样 Teleport 到 body，并依赖 `getBoundingClientRect` 计算位置
- 组件库目前未做 `window` / `document` 的访问守卫，SSR 场景建议配合 `<ClientOnly>` 使用

### 组件库有多少个组件？

当前 6 个：Button、Input、Form、Select、Switch、Modal。更完整的组件矩阵在规划中。

## 安装与构建

### 如何在 Vite 项目中使用？

Vite 开箱即用，安装后引入样式即可：

```ts
import { Button } from '@aura/components';
import '@aura/components/src/style/base.less';
```

若报 Less 解析错误，请确认已安装 `less` 依赖：

```bash
pnpm add -D less
```

### 如何在 Webpack 项目中使用？

需要配置 Less 解析能力：

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] }
    ]
  }
};
```

### 是否支持按需加载？

支持。组件库使用 ES Module 构建并保留目录结构，现代打包工具（Vite、Webpack 5、Rspack）内置 tree-shaking 能力，会自动移除未使用的组件。

也可以显式按子路径引入：

```ts
import { Button } from '@aura/components/button';
import '@aura/components/src/button/style/index.less';
```

### 样式没有生效怎么办？

请依次检查：

1. 是否引入了基础变量文件 `@aura/components/src/style/base.less`
2. 构建工具是否已配置 Less 解析
3. 浏览器是否支持 CSS Variables（Chrome 80+ / Firefox 80+ / Safari 14+）
4. 是否有其他全局样式覆盖了 Aura 的 CSS Variables
5. 使用了 `<style scoped>` 时，覆盖组件样式需用 `:deep()`

### 为什么组件样式要单独引入 Less，而不是自动注入？

组件库遵循**样式与逻辑分离**原则。自动注入样式会让使用方失去对样式加载时机的控制，也无法在构建时做 CSS 提取与去重。显式引入虽然多写一行，但换来的是可预测的产物结构。

## 主题定制

### 如何切换暗色模式？

组件库不接管主题状态，由应用设置根节点属性：

```ts
document.documentElement.setAttribute('data-theme', 'dark');
```

然后在样式表中定义暗色令牌，详见[主题定制](/guide/theme#暗色模式)。

### 如何自定义主题色？

覆盖 CSS 变量即可：

```css
:root {
  --aura-color-primary: #2563eb; /* 主色改为蓝色 */
  --aura-radius: 4px;            /* 调整圆角 */
}
```

完整令牌列表见[主题定制](/guide/theme#令牌一览)。

### 为什么 `:global{}` 覆盖不了组件样式？

`:global{}` 只保证选择器**不被哈希化**，它并不会让选择器凭空匹配到不存在的类名。若组件根节点上没有你写的那个类，`:global{}` 也无能为力。

正确做法有两种：

1. **覆盖 CSS 变量**（推荐）——不改类名，只改变量值
2. **用 `:deep()` 穿透**——`<style scoped>` 中覆盖组件内部类名

```vue
<style scoped>
:deep(.aura-button) {
  font-weight: 600;
}
</style>
```

### 局部换肤怎么做？

CSS 变量遵循层叠继承，在容器上重新声明即可：

```vue
<div style="--aura-color-primary: #16a34a">
  <Button type="primary">绿色主按钮</Button>
</div>
```

## 组件行为

### 为什么受控模式下输入框"打不进字"？

这是受控模式的**预期行为**：外部不更新 `modelValue`，显示就不会变。

```vue
<!-- 错误：没有更新 model，输入被"吃掉" -->
<Input :model-value="value" />

<!-- 正确：用 v-model 让值回流 -->
<Input v-model="value" />
```

### 为什么输入中文时字会消失？

已修复。组件内部使用 `compositionstart` / `compositionend` 守卫 IME 组词过程，组词期间不写值也不复位 DOM，`compositionend` 后取最终文本。如果你的版本仍有此问题，请升级到最新版。

### Select 的下拉面板被容器裁剪了？

不会。面板通过 `Teleport` 渲染到 `body` 并使用 `fixed` 定位，不受任何父级 `overflow` 影响。面板位置在打开、滚动、窗口尺寸变化时都会重新计算；下方空间不足时会自动向上展开。

### Modal 会阻塞页面滚动吗？

**不会**。当前版本的 Modal 未锁定 `body` 滚动，遮罩层之外仍可滚动页面。如需锁定滚动，请在打开时自行处理：

```ts
watch(open, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});
```

### 表单校验怎么自定义错误提示？

在规则里写 `message`：

```ts
const rules = [
  { required: true, message: '请输入用户名' },
  { min: 3, max: 12, message: '用户名长度为 3-12 个字符' }
];
```

自定义校验器返回字符串即视为错误文案：

```ts
{
  validator: async (value) => {
    const ok = await checkNameTaken(value);
    return ok ? true : '该用户名已被占用';
  }
}
```

### 校验规则什么时候触发？

| trigger | 时机 |
| --- | --- |
| `'change'` | 控件输入时 |
| `'blur'` | 控件失焦时 |
| 不声明 | change / blur / submit 三者都触发 |

> 注意：必填类规则通常不希望一输入就报错，建议声明 `trigger: 'blur'`。

## 贡献与反馈

### 发现 Bug 或有功能建议？

请在 [GitHub Issues](https://github.com/AsBeforeLandy/aura-vue/issues) 提交反馈。

### 如何参与贡献？

欢迎贡献代码！请 Fork 仓库后提交 Pull Request，并遵循以下约定：

- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)：`feat:` / `fix:` / `docs:` / `chore:`
- 新增组件请对照[组件设计规范](/guide/design#新增组件检查清单)自检
- 变更需要附带 changeset：`pnpm changeset`
