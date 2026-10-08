---
'@aura-vue/components': minor
---

新增第六批组件：Collapse / Tree / Upload，基础组件扩至 26 个

### 新组件

- **Collapse 折叠面板**：Collapse + CollapseItem 组合（provide/inject 传递
  展开上下文）；`v-model` 绑定展开项 value 数组，accordion 手风琴模式；
  标题行原生 button（aria-expanded + aria-controls），面板 region 双向关联；
  展开动画用 `grid-template-rows: 0fr → 1fr`（纯 CSS 免测量），内容
  v-show 保持挂载不销毁。
- **Tree 树形控件**：内部 TreeItem 递归渲染；选中双轨受控
  （useControllable）；展开集合内部自持（defaultExpandedKeys / expandAll）；
  role=tree/treeitem/group + aria-level/expanded/selected；
  点击有子节点的节点顺带切换展开；方向键树导航留作后续（文档已标注）。
- **Upload 上传**：fileList 双轨受控（v-model:file-list，内联实现——
  属性名不同构于 useControllable）；三种上传方式：action（内置 XHR，
  upload.onprogress 进度）/ customRequest 逃生舱 / autoUpload=false 只进列表；
  beforeUpload 业务校验（同步或 Promise）；drag 拖拽区；文件四态
  ready / uploading / success / danger；文件输入裁剪隐藏 + aria-hidden，
  可访问触发点是「选择文件」按钮。

### 架构与测试基建

- XHR 上传与 formatSize 纯逻辑抽 `upload/utils.ts`（不依赖 Vue 响应式）。
- upload 测试伪造最小 FileList（happy-dom 无法构造）+ File 构造器，
  customRequest 同步回调消除计时不确定性。
- 回归记录：happy-dom 的 `checkVisibility` 是恒真桩——**isVisible() 对
  v-show 的 display:none 误报可见**，此类断言改查 inline style。
- Upload 测试回调参数显式标注 `Parameters<UploadRequest>[0]`
  （mount props 无类型推断，隐式 any 会被 typecheck 拦下）。

### 体积预算

- components 全量 esm：23 组件 29.05 kB → 26 组件 36.06 kB，预算 32 → 38 kB
  （约 1.4 kB/组件，按需导入不构成消费方负担）。
