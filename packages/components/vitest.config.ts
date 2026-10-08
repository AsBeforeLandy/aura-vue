import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['__tests__/**/*.test.ts'],
    // 与 business 同理：共享 runner 的资源抖动造成过三次「CI 与 Release
    // 同 commit 结果相反」。retry: 1 只重跑失败用例一次，确定性失败
    // 重试后依然失败、门禁语义不变。
    retry: 1,
    coverage: {
      provider: 'v8',
      // 统计口径：只覆盖组件源码本体（正向白名单，比逐项排除更可靠）。
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        // barrel 文件只做 re-export，语句覆盖恒为 0，无统计意义。
        // 不剔除的话阈值会被「永远测不到的文件」拖死，失去防回退的意义。
        'src/index.ts',
        'src/**/index.ts',
        'src/**/*.d.ts',
      ],
      reporter: ['text', 'html'],
      // 阈值取「当前实测值 - 3~4pt」：
      // 目的是防止覆盖率回退，而不是把还没补齐的用例当成硬性红线。
      // 提升覆盖率时应同步上调这里的数字。
      thresholds: {
        statements: 92,
        branches: 84,
        functions: 80,
        lines: 92,
      },
    },
  },
});
