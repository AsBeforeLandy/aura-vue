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
      // 保持 `.vue.d.ts` 文件名，不要清理成 `Button.d.ts`。
      //
      // 原因：JS 产物由 Rollup 依据源文件名生成，叫 `Button.vue.js`；
      // 若声明文件被清理成 `Button.d.ts`，两者名字对不上——
      // moduleResolution 为 node16 / nodenext 的消费方
      // 由 `./Button.vue.js` 无法映射到 `Button.vue.d.ts`，类型直接解析失败。
      // 保持同名后 JS 与 d.ts 一一对应，`@arethetypeswrong/cli` 才判为通过。
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
      external: ['vue'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
