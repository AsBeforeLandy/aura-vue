---
'@aura-vue/components': minor
---

新增第三批组件：Message / Popover / Progress，基础组件扩至 17 个

### 新组件

- **Message 全局消息**：命令式 API（`Message.success('已保存')` 等，不是组件、
  不进全量注册清单）。共享顶部容器随最后一条消息移除；默认 3s 自动关闭，
  `duration: 0` 不自动关（配合 `closable`），返回 `MessageHandle.close()` 可提前
  手动收掉；`role="alert"` 语义；SSR 环境静默降级不抛错。
- **Popover 弹出框**：点击触发的可交互浮层（title / content / footer 插槽），
  面板 `role="dialog"` + `aria-modal="false"` 非模态语义；触发元素带
  `aria-expanded` / `aria-controls`；点击外部与 Escape 关闭（open 期间挂监听、
  卸载时兜底清理）；定位复用 Tooltip 的组合式。已知限制：不做视口边缘翻转。
- **Progress 进度条**：`percent` 越界钳位到 0~100；三态配色；`role="progressbar"`
  - 完整 `aria-valuenow/min/max`，`label` 提供可访问名称；宽度过渡走令牌。

### 架构与修复

- **抽取 `use-overlay-position` 组合式**：浮层定位（触发元素视口矩形 +
  打开期间跟踪滚动/缩放 + 关闭即解绑）收敛到一处，Tooltip / Popover 共用。
- **修复 Tooltip 的真 bug**：触发元素从未绑定 `ref`，`update()` 拿不到矩形
  静默早退，浮层一直没有任何定位坐标（fixed 无坐标 = 停在视口左上角）。
  单测因不断言定位而全绿，已补定位断言兜底。
- **修复 Alert 的图标路径重复**：形状数据抽到内部模块 `_internal/semantic-icon`，
  Alert / Message 共用，避免两处各写一份后悄悄走样。
- **修复 smoke 的裸依赖扫描假阳性**：d.ts 的 JSDoc 使用示例（如
  `import { Message } from '@aura-vue/components'`）会被当成未声明的裸依赖误报；
  扫描前先剥块注释与行首行注释。

### 体积预算

- components 全量 esm：14 组件 17.59 kB → 17 组件 21.95 kB，预算 20 → 25 kB。
