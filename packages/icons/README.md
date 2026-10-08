# @aura-vue/icons

**当前状态：占位包，不参与发布。**

图标资源尚未从各组件中迁出，本包只导出一个占位常量。
组件内用到的图标目前直接依赖 `@element-plus/icons-vue`。

## 为什么标记为 `private`

`private: true` 会让 changesets 跳过本包，避免 `npm publish` 时把它当成待发布项。
原因：它现在既没有构建产物，也没有 `files` 白名单，
一旦发布就是一个「入口指向 `.ts` 源码、使用方无法加载」的坏包
（与 `@aura-vue/shared` 曾被标记为 private 的理由相同）。

## 要把它变成真正的包，需要做

1. 把各组件中的 SVG 图标迁到本包，按 `src/<name>/index.ts` 组织，
   统一封装成 Vue 函数式组件（与 `@aura-vue/components` 的组件命名风格一致）。
2. 补构建：`vite build` + `vite-plugin-dts`（与 `@aura-vue/components` 同一套配置），
   产出 `dist/`，并把 `main` / `types` / `exports` 指向 `dist`。
3. 补 `files: ["dist"]` 与 `sideEffects: false`。
4. 去掉 `private`，并在 `.changeset/` 添加一条变更记录。
5. 在 `scripts/smoke.mjs` 中会自动纳入校验（它按 `scripts.build` 是否含 `vite build` 派生包清单）。
6. 同步更新 `README.md`、`docs/guide/index.md`、`docs/guide/installation.md` 中的描述。

## 相关

- 组件库：`@aura-vue/components`
- 业务组件：`@aura-vue/business`
- 参考实现：兄弟项目 `aura`（React 版）的 `packages/icons`
