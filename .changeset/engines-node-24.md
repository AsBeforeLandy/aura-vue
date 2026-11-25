---
'@aura-vue/components': patch
'@aura-vue/business': patch
---

engines 收紧到 `>=24`

Node 20 与 22 分别于 2026-04 到达维护终点（EOL），而 CI 的全量门禁
只在 Node 24 上验证——engines 声明的「支持 20 / 22」从未被实测覆盖。
按「只声明实测过的版本」原则统一收紧到 `>=24`（Node 24 为当前
Active LTS），同时 CI 工作流的 Node 版本与发布环境完成对齐。

pdfjs-dist@6 的 Node 22+ 要求随之被 `>=24` 自然覆盖。
