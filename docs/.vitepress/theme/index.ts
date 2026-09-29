import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
// Element Plus 的 SSR 注入 key 走**深路径**而不是 `from 'element-plus'`。
//
// 原因：`element-plus` 的根入口 re-export 了全部组件与 makeInstaller 安装器，
// 从根入口引入这两个 Symbol 会把整条 EP 模块图拉进「被主题入口静态引用」的集合，
// 于是 VitePress 把它们全部并进 theme chunk（实测 1154 KB / gzip 370 KB），
// 每个页面（包括完全用不到 EP 的指南页）都要下载。
//
// 深路径是 EP 官方 exports 映射允许的写法（`"./es/*.mjs"` 条目），
// 只带出 use-id / use-z-index 两个 hook 及其轻量依赖。
// 这样 EP 组件只被 demo 所在的懒加载页面引用，不再进入首屏。
import { ID_INJECTION_KEY } from 'element-plus/es/hooks/use-id/index.mjs';
import { ZINDEX_INJECTION_KEY } from 'element-plus/es/hooks/use-z-index/index.mjs';
import Demo from './components/Demo.vue';
import HomeShowcase from './components/HomeShowcase.vue';
import DandelionBackground from './components/DandelionBackground.vue';

/**
 * ── 样式引入顺序很关键，分两段，不要随意调整 ──
 *
 * 第 1 段：Element Plus 按需样式。
 *   只引实际用到的组件，而不是 `element-plus/dist/index.css` 全量（353 KB）。
 *   每个 `es/components/<name>/style/css` 会自行带上 base 与依赖组件的样式，
 *   所以从这个入口引不会漏样式。
 *
 *   为什么不用 unplugin-element-plus 自动注入：
 *   自动注入发生在 `import { ElXxx } from 'element-plus'` 的位置，
 *   也就落在各个懒加载 chunk 里，最终 CSS 的拼接顺序不可控；
 *   而 @aura/business 的样式**确实覆盖了 EP 内部类**
 *   （如 `.el-table th.el-table__cell`、`.el-dialog__body`），顺序错了就会被反覆盖。
 *   显式引入写在主题入口，顺序是确定的。
 *   为防止「新用了组件却忘了加样式」，scripts/smoke.mjs 有对应的自动校验。
 *
 * 第 2 段：自有样式。必须放在 EP 之后，才能覆盖 EP 内部类。
 */
import 'element-plus/es/components/base/style/css';
import 'element-plus/es/components/breadcrumb/style/css';
import 'element-plus/es/components/breadcrumb-item/style/css';
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/checkbox/style/css';
import 'element-plus/es/components/checkbox-group/style/css';
import 'element-plus/es/components/col/style/css';
import 'element-plus/es/components/date-picker/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/dropdown/style/css';
import 'element-plus/es/components/dropdown-item/style/css';
import 'element-plus/es/components/dropdown-menu/style/css';
import 'element-plus/es/components/empty/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/icon/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/input-number/style/css';
import 'element-plus/es/components/loading/style/css';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/popover/style/css';
import 'element-plus/es/components/radio/style/css';
import 'element-plus/es/components/radio-group/style/css';
import 'element-plus/es/components/row/style/css';
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/switch/style/css';
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/table-column/style/css';
import 'element-plus/es/components/tag/style/css';
import 'element-plus/es/components/tooltip/style/css';

import './styles/custom.css';
import '@aura/components/src/style/base.less';
import '@aura/components/src/button/style/index.less';
import '@aura/components/src/input/style/index.less';
import '@aura/components/src/form/style/index.less';
import '@aura/components/src/switch/style/index.less';
import '@aura/components/src/select/style/index.less';
import '@aura/components/src/modal/style/index.less';
import '@aura/business/src/style/index.less';

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
      'home-hero-after': () => h(HomeShowcase),
    });
  },
  enhanceApp({ app }) {
    app.component('Demo', Demo);
    app.component('HomeShowcase', HomeShowcase);
    app.component('DandelionBackground', DandelionBackground);

    // Element Plus 在 SSR 下需要显式的 id / z-index 提供者。
    // 否则 useId() 与 useZIndex() 会回退到不稳定的默认实现，
    // 服务端与客户端各自生成不同的 id，水合（hydration）时必然报 mismatch。
    // 官方文档：https://element-plus.org/en-US/guide/ssr.html
    app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 });
    app.provide(ZINDEX_INJECTION_KEY, { current: 0 });
  },
} satisfies Theme;
