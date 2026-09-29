---
'@aura/components': minor
'@aura/business': patch
---

Modal 补齐焦点管理，并修复三项发版配置

### @aura/components — Modal 无障碍（minor）

按 WAI-ARIA dialog 模式补齐了此前缺失的焦点管理：

- **打开时聚焦面板**：面板加了 `tabindex="-1"`，聚焦后读屏会先播报对话框与其名称，
  而不是一上来先读到一个按钮。
- **Tab 焦点陷阱**：`Tab` / `Shift+Tab` 在弹窗内循环，不会跑到弹窗背后的页面内容；
  若焦点已在弹窗外（例如用户点了浏览器地址栏再回来），下一次 `Tab` 会把它拉回弹窗。
  弹窗内没有任何可聚焦元素时，焦点按在面板上而不是漏出去。
- **关闭后归还焦点**：恢复到打开前的元素；组件在打开状态下被卸载时同样归还，
  避免焦点落到 `body`。
- 新增 `aria-label`（取 `title`），关闭控件由 `span[role="button"]`
  改为**原生 `<button>`**——原生元素自带可聚焦性、Enter/Space 激活与焦点环，
  无需再手工补 `tabindex` 与键盘处理。类名不变，样式选择器不受影响。

:::tip 升级注意
若你自定义了 `.aura-modal-close` 的样式，它现在作用在原生 `button` 上，
可能需要补 `border: 0; background: none` 之类的重置。
:::

### 发版配置（两个包）

- 补 `publishConfig.access = "public"`：两个包都是作用域包，
  npm 默认按 restricted 处理，**免费账号发布会直接 402 失败**。
- 补 `engines`，与 CI / `.nvmrc` 对齐。
- 补包级 `prepublishOnly`：此前只有根级，从包目录直接发布时不会构建，
  可能发出一个没有 `dist` 的包。

### 仓库工程化（不影响包产物）

- `Release` 工作流补 `permissions`（`contents` / `pull-requests` / `id-token`）：
  changesets/action 需要写权限才能提交 version commit、创建 Version Packages PR 并打 tag，
  缺失时会静默失败。同时开启 npm provenance。
- 发布前改为复用单步 `pnpm verify`，避免与 CI 各维护一份步骤清单而漂移。
- 新增 `scripts/api-surface.mjs` 公开 API 表面快照校验：
  从构建产物提取导出名 / props 类型与默认值 / emits，与仓库快照比对，
  把「改 prop 名、删导出」这类编译期无感的破坏性变更变成显式动作。
