import { defineConfig } from 'vitepress';
import { demoPlugin } from './demo-plugin.ts';

export default defineConfig({
  title: 'Aura Vue',
  description: 'Vue3 基础组件 + 表单组件库',
  cleanUrls: true,
  vite: {
    plugins: [demoPlugin()]
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/' },
      { text: '组件', link: '/components/button' }
    ],
    sidebar: [
      {
        text: '通用组件',
        items: [
          { text: 'Button 按钮', link: '/components/button' },
          { text: 'Input 输入框', link: '/components/input' },
          { text: 'Modal 对话框', link: '/components/modal' }
        ]
      },
      {
        text: '表单组件',
        items: [
          { text: 'Form 表单', link: '/components/form' },
          { text: 'Select 选择器', link: '/components/select' },
          { text: 'Switch 开关', link: '/components/switch' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/AsBeforeLandy' }]
  }
});
