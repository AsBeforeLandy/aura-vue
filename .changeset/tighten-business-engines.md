---
'@aura-vue/business': patch
---

收紧 engines 到 `^22.13.0 || >=24`

业务包依赖的 `pdfjs-dist@6` 在模块顶层引用了 `Iterator` 全局
（Node 22+ 才有），Node 20 消费方在运行时会直接抛
`ReferenceError: Iterator is not defined`——安装期不报错，
炸在用户页面上，属于最恶劣的失败模式。

engines 是 advisory 字段（npm 只警告不强拦），但它能给出
明确的安装期提示，比静默炸运行时好。`@aura-vue/components`
无此依赖，engines 保持 `^20.19.0 || ^22.13.0 || >=24` 不变。
