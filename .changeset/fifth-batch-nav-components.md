---
'@aura/components': minor
---

新增第五批组件：Tabs / Drawer / Breadcrumb，基础组件扩至 23 个

### 新组件

- **Tabs 标签页**：完整 WAI-ARIA tabs 模式（tablist / tab / tabpanel，
  aria-selected + aria-controls / aria-labelledby 双向关联）；双轨受控
  （复用 useControllable，非受控默认选中**第一个可用项**）；roving tabindex +
  左右方向键在可用项之间循环（跳过禁用项）。面板从具名插槽 `panel-<value>`
  取内容、只渲染激活项（懒渲染），无对应插槽的标签退化为纯导航 tab。
- **Drawer 抽屉**：`role="dialog"` + `aria-modal`，与 Modal 共享同一套焦点
  管理（useDialogBehavior）；right / bottom 两个贴边方向（滑动进场），
  `size` 在 right 时为宽度、bottom 时为高度；footer 插槽放动作区。
- **Breadcrumb 面包屑**：nav + ol 语义；末项自动视为当前页（非链接 +
  `aria-current="page"`）；中间节点提供 `to` 才渲染为链接；分隔符画在
  伪元素上。

### 架构

- **抽取 `useDialogBehavior` 组合式**（焦点陷阱、焦点接管与归还、Esc 关闭），
  Modal 重构为复用，Drawer 直接受益——两套弹层不再各维护 ~100 行焦点逻辑。
  Modal 24 个既有用例全部通过（回归网）。
- 组合式顺带修复一个边缘语义：**挂载即打开**的弹层此前不会接管焦点
  （watch 无 immediate，Modal 的用例都是先挂载后置 true，掩盖了这条路径）；
  并修正「焦点归还到 body」的无效归还（初始态焦点不算用户焦点）。
- Segmented / Tabs 同源坑再次出现：模板绑定必须用带「默认选中第一项」
  回退的 fallbackValue 而非裸 value——本批在 Tabs 上第二次踩到，
  已在两个组件源码注释中标警示。

### 体积预算

- components 全量 esm：20 组件 25.24 kB → 23 组件 29.05 kB，预算 28 → 32 kB。
