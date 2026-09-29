---
'@aura/components': patch
'@aura/business': patch
---

修复发布包的类型解析问题，并让文档站按需加载 Element Plus

### 修复（影响发布包）

- **`.vue.d.ts` 与 `.vue.js` 文件名对不上**：原先 `cleanVueFileName: true` 会把
  声明文件重命名为 `Button.d.ts`，而 JS 产物是 `Button.vue.js`。
  `moduleResolution` 为 `node16` / `nodenext` 的消费方因此完全拿不到类型
  （静默退化为 `any`）。现改为保持 `Button.vue.d.ts`，与 JS 一一对应。
- **声明文件里混进不可移植的类型引用**：`lodash-unified` 的类型引用曾被写成
  `import('../node_modules/lodash-unified/type.d.ts')`，该路径在消费方机器上必然不存在。
  现在由 `scripts/postbuild-dts.mjs` 收敛回裸包名，并把 `lodash-unified` 移入
  `dependencies` 以保证可解析。
- 声明文件里的相对引用统一补全扩展名（`./button` → `./button/index.js`），
  使其在 `node16` 解析下可用。

:::tip 效果
`@arethetypeswrong/cli` 现在对两个包在 `node16 (from ESM)` 与 `bundler`
两种模式下都判定为 🟢（此前是解析错误）。
:::

### 文档站

- Element Plus 改为**按需引入样式**（不再引 `element-plus/dist/index.css` 全量）：
  聚合 CSS 从 489 KB 降到 331 KB（gzip 71 → 49 KB）。
- 修复主题入口为取两个注入 key 而引入 EP 根 barrel 的问题——它导致 Element Plus
  被打进首屏 chunk。改走 `element-plus/es/hooks/*` 深路径后，EP 组件只被
  用到它们的 demo 页懒加载：**首屏 JS 从约 415 KB 降到约 134 KB（gzip）**，
  指南页与首页完全不再加载 EP。构建的 chunk 体积告警随之自然消失
  （不是靠调高阈值掩盖）。
