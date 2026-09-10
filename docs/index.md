---
layout: home

hero:
  name: Aura Vue
  text: Vue3 基础组件 + 表单组件库
  tagline: 受控双轨 / Less 独立样式 / Design Token 驱动，为后台系统而生
  image:
    src: /logo.svg
    alt: Aura Vue
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 组件列表
      link: /components/button
    - theme: alt
      text: GitHub
      link: https://github.com/AsBeforeLandy/aura-vue

features:
  - icon: 🎛️
    title: 受控双轨
    details: v-model 与 default-value 并存，一套组件同时适配受控与非受控两种心智模型
    link: /guide/design#受控与非受控
    linkText: 了解实现
  - icon: 🎨
    title: Design Token 驱动
    details: 全部设计变量收敛到 --aura-* CSS 变量，换肤只需改变量值，不碰组件源码
    link: /guide/theme
    linkText: 主题定制
  - icon: 🧩
    title: Less 独立样式
    details: 样式与逻辑分离，每个组件独立 Less 文件，支持按需引入与局部变量覆盖
    link: /styles/
    linkText: 样式体系
  - icon: 🏷️
    title: prefixCls + BEM
    details: aura-button--primary 这类类名稳定可预测，使用方可直接命中并覆盖
    link: /styles/#类名体系
    linkText: 类名索引
  - icon: ✅
    title: 表单校验内建
    details: Form / FormItem 声明式规则校验，控件放入表单项即自动接入，无需手动绑定
    link: /components/form
    linkText: 表单文档
  - icon: 📦
    title: Tree-shaking 友好
    details: ES Module + preserveModules 产物，未使用的组件不进入业务包
    link: /guide/installation
    linkText: 安装说明
---

<!-- 实况演示区由主题层注入到 home-hero-after 插槽（见 .vitepress/theme/index.ts） -->
