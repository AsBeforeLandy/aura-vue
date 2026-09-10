import { defineConfig } from 'vitepress';
import { demoPlugin } from './demo-plugin.ts';

export default defineConfig({
  title: 'Aura Vue',
  description: 'Vue3 基础组件 + 表单组件库',
  // GitHub Pages 项目页部署在 <user>.github.io/<repo>/ 子路径下
  base: '/aura-vue/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: true,
  head: [
    ['link', { rel: 'icon', href: '/aura-vue/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/aura-vue/logo.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/aura-vue/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/aura-vue/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }]
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' }
  },
  vite: {
    plugins: [demoPlugin()]
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Aura Vue',

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '^/guide/' },
      { text: '组件', link: '/components/button', activeMatch: '^/components/' },
      { text: '样式', link: '/styles/', activeMatch: '^/styles/' },
      { text: '更新日志', link: '/changelog', activeMatch: '^/changelog' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '定制与规范',
          items: [
            { text: '主题定制', link: '/guide/theme' },
            { text: '布局与排版', link: '/guide/layout' },
            { text: '组件设计规范', link: '/guide/design' }
          ]
        },
        {
          text: '其他',
          items: [
            { text: '常见问题', link: '/guide/faq' },
            { text: '更新日志', link: '/changelog' }
          ]
        }
      ],
      '/components/': [
        {
          text: '通用',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Input 输入框', link: '/components/input' }
          ]
        },
        {
          text: '表单',
          items: [
            { text: 'Form 表单', link: '/components/form' },
            { text: 'Select 选择器', link: '/components/select' },
            { text: 'Switch 开关', link: '/components/switch' }
          ]
        },
        {
          text: '反馈',
          items: [{ text: 'Modal 对话框', link: '/components/modal' }]
        },
        {
          text: '业务组件',
          items: [
            { text: 'ProTable 高级表格', link: '/components/pro-table' },
            { text: 'ProForm 高级表单', link: '/components/pro-form' },
            { text: 'ProModalForm 弹窗表单', link: '/components/pro-modal-form' },
            { text: 'Description 描述列表', link: '/components/description' },
            { text: 'PageContainer 页面容器', link: '/components/page-container' }
          ]
        }
      ],
      '/styles/': [
        {
          text: '样式',
          items: [{ text: '样式与令牌', link: '/styles/' }]
        }
      ]
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },

    socialLinks: [{ icon: 'github', link: 'https://github.com/AsBeforeLandy/aura-vue' }],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2026-present Aura Team'
    },

    search: { provider: 'local' },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到暗色模式'
  }
});
