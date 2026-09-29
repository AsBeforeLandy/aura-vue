import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src'],
      // 与 @aura/components 保持一致：保留 `.vue.d.ts` 文件名，
      // 使其与 Rollup 产出的 `Button.vue.js` 一一对应，
      // 否则 node16 / nodenext 解析下类型会失败（详见 components 的同名注释）。
      cleanVueFileName: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      cssFileName: 'style',
    },
    cssCodeSplit: false,
    rollupOptions: {
      // 只外部化「与宿主应用共享同一实例」的包：vue 与 element-plus（均为 peerDependency）。
      //
      // 注意这里**没有**把 @aura/shared 列为 external：
      //   1. @aura/shared 当前以 TS 源码作为入口（main -> src/index.ts），
      //      外部化后产物会留下裸 `import ... from '@aura/shared'`，
      //      使用方安装后无法加载 .ts，属于「发布即坏」；
      //   2. 它只有 prefixCls / classNames 两个纯函数，内联成本可忽略，
      //      内联后产物自包含，少一个运行时依赖。
      //   这与 @aura/components 的行为保持一致（它同样内联了 shared）。
      external: [
        'vue',
        'element-plus',
        /^element-plus\//,
        '@element-plus/icons-vue',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
