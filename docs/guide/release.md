# 版本与发布

Aura Vue 用 [changesets](https://github.com/changesets/changesets) 管理版本：
**变动以 changeset 提交，版本号由 changesets 推导，发布由 CI 自动完成**。
本页说明正式版与 beta 版的区分方式，以及日常发版操作。

## dist-tag 约定

| npm tag  | 用途                             | 安装方式                          |
| -------- | -------------------------------- | --------------------------------- |
| `latest` | 正式版（默认）                   | `npm i @aura-vue/components`      |
| `beta`   | 预发布版（不稳定，API 可能变动） | `npm i @aura-vue/components@beta` |

`latest` 始终指向最新的**正式版**——beta 不会影响普通用户的安装结果。

## 正式版发布（自动）

1. 有变动的 PR 里带一条 changeset（`pnpm changeset`，按变更性质选 patch / minor / major）
2. 合并到 main 后，CI 自动消费所有 changeset：
   版本号升级、CHANGELOG 生成、提交回 main、发布到 npm（`latest`）、打 git tag

维护者无需手动跑 publish。

## Beta 版发布（pre 模式）

beta 周期用 changesets 的 **pre 模式**驱动，npm dist-tag 由 changesets 自动
切换为 `beta`，无需额外参数：

```bash
# ① 进入 beta 周期（提交 .changeset/pre.json）
pnpm changeset pre enter beta

# ② 照常添加 changeset、合并代码
pnpm changeset            # 例：minor —— beta 里体现为 0.3.0-beta.0

# ③ 每次合并到 main，CI 自动发布 0.3.0-beta.1、0.3.0-beta.2 …（tag=beta）

# ④ beta 验证完毕，退出 pre 模式并合并
pnpm changeset pre exit
# ⑤ 下一次 version 消费剩余 changeset，发布 0.3.0 正式版（tag=latest）
```

版本规则：

| 阶段         | 版本形态                            | npm tag  |
| ------------ | ----------------------------------- | -------- |
| 稳定周期     | `0.2.0` → `0.3.0`                   | `latest` |
| beta 周期内  | `0.3.0-beta.0` → `0.3.0-beta.1` → … | `beta`   |
| 退出 beta 后 | `0.3.0`                             | `latest` |

::: warning 注意
beta 期间 **不要把 `latest` 手动指向 beta**；正式版发布后 `latest` 会自动
切回。安装 beta 的用户需显式使用 `@beta` 后缀，npm 不会自动升级到 beta。
:::

## 手动操作速查

```bash
pnpm changeset           # 添加一条变更记录
pnpm changeset status    # 查看待发布的变更
pnpm changeset version   # 本地预览版本推导（一般由 CI 执行）
pnpm changeset publish   # 手动发布（正常由 CI 执行）
```

## CI 发布流程

Release 工作流（main 推送触发）：

1. **Verify**：全量门禁（lint / typecheck / 覆盖率 / 构建 / size / attw / api-surface / smoke），失败自动重试一次
2. **Version**：有 changeset 则消费并提交回 main（`[skip ci]`）；无则跳过
3. **Publish**：发布到官方 registry（带 [provenance](https://docs.npmjs.com/generating-provenance-statements) 供应链声明），按版本形态自动选择 dist-tag
4. **Tags**：推送发布 tag 到 GitHub

## 相关文档

- [更新日志](/changelog) — 每个版本的变更明细
- [安装](/guide/installation) — 安装与按需引入
