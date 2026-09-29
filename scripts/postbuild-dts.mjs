#!/usr/bin/env node
/**
 * 构建后处理：把产物 `.d.ts` 里的相对导入补全为带扩展名的形式。
 *
 * ## 为什么需要
 *
 * `vite-plugin-dts` 生成的声明文件沿用源码的无扩展名相对路径
 * （如 `export * from './button'`）。这在 `moduleResolution: bundler`
 * 下没问题，但在 `node16` / `nodenext` 下 TypeScript 要求显式扩展名，
 * 这类引用会解析失败——`@arethetypeswrong/cli` 报 `InternalResolutionError`，
 * 消费方会拿不到类型（静默退化成 any）。
 *
 * **运行时不受影响**：`.js` 产物里的相对引用由 Vite 生成、本来就是完整路径，
 * 需要修的只有声明文件。
 *
 * ## 规则
 *
 * - 只处理相对路径（`./` / `../`）且**未带扩展名**的说明符；
 * - 优先补成 `<spec>.js`，其次 `<spec>/index.js`（对应目录形式）；
 * - 目标文件必须真实存在于 dist，否则保持原样并计入报告，
 *   避免把引用改成一个同样不存在的路径。
 *
 * 用法：由各包的 `build` 脚本在 `vite build` 之后调用（工作目录 = 包根目录）。
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const pkgDir = process.cwd();
const distDir = join(pkgDir, 'dist');

if (!existsSync(distDir)) {
  console.error(
    `postbuild-dts — 未找到产物目录 ${distDir}，请先执行 vite build`,
  );
  process.exit(1);
}

/**
 * 已经是「运行时可直接加载」的扩展名，不需要处理。
 *
 * 注意 `.vue` **不在**此列：JS 产物里 `Button.vue` 编译后叫 `Button.vue.js`，
 * 因此声明文件里的 `from './Button.vue'` 必须补成 `'./Button.vue.js'`，
 * 否则 node16 解析不到。
 */
const RUNTIME_EXTENSION = /\.(js|mjs|cjs|json|css|less|scss)$/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/**
 * 把相对说明符补全成产物中真实存在的路径。
 * 返回补全后的说明符；无法补全时返回 null（调用方保留原样）。
 */
function completeSpecifier(spec, fromFile) {
  if (RUNTIME_EXTENSION.test(spec)) return null;
  // 去掉可能存在的尾部斜杠，统一按目录处理
  const trimmed = spec.replace(/\/+$/, '');
  const base = resolve(dirname(fromFile), trimmed);

  if (existsSync(`${base}.js`)) return `${trimmed}.js`;

  // 目录形式：`./button` 这类「纯 re-export 模块」在 JS 侧会被 Rollup 消除
  // （dist/button/index.js 不存在，因为入口已把导出扁平化到叶子模块），
  // 但声明文件 dist/button/index.d.ts 是存在的。
  // node16 解析 `./button/index.js` 时会映射到同名的 .d.ts，因此这里
  // 以 index.d.ts 的存在作为判据，而不是 index.js。
  if (
    existsSync(join(base, 'index.d.ts')) ||
    existsSync(join(base, 'index.js'))
  ) {
    return `${trimmed}/index.js`;
  }
  return null;
}

/**
 * 把「穿进 node_modules 的相对路径」改写成裸包名。
 *
 * 场景：TypeScript 的 `paths` 映射（如把 lodash-unified 指向
 * `./node_modules/lodash-unified/type.d.ts`）会让类型引用以相对路径落到
 * 声明文件里，形如 `import('../../node_modules/lodash-unified/type.d.ts')`。
 * 这种路径在消费方机器上必然不存在——发布出去就是坏的。
 *
 * 这类引用可以直接改写成裸包名（`lodash-unified`），
 * 前提是该包已声明在 dependencies 中（本项目已如此）。
 * 函数返回 null 表示这条说明符不需要改写。
 */
function deAbsolutizeNodeModules(spec) {
  if (!spec.includes('node_modules/')) return null;
  // 取最后一个 node_modules/ 之后的包名（含作用域包的前两段）
  const rest = spec.slice(
    spec.lastIndexOf('node_modules/') + 'node_modules/'.length,
  );
  const name = rest.startsWith('@')
    ? rest.split('/').slice(0, 2).join('/')
    : rest.split('/')[0];
  return name || null;
}

const dtsFiles = walk(distDir);
let rewritten = 0;
let deAbsolutized = 0;
let changedFiles = 0;
const unresolved = [];
const leaked = [];

for (const file of dtsFiles) {
  const original = readFileSync(file, 'utf-8');

  // 三种出现形式：export/import ... from '...'、动态 import('...')、副作用 import '...'
  const next = original.replace(
    /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.[^'"]*)\2/g,
    (match, prefix, quote, spec) => {
      // 先处理「穿进 node_modules」的相对路径：这类不是补扩展名的问题，
      // 而是要把整条路径收敛回裸包名。
      const bare = deAbsolutizeNodeModules(spec);
      if (bare !== null) {
        deAbsolutized += 1;
        return `${prefix}${quote}${bare}${quote}`;
      }

      // 兜底：走到这里说明前面的收敛没覆盖到，而路径仍然穿进了 node_modules。
      // 显式报错，不要让它悄悄进产物——这种路径在消费方机器上必然不存在。
      if (spec.includes('node_modules/')) {
        leaked.push(`${file} -> ${spec}`);
      }

      const completed = completeSpecifier(spec, file);
      if (completed === null) {
        if (!RUNTIME_EXTENSION.test(spec))
          unresolved.push(`${file} -> ${spec}`);
        return match;
      }
      rewritten += 1;
      return `${prefix}${quote}${completed}${quote}`;
    },
  );

  if (next !== original) {
    writeFileSync(file, next);
    changedFiles += 1;
  }
}

console.log(
  `postbuild-dts — 扫描 ${dtsFiles.length} 个声明文件，` +
    `补全 ${rewritten} 处相对引用、收敛 ${deAbsolutized} 处 node_modules 绝对路径` +
    `（涉及 ${changedFiles} 个文件）`,
);

if (leaked.length > 0) {
  console.log('');
  console.log(
    '以下路径穿进了 node_modules 且未能收敛为裸包名，' +
      '发布后消费方无法解析：',
  );
  for (const item of leaked.slice(0, 10)) console.log(`  ${item}`);
  console.log('');
  console.log(
    '处理方式：在 deAbsolutizeNodeModules 中补规则，' +
      '并确保该包声明在 dependencies 里。',
  );
  process.exit(1);
}

if (unresolved.length > 0) {
  console.log('');
  console.log('以下相对引用无法在 dist 中找到目标，已保持原样：');
  for (const item of unresolved.slice(0, 10)) console.log(`  ${item}`);
  process.exit(1);
}
