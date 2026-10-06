---
'@aura/components': minor
---

新增第二批组件：Alert / Spin / Empty / Tooltip，基础组件扩至 14 个

### 新组件

- **Alert 提醒**：四种语义色（与 Tag 同源的柔和表面 + 加深文字组合），
  `title` / `show-icon` / `closable`；显隐双轨受控（`v-model:visible`）。
  根节点带 `role="alert"`，图标内联 SVG（组件包不依赖 EP，也没有图标依赖），
  warning 用三角底形区分。
- **Spin 加载中**：三档尺寸；`role="status"` + `aria-live="polite"`，
  旋转对读屏隐藏、信息由 tip 文案承载；`spinning=false` 不渲染任何内容。
  keyframes 定义在组件自身样式内，不依赖 Button 的样式文件。
- **Empty 空状态**：内联 SVG 占位图（描边走令牌，暗色可用）、
  默认文案「暂无数据」、`default` 插槽放主动作按钮。
- **Tooltip 文字提示**：**自研实现**（组件包约束不得依赖 element-plus）。
  Teleport 到 body + `position: fixed` 定位；定位只用触发元素的视口矩形、
  浮层尺寸交给 transform（免测量），hover 与 focus 双触发、Escape 关闭、
  打开期间跟踪滚动（capture）与窗口缩放；`aria-describedby` 指向
  `role="tooltip"` 浮层。已知限制：不做视口边缘翻转（文档页已标注）。

### 设计令牌

- 新增反色表面令牌 `--aura-inverse-bg` / `--aura-inverse-text`（深底浅字浮层用，
  亮暗主题下都保持深色以与内容形成反差）。

### 体积预算

- components 全量 esm：10 组件 13.04 kB → 14 组件 17.59 kB，预算 15 → 20 kB
  （口径：单组件约 1.2 kB brotli，属组件库正常密度）。

### 升级注意

- `visible` 双轨组件（Alert / Tag）的非受控初始属性名为 `default-visible`。
