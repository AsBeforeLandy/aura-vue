import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['__tests__/**/*.test.ts'],
    server: {
      deps: {
        // element-plus 的产物里 `import AsyncValidator from 'async-validator'`
        // 是裸模块引用。pnpm 的严格依赖布局下，async-validator 只挂在
        // element-plus 自己的 .pnpm 目录里，business 包无法直接解析。
        // Vitest 默认会把 node_modules 里的包走 Node 外部化（externalize），
        // 于是这条 import 落到 Node 解析链上失败，EP 的 doValidate 直接抛错，
        // 表单校验永远"reject 且 reason 为 undefined"。
        // 把 element-plus 及其依赖内联进 Vite 处理，让 Vite 按自己的解析器
        // 顺着 pnpm 软链找到 async-validator。
        inline: [/element-plus/, /async-validator/],
      },
    },
    coverage: {
      provider: 'v8',
      // 统计口径：只覆盖组件源码本体（正向白名单，比逐项排除更可靠）。
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        // barrel 文件只做 re-export，语句覆盖恒为 0，无统计意义。
        'src/index.ts',
        'src/**/index.ts',
        'src/**/*.d.ts',
      ],
      reporter: ['text', 'html'],
      // 阈值取「当前实测值 - 3~4pt」：
      // 目的是防止覆盖率回退，而不是把还没补齐的用例当成硬性红线。
      // 提升覆盖率时应同步上调这里的数字。
      thresholds: {
        statements: 89,
        branches: 79,
        functions: 77,
        lines: 89,
      },
    },
  },
});
