---
'@aura-vue/components': minor
---

新增第一批轻量组件：Divider / Space / Tag / Typography

### 新组件

- **Divider 分割线**：水平 / 垂直方向、虚线、文字三档位置（left / center / right）。
  带文字时线条由伪元素绘制；垂直方向不渲染文字。带 `role="separator"` 语义。
- **Space 间距**：横向 / 纵向排列，三档间距（small 8 / middle 12 / large 16，走间距令牌）
  或像素值；支持换行（行间距与列间距同档）与对齐覆盖。
- **Tag 标签**：五种语义色（primary / success / warning / danger / info，info 为中性灰），
  浅底深字组合；`closable` 显示原生关闭按钮（可键盘触发），
  显隐双轨受控（`v-model:visible` / `default-visible`）。
- **Typography 排版**：`level` 渲染 h1~h4（超出范围安全回落为段落），
  `type` 语义色，`strong` / `underline` / `delete` 行内强调（可组合）。

### 设计令牌与工具

- 新增间距令牌 `--aura-space-small/middle/large`（8 / 12 / 16px，与按钮设计规范的
  「相邻间距 12px」对齐）。
- 新增语义色的柔和表面与文字级变体令牌（`--aura-success-soft` 等 +
  `--aura-color-*-strong`）：12px 小字直接用主色对比度不足，加深一档保证可读；
  亮暗两套都在 `base.less` 集中维护。
- `@aura-vue/shared` 新增 `pickPresetClass(value, presets, prefix)`：联合类型的
  档位 prop（type / size / align）在运行时收到非法值时不再产生垃圾类名，
  安静回落到组件默认外观。

### 升级注意

- 若你依赖「非法枚举值会产生类名」的行为（不应有人依赖），现在会得到空类名。
- 语义色标签的文字色改为 `-strong` 变体；若你基于旧色值做过覆盖，需要同步。
