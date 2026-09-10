# 安装

## 环境准备

确保你的开发环境满足以下要求：

- **Node.js** ^18.0.0（推荐使用 LTS 版本）
- **Vue** ^3.4.0
- **包管理器** pnpm ^7（推荐）、yarn ^1.22.0 或 npm ^9.0.0

> 本项目使用 pnpm workspace 管理 Monorepo，若需参与组件库开发，请使用 pnpm。

## 安装组件库

:::code-group

```bash [pnpm]
pnpm add @aura/components
```

```bash [yarn]
yarn add @aura/components
```

```bash [npm]
npm install @aura/components
```

:::

| 包名 | 描述 | 依赖 | 状态 |
| --- | --- | --- | --- |
| `@aura/components` | 组件库主体，含 6 个组件 | `@aura/shared` | 可用 |
| `@aura/shared` | 工具函数集（`prefixCls`、`classNames`） | - | 可用 |
| `@aura/icons` | 图标资源包 | - | 占位 |

## 本地开发（仓库贡献者）

克隆仓库后，在根目录执行：

```bash
# 安装依赖
pnpm install

# 构建组件库产物
pnpm build

# 启动文档站开发预览（默认 http://localhost:5173）
pnpm docs:dev
```

根目录可用脚本一览：

| 脚本 | 说明 |
| --- | --- |
| `pnpm build` | 构建 `@aura/components` 产物到 `dist/` |
| `pnpm test` | 运行组件库单元测试（vitest） |
| `pnpm docs:dev` | 启动 VitePress 文档站开发服务 |
| `pnpm docs:build` | 构建文档站静态产物 |
| `pnpm changeset` | 生成一条变更记录 |
| `pnpm release` | 构建并发布到 npm |

## 引入样式

组件库使用 Less 编写样式，样式与逻辑分离存放在各组件目录下的 `style/index.less`。在应用入口引入基础变量文件：

```ts
import '@aura/components/src/style/base.less';
```

| 引入路径 | 说明 |
| --- | --- |
| `@aura/components/src/style/base.less` | 设计令牌（CSS 变量）定义，**必须引入** |
| `@aura/components/src/{组件}/style/index.less` | 单个组件的样式，按需引入 |

## 构建产物体积

组件库产物采用 ES Module + `preserveModules` 模式，保留目录结构以支持 tree-shaking：

| 产物 | 路径 | 说明 |
| --- | --- | --- |
| JS 入口 | `dist/index.js` | ES Module |
| 类型声明 | `dist/index.d.ts` | TypeScript 类型 |
| 样式 | `dist/style.css` | 聚合样式（可选） |

```ts
// 使用构建产物（发布后）
import { Button } from '@aura/components';
import '@aura/components/dist/style.css';
```

## 浏览器兼容性

| 浏览器 | 版本 |
| --- | --- |
| Chrome | 80+ |
| Firefox | 80+ |
| Safari | 14+ |
| Edge | 80+ |

> 低于上述版本时需自行引入 CSS Variables 的 polyfill。

## 常见安装问题

### 样式没有生效

1. 确认已引入 `@aura/components/src/style/base.less`
2. 确认构建工具的 Less 解析能力已开启（Vite 需安装 `less` 依赖）
3. 检查是否有全局样式覆盖了 `--aura-*` 变量

### TypeScript 找不到类型定义

确认 `tsconfig.json` 中 `moduleResolution` 为 `bundler` 或 `node16` 及以上，旧版 `node` 策略无法解析包导出映射。

更多问题请参考[常见问题](/guide/faq)。
