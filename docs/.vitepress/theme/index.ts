import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Demo from './components/Demo.vue';
import HomeShowcase from './components/HomeShowcase.vue';
import DandelionBackground from './components/DandelionBackground.vue';
import './styles/custom.css';
import '@aura/components/src/style/base.less';
import '@aura/components/src/button/style/index.less';
import '@aura/components/src/input/style/index.less';
import '@aura/components/src/form/style/index.less';
import '@aura/components/src/switch/style/index.less';
import '@aura/components/src/select/style/index.less';
import '@aura/components/src/modal/style/index.less';

/**
 * 仅在首页挂载蒲公英背景，其余页面不渲染 canvas（省性能）。
 *
 * 注意：必须在 render 时同步求值，不能用 onMounted + ref ——
 * Layout() 是渲染函数，插槽在挂载前就被求值，异步翻转的 ref 会错过首次渲染，
 * 导致 canvas 永远不出现。SSR 阶段无 window，按首屏为首页处理即可（背景无副作用）。
 */
function isHome(): boolean {
  if (typeof window === 'undefined') return true;
  const p = window.location.pathname.replace(/\/index\.html$/, '/');
  return p === '/' || p === '/aura-vue' || p === '/aura-vue/';
}

export default {
  extends: DefaultTheme,
  // 通过 Layout 插槽把实况演示注入首页 hero 下方（比 markdown <template> 更稳）
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => (isHome() ? h(DandelionBackground) : null),
      'home-hero-after': () => h(HomeShowcase)
    });
  },
  enhanceApp({ app }) {
    app.component('Demo', Demo);
    app.component('HomeShowcase', HomeShowcase);
    app.component('DandelionBackground', DandelionBackground);
  }
} satisfies Theme;
