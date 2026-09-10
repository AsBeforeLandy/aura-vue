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
      cleanVueFileName: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      cssFileName: 'style'
    },
    cssCodeSplit: false,
    rollupOptions: {
      // element-plus 作为 peerDependency，不打进产物，由使用方提供
      external: [
        'vue',
        'element-plus',
        /^element-plus\//,
        '@element-plus/icons-vue',
        /^@aura\/components/,
        /^@aura\/shared/
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js'
      }
    }
  }
});
