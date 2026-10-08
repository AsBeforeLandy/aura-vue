import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['__tests__/**/*.test.ts'],
    // 业务组件的单测要挂载 Element Plus 的重组件（ElTable / ElDropdown /
    // ElDatePicker 等），单个用例耗时本来就长；在 CI 与其他工作流并行、
    // runner 资源紧张时，默认 5s 会偶发超时（Release 作业就因此挂过一次）。
    // 这里放宽到 15s：只影响「卡死多久才判失败」，不影响通过用例的速度。
    testTimeout: 15_000,
    // CI 上的「偶发失败」已三次观测（CI 绿 Release 红 / 反向交替，相同命令
    // 相同 commit），本地循环压测六轮无法复现——是共享 runner 的资源抖动，
    // 而非代码问题。retry: 1 只重跑失败的用例一次：确定性失败重试后依然
    // 失败、门禁语义不变；吸收的只是 runner 时序抖动。与上面的放宽超时
    // 是同一问题的两层缓解。
    retry: 1,
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
