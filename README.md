# Aura Vue

Vue3 组件库 —— 基础组件 + 基于 Element Plus 二次封装的业务组件，含精装文档站。

- 线上文档：https://asbeforelandy.github.io/aura-vue/
- 仓库：git@github.com:AsBeforeLandy/aura-vue.git

## 技术栈

| 项       | 选择                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 框架     | Vue 3.4+ / `<script setup>` / Composition API                          |
| 包管理   | pnpm workspace 7.33.7（lockfileVersion 5.4）                           |
| 构建     | Vite 6 library mode + vite-plugin-dts（ESM + `preserveModules`）       |
| 样式     | Less 独立文件 + `--aura-*` CSS 变量，BEM + `aura-` 前缀                |
| 测试     | Vitest 3 + happy-dom + @vue/test-utils                                 |
| 文档     | VitePress 1.6                                                          |
| 质量门禁 | ESLint 9 + Prettier + vue-tsc + 覆盖率阈值 + size-limit + 产物冒烟测试 |
| 发版     | Changesets + GitHub Actions                                            |

## 目录结构

```
aura-vue/
├── packages/
│   ├── components/    # @aura-vue/components — 基础组件（Button / Input / Form / Select / Switch / Modal）
│   ├── business/      # @aura-vue/business   — 业务组件（ProTable / ProForm / ProModalForm / Description / PageContainer）
│   ├── shared/        # @aura-vue/shared     — 内部工具（prefixCls / classNames），不对外发布
│   └── icons/         # @aura-vue/icons      — 图标包占位，尚未迁移资源，未发布
├── docs/              # @aura-vue/docs — VitePress 文档站
├── scripts/smoke.mjs  # 产物冒烟测试（交付级校验）
└── .github/workflows/ # CI / Release / Docs 部署
```

包之间的依赖方向是单向的：`shared` → `components` → `business`。
`shared` 在构建期被内联进产物，因此使用方不需要单独安装它。

## 常用命令

```bash
# 开发
pnpm install         # 安装依赖
pnpm docs:dev        # 本地启动文档站
pnpm docs:build      # 构建文档站

# 构建与测试
pnpm build           # 构建两个库包的产物（dist/）
pnpm test            # 运行单元测试（Vitest + happy-dom）
pnpm test:coverage   # 运行测试并校验覆盖率阈值
pnpm test:e2e        # 真浏览器 E2E（会先构建库与文档站）
pnpm test:e2e:visual # 像素级视觉回归（基线按平台分，仅本地跑，见 e2e/visual.spec.ts）

# 质量门禁
pnpm lint            # ESLint
pnpm lint:fix        # ESLint 自动修复
pnpm format          # Prettier 写入
pnpm format:check    # Prettier 只检查（CI 用）
pnpm typecheck       # vue-tsc 类型检查
pnpm size            # 包体积预算
pnpm attw            # 发布包的类型解析校验（需 npm 在 PATH 上）
pnpm api-surface     # 公开 API 表面与快照比对（防破坏性变更）
pnpm smoke           # 产物冒烟测试（需先 build）

# 一键全链路（提交前建议跑一次）
pnpm verify          # lint + typecheck + test:coverage + build + size + attw + api-surface + smoke
pnpm verify:fast     # 同上，但跳过覆盖率阈值

# 发版
pnpm changeset       # 声明一次变更
pnpm version         # 消耗 changeset，提升版本号
pnpm release         # 构建并发布到 npm
```

## 质量门禁

提交与 CI 各自守一层，覆盖面刻意保持一致：

| 关卡         | 触发时机  | 执行内容                                                                                                 |
| ------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| `pre-commit` | 本地提交  | `lint-staged` → 对暂存文件 `eslint --fix` + `prettier --write`                                           |
| `commit-msg` | 本地提交  | `commitlint` 校验 Conventional Commits 格式                                                              |
| CI           | push / PR | lint → format:check → typecheck → test:coverage → build → size → attw → api-surface → smoke → docs:build |

三道最关键的**产物级**门禁（lint / test / build 都发现不了它们拦的问题）：

- **`pnpm smoke`** —— 文档站通过源码路径消费样式，产物从不被真正「装机」消费，
  因此「开发态正常、交付态断裂」类问题只能靠它拦住：
  exports 指向不存在的文件、通配符写法非法、产物残留未构建的依赖、
  声明文件里混进 `node_modules` 相对路径、作用域包漏了 `publishConfig.access`、
  文档教了不存在的导入路径。
- **`pnpm attw`** —— 校验发布包的**类型**在 `node16` 与 `bundler` 两种解析模式下都能解析。
  `.vue.d.ts` 与 `.vue.js` 文件名对不上、类型引用不可移植这类问题，只有它拦得住。
- **`pnpm api-surface`** —— 与快照比对导出名 / props / emits。
  改个 prop 名类型照样编译通过，但消费方会在运行时静默失效；
  这一步把 API 破坏性变更变成显式动作（更新快照 + 写 changeset）。

这三个脚本依赖构建期配合：`scripts/postbuild-dts.mjs` 在 `vite build` 之后
补全声明文件里的相对引用、并把混进来的 `node_modules` 相对路径收敛回裸包名。

两者依赖构建期脚本 `scripts/postbuild-dts.mjs`：在 `vite build` 之后补全声明文件里的相对引用、
并把混进来的 `node_modules` 相对路径收敛回裸包名。

## 新增组件步骤

### 基础组件（@aura-vue/components）

1. 在 `packages/components/src/<name>/` 下创建 `types.ts`、`<Name>.vue`、`style/index.less`
2. 编写 `<name>/index.ts` 导出组件与类型，并在 `src/index.ts` 中 re-export
   （同时把组件加进 `components` 清单，供 `app.use()` 全量注册）
3. 在 `packages/components/__tests__/` 下补正常 / 边界 / 异常三类测试
4. 在 `docs/components/` 下新增文档页 + demo，并在 `docs/.vitepress/config.mts` 侧边栏注册
5. 若组件用到新的 Element Plus 组件，在 `docs/.vitepress/theme/index.ts` 补对应的按需样式引入

### 业务组件（@aura-vue/business）

同上，目录在 `packages/business/src/<name>/`，并需在 `src/index.ts` 的 `businessComponents` 中登记。

## 发布

只发布 `@aura-vue/components` 与 `@aura-vue/business` 两个包；
`@aura-vue/shared` 与 `@aura-vue/icons` 标记为 `private`，changesets 会跳过。

在仓库 Secrets 配置 `NPM_TOKEN` 后，Release workflow 才会执行发布步骤；
未配置时仅做构建与测试校验。
