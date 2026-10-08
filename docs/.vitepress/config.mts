import { defineConfig } from 'vitepress';
import { demoPlugin } from './demo-plugin.ts';

export default defineConfig({
  title: 'Aura Vue',
  description: 'Vue3 基础组件 + 业务组件库',
  // GitHub Pages 项目页部署在 <user>.github.io/<repo>/ 子路径下
  base: '/aura-vue/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: true,
  head: [
    ['link', { rel: 'icon', href: '/aura-vue/favicon.ico', sizes: 'any' }],
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/aura-vue/logo.svg' },
    ],
    [
      'link',
      { rel: 'apple-touch-icon', href: '/aura-vue/apple-touch-icon.png' },
    ],
    ['link', { rel: 'manifest', href: '/aura-vue/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
  },
  vite: {
    plugins: [demoPlugin()],
    ssr: {
      // Element Plus 的按需样式入口是 `es/components/<name>/style/css.mjs`，
      // 它内部 `import 'element-plus/theme-chalk/*.css'`。
      // SSR 构建默认把 node_modules 外部化交给 Node 原生加载，
      // 而 Node 无法解析 .css，会报 `ERR_UNKNOWN_FILE_EXTENSION ".css"`。
      // 放进 noExternal 让 Vite 自己处理这些 CSS 导入（SSR 下会被安全地忽略）。
      noExternal: [/^element-plus/],
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Aura Vue',

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '^/guide/' },
      {
        text: '组件',
        link: '/components/button',
        activeMatch: '^/components/',
      },
      {
        text: '业务组件',
        link: '/business/',
        activeMatch: '^/business/',
      },
      { text: '样式', link: '/styles/', activeMatch: '^/styles/' },
      { text: '更新日志', link: '/changelog', activeMatch: '^/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '定制与规范',
          items: [
            { text: '主题定制', link: '/guide/theme' },
            { text: '布局与排版', link: '/guide/layout' },
            { text: '组件设计规范', link: '/guide/design' },
          ],
        },
        {
          text: '其他',
          items: [
            { text: '常见问题', link: '/guide/faq' },
            { text: '更新日志', link: '/changelog' },
          ],
        },
      ],
      '/components/': [
        {
          text: '通用',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Input 输入框', link: '/components/input' },
          ],
        },
        {
          text: '布局',
          items: [
            { text: 'Divider 分割线', link: '/components/divider' },
            { text: 'Space 间距', link: '/components/space' },
          ],
        },
        {
          text: '导航',
          items: [
            { text: 'Steps 步骤条', link: '/components/steps' },
            { text: 'Segmented 分段控制器', link: '/components/segmented' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'Tag 标签', link: '/components/tag' },
            { text: 'Typography 排版', link: '/components/typography' },
            { text: 'Empty 空状态', link: '/components/empty' },
            { text: 'Progress 进度条', link: '/components/progress' },
            { text: 'Skeleton 骨架屏', link: '/components/skeleton' },
          ],
        },
        {
          text: '表单',
          items: [
            { text: 'Form 表单', link: '/components/form' },
            { text: 'Select 选择器', link: '/components/select' },
            { text: 'Switch 开关', link: '/components/switch' },
          ],
        },
        {
          text: '反馈',
          items: [
            { text: 'Modal 对话框', link: '/components/modal' },
            { text: 'Alert 提醒', link: '/components/alert' },
            { text: 'Message 全局消息', link: '/components/message' },
            { text: 'Spin 加载中', link: '/components/spin' },
            { text: 'Tooltip 文字提示', link: '/components/tooltip' },
            { text: 'Popover 弹出框', link: '/components/popover' },
          ],
        },
      ],
      // 业务组件独立成 tab 后有自己的 URL 分区（/business/），
      // 与 React 版 @aura/business 的文档结构保持一致。
      '/business/': [
        {
          text: '业务组件',
          items: [
            { text: '概览', link: '/business/' },
            { text: 'ProTable 高级表格', link: '/business/pro-table' },
            { text: 'ProForm 高级表单', link: '/business/pro-form' },
            {
              text: 'ProModalForm 弹窗表单',
              link: '/business/pro-modal-form',
            },
            { text: 'Description 描述列表', link: '/business/description' },
            {
              text: 'PageContainer 页面容器',
              link: '/business/page-container',
            },
            { text: 'SearchForm 查询表单', link: '/business/search-form' },
            {
              text: 'CascaderPanel 级联多选面板',
              link: '/business/cascader-panel',
            },
            {
              text: 'WeekTimeRange 周时间段',
              link: '/business/week-time-range',
            },
            {
              text: 'YearCalendar 年历选择器',
              link: '/business/year-calendar',
            },
            { text: 'PdfViewer PDF 预览', link: '/business/pdf-viewer' },
          ],
        },
      ],
      '/styles/': [
        {
          text: '样式',
          items: [{ text: '样式与令牌', link: '/styles/' }],
        },
      ],
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AsBeforeLandy/aura-vue' },
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2026-present Aura Team',
    },

    search: { provider: 'local' },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到暗色模式',
  },
});
