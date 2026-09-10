import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import Demo from './components/Demo.vue';
import HeroDemo from './components/HeroDemo.vue';
import './styles/custom.css';
import '@aura/components/src/style/base.less';
import '@aura/components/src/button/style/index.less';
import '@aura/components/src/input/style/index.less';
import '@aura/components/src/form/style/index.less';
import '@aura/components/src/switch/style/index.less';
import '@aura/components/src/select/style/index.less';
import '@aura/components/src/modal/style/index.less';

export default {
  extends: DefaultTheme,
  // 通过 Layout 插槽把实况演示注入首页 hero 下方（比 markdown <template> 更稳）
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-after': () => h(HeroDemo)
    });
  },
  enhanceApp({ app }) {
    app.component('Demo', Demo);
    app.component('HeroDemo', HeroDemo);
  }
};
