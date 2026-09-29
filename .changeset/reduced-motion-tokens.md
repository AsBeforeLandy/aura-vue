---
'@aura/components': minor
---

适配系统的「减少动态效果」偏好（prefers-reduced-motion）

### 变化

- 新增动效令牌：`--aura-duration-fast` / `--aura-duration-base` / `--aura-easing` /
  `--aura-spin-duration`。全部过渡时长不再写死在组件样式里，而是从令牌取值。
  （此前 `--aura-easing` 被三处样式引用但从未定义，一直走的是 `ease` 兜底，现已补上。）
- `prefers-reduced-motion: reduce` 时：
  - **过渡归零**——进出场、hover、展开收起这类纯装饰性动效取消，变化立刻生效；
  - **loading 旋转放缓为 2.4s 而不是停止**——它承载「正在处理中」的状态信息，
    冻结会被理解成界面卡死。

### 升级注意

- 若你在自己的样式里覆盖过 `--aura-easing`，现在它会真正生效（此前被 `ease` 兜底盖住）。
- 组件样式里的过渡时长一律走令牌；如果你 fork 过组件样式并写了固定时长，
  建议同样改为引用令牌，以保持行为一致。
- 令牌只在 `@media (prefers-reduced-motion: reduce)` 下被覆盖，
  采用 `:root` 覆盖自定义属性的方式，**不会**用 `* { transition: none !important }`
  这类通配禁用——那会连消费方自己的过渡一起干掉。
