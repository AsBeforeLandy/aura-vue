import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    // 产物、缓存与第三方目录一律不检查。
    // 注意 ESLint 9 的 flat config 不再读 .eslintignore，忽略项必须写在这里。
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.pnpm-store/**',
      '**/.workbuddy/**',
      '**/.worktrees/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/*.timestamp-*.mjs',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    // .vue 文件里的 <script lang="ts"> 需要让 vue-eslint-parser 把 TS
    // 交给 typescript-eslint 解析
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // ---------- Vue 专项 ----------

      // 组件名刻意保持单词形式（Button / Input / Modal / Select），
      // 与文件内默认导出一致
      'vue/multi-word-component-names': 'off',

      // 本项目的默认值统一定义在 `as const` 的 props 声明对象里，
      // 不使用「每个 prop 单独写 default」的写法
      'vue/require-default-prop': 'off',

      // 属性换行、标签内容换行全部交给 Prettier，避免两个工具互相打架
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-newline': 'off',

      // ---------- TypeScript 专项 ----------

      // 类型安全：允许知情妥协，但必须显式标注
      '@typescript-eslint/no-explicit-any': 'warn',

      // 未使用变量：
      // - `^_` 前缀表示「显式声明为不使用」
      // - ignoreRestSiblings 覆盖「解构出来只为把它排除出 ...rest」这一常见模式
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // 组件库本体不应向控制台输出
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    // 测试文件：放宽。
    //   - no-explicit-any：@vue/test-utils 的 Wrapper 泛型参数与内联组件桩
    //     写精确类型收益极低、维护成本很高；
    //   - one-component-per-file：测试里刻意定义内联组件桩来驱动被测组件。
    files: ['**/__tests__/**/*.{ts,vue}', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/one-component-per-file': 'off',
    },
  },

  {
    // 文档站：demo 面向阅读而非生产，主题层组件也只在文档站内消费，
    // 统一放宽易产生噪音的规则
    files: ['docs/components/demos/**/*.vue', 'docs/.vitepress/**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  {
    // 构建/校验脚本：向终端输出是其正常职能
    files: ['scripts/**/*.{js,mjs,ts}'],
    rules: {
      'no-console': 'off',
    },
  },

  // 必须放在最后：关闭所有与 Prettier 冲突的格式类规则
  prettierConfig,
);
