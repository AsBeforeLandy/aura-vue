---
'@aura-vue/components': minor
---

新增第四批组件：Steps / Segmented / Skeleton，基础组件扩至 20 个

### 新组件

- **Steps 步骤条**：`items`（title / description）+ `current` + `status`
  （process / error）。ol / li 有序列表承载语义，当前项 `aria-current="step"`；
  完成项圆圈变对勾；`current` 越界钳位推断（-1 全部等待，length 全部完成）。
- **Segmented 分段控制器**：字符串 / 对象两种选项形态；双轨受控
  （`v-model` / `default-value`，复用 useControllable；非受控时默认选中第一项）；
  radiogroup + radio 语义，roving tabindex + 左右方向键循环切换；
  初始值在 setup 时取一次，动态改 options 需用受控模式（文档已标注）。
- **Skeleton 骨架屏**：`loading` 双态（true 骨架占位 / false 渲染插槽）；
  avatar / title / rows 组合，末行短一截模拟段落收尾；`aria-busy` +
  骨架块 aria-hidden；呼吸脉冲走新增的 `--aura-duration-slow` 令牌，
  reduced-motion 下自动静止（与 spin 的「放慢不归零」策略区分）。

### 设计令牌

- 新增 `--aura-duration-slow: 1.5s`（循环装饰动画用）；
  reduced-motion 下归零——base.less 注释同步更新了「循环动画分两类」的
  策略说明：加载指示器放慢不归零，装饰脉冲直接归零。

### 体积预算

- components 全量 esm：17 组件 21.95 kB → 20 组件 25.24 kB，预算 25 → 28 kB。
