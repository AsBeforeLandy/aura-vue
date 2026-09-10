# Aura Vue

Vue3 基础组件 + 表单组件库（monorepo 骨架）。

## 技术栈

- 包管理：pnpm workspace
- 构建：Vite library mode + vite-plugin-dts（ESM 优先，tree-shaking 友好）
- 样式：Less 独立文件 + CSS 变量 token，`aura-` 前缀隔离
- 测试：Vitest + @vue/test-utils（正常 / 边界 / 异常三类用例）
- 文档：VitePress（组件实时可交互 demo）
- 发版：Changesets + GitHub Actions

## 目录结构

```
aura-vue/
├── packages/
│   ├── components/   # 组件包（@aura/components）
│   ├── shared/       # 跨组件公共工具（@aura/shared）
│   └── icons/        # 图标包占位（@aura/icons）
├── docs/             # VitePress 文档站
└── .github/workflows/ # CI 与发版流水线
```

## 常用命令

```bash
pnpm install        # 安装依赖
pnpm build          # 构建组件包
pnpm test           # 运行测试
pnpm docs:dev       # 本地启动文档站
pnpm docs:build     # 构建文档站
pnpm changeset      # 声明一次变更（发版前）
```

## 新增组件步骤

1. 在 `packages/components/src/<name>/` 下创建 `types.ts`、`<Name>.vue`、`style/index.less`
2. 编写 `<name>/index.ts` 导出组件与类型，并在 `src/index.ts` 中 re-export
3. 在 `packages/components/__tests__/` 下补正常 / 边界 / 异常三类测试
4. 在 `docs/components/` 下新增文档页，并在 `docs/.vitepress/config.mts` 侧边栏注册
