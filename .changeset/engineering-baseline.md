---
'@aura-vue/components': minor
'@aura-vue/business': minor
---

建立工程化门禁基线：lint / format / typecheck / 覆盖率阈值 / 产物冒烟测试

### 新增

- `@aura-vue/components` 补 `install` 插件与 `components` 清单，与 `@aura-vue/business` 的
  `AuraBusiness` 对齐（两个包现在都支持 `app.use()` 全量注册）。
- `scripts/smoke.mjs` 产物冒烟测试：校验 exports 目标存在、产物无 alias 泄漏、
  裸包名依赖已声明、文档引用的包内路径确实被 exports 暴露。
- 覆盖率阈值门禁（阈值取当前实测值 -3~4pt，用于防回退）。
- 包体积预算（size-limit）。

### 修复

- **发布阻断**：`exports` 原先声明 `"./src/*"` 但 `files` 只含 `dist`，
  发布后任何源码子路径导入都会 404。现收窄为只导出样式路径
  （`./src/style/*`、`./src/*/style/*`），并把对应目录加入 `files`。
- **发布阻断**：`@aura-vue/business` 产物残留裸引用 `@aura-vue/shared`，
  而后者以 TS 源码为入口，使用方安装后无法加载。现改为内联，
  与 `@aura-vue/components` 行为一致。
- 移除 `@aura-vue/business` 未使用的 `@aura-vue/components` 依赖（幽灵依赖）。
- 文档中 `@aura-vue/components/dist/style.css` 改为 `@aura-vue/components/style.css`
  （前者不在 exports 映射内，照抄必然 Module not found）。
- 上游 `v-html` 加安全说明注释；`render-control` / `Select` 中的三元表达式
  语句改为 if/else。

### 工程化

- 新增 ESLint 9 flat config、Prettier、EditorConfig、Husky（pre-commit + commit-msg）、
  commitlint、`.nvmrc`、根 LICENSE。
- CI 门禁扩展为 Lint / Format check / Typecheck / Coverage / Build / Size / Smoke / Docs。
