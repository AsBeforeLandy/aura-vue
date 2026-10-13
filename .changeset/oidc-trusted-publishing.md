---
'@aura-vue/components': patch
'@aura-vue/business': patch
---

发布认证迁移至 OIDC（Trusted Publishing）

发布链路的 npm 认证从 bypass-2FA token 切换为 GitHub OIDC（Trusted
Publishing）：Release 工作流改用 Node 24（npm ≥ 11.5.1 是 OIDC 硬性前提），
不再配置 NPM_TOKEN / NODE_AUTH_TOKEN。包内容本身无变化——这是 npm
2027 年 1 月取消 bypass-2FA token 直接发布能力前的适配。
