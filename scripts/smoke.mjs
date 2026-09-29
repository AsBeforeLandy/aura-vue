#!/usr/bin/env node
/**
 * 产物冒烟测试（Artifact Smoke Test）
 *
 * 存在的意义：
 *   本仓库的文档站大量通过源码路径（`@aura/components/src/style/base.less`）
 *   消费样式，而组件产物（`dist/`）从不在开发流程中被真正「装机」消费，
 *   因此「开发态正常、交付态断裂」类问题不会被任何现有命令发现：
 *
 *     - package.json 的 exports 指向了 files 白名单里不存在的文件
 *     - 产物里残留了使用方解析不到的裸包名（如未构建的 workspace 包）
 *     - father/vite 的 alias 泄漏成仓库内相对路径
 *
 *   本脚本专门验证**产物本身**是否可交付。
 *
 * 检查项：
 *   1. types / main / module 指向的文件真实存在
 *   2. exports 映射的每个目标文件真实存在
 *   3. 产物包含 .d.ts 与样式入口
 *   4. 产物的 JS 中不存在逃出包目录的相对路径（alias 泄漏）
 *   5. 产物的 JS 中所有裸包名依赖都已在 dependencies / peerDependencies 中声明
 *   6. 产物中相对引用的资源文件真实存在
 *   7. 文档里教用户 import 的 `@aura/*` 子路径，确实被 exports 暴露
 *
 * 用法：pnpm smoke（应在 build:lib 之后执行）
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 需要做交付校验的库包：**自动派生**，不写死清单。
 *
 * 判据是「用 vite build 构建」——即产出 `dist/` 的库包。
 * `@aura/shared`（源码形式被内联）与 `@aura/icons`（占位）不在此列。
 * 派生而非硬编码，可保证新增包自动纳入校验，不会漏。
 */
const LIB_PACKAGES = readdirSync(join(ROOT, 'packages'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .filter((entry) => {
    const pkgJsonPath = join(ROOT, 'packages', entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) return false;
    const { scripts } = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    return /vite\s+build/.test(scripts?.build ?? '');
  })
  .map((entry) => entry.name);

if (LIB_PACKAGES.length === 0) {
  console.error('smoke — 未推导出任何待校验的库包，请检查 packages/ 目录');
  process.exit(1);
}

/**
 * 允许出现在产物中、但无需在 dependencies / peerDependencies 单独声明的说明符：
 *
 * - `node:` —— Node 内置模块；
 * - `@vue/*` —— Vue 的子包（如 `@vue/reactivity`）。
 *   它们随 `vue` 一起安装，而本项目已把 `vue` 声明为 peerDependency，
 *   类型里引用到子包属于正常情况，不应要求逐个声明。
 */
const BUILTIN = /^(node:|@vue\/)/;

let failures = 0;

function group(title) {
  console.log(`\n${title}`);
}
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** 从 JS / d.ts 产物中提取所有模块标识符 */
function extractSpecifiers(code) {
  const found = new Set();
  const patterns = [
    /\bfrom\s*['"]([^'"]+)['"]/g, // import x from '...' / export ... from '...'
    /\bimport\s*['"]([^'"]+)['"]/g, // 副作用导入 import '...'
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
    // 动态 import 与「导入类型」形式：import('...')
    // 声明文件里 `import('pkg').Type` 非常常见，漏掉它会放过整类路径问题
    // （本项目就因此漏检了 tsconfig paths 映射泄漏出的 node_modules 相对路径）
    /\bimport\s*\(\s*['"]([^'"]+)['"]/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code)) !== null) found.add(m[1]);
  }
  return [...found];
}

/** 判断相对引用能否解析到真实文件（兼容无扩展名 / 目录 index） */
function resolves(importerFile, spec) {
  const base = resolve(dirname(importerFile), spec);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.mjs`,
    join(base, 'index.js'),
  ];

  // 声明文件里的引用由 TypeScript 解析，规则与 JS 不同：
  // 说明符 `./x.js` 会映射到同名的 `./x.d.ts`，**不要求那个 .js 真实存在**。
  // 本项目大量使用这种写法（`export * from './button/index.js'`），
  // 因为纯 re-export 模块在 JS 侧被 Rollup 消除、只留下 index.d.ts。
  // scripts/postbuild-dts.mjs 正是按该规则生成，attw 也确认其在
  // node16 / bundler 下均可正确解析。
  if (importerFile.endsWith('.d.ts')) {
    candidates.push(
      `${base}.d.ts`,
      join(base, 'index.d.ts'),
      base.replace(/\.js$/, '.d.ts'),
    );
  }

  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
}

for (const pkg of LIB_PACKAGES) {
  const pkgDir = join(ROOT, 'packages', pkg);
  const pkgJsonPath = join(pkgDir, 'package.json');

  group(`@aura/${pkg}`);

  if (!existsSync(pkgJsonPath)) {
    check('package.json 存在', () => assert(false, `未找到 ${pkgJsonPath}`));
    continue;
  }
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  const distDir = join(pkgDir, 'dist');

  // 1) 顶层入口字段
  for (const field of ['types', 'main', 'module']) {
    const value = pkgJson[field];
    check(`${field} 指向的文件存在`, () => {
      assert(value, `package.json 缺少 "${field}" 字段`);
      const target = join(pkgDir, value);
      assert(
        existsSync(target),
        `"${field}": "${value}" 指向的文件不存在（${relative(ROOT, target)}）`,
      );
    });
  }

  // 2) exports 映射。
  //    这里同时校验「声明了但文件不存在」，以及「通配符是否被 files 白名单放行」——
  //    历史缺陷：exports 声明了 "./src/*"，但 files 只含 dist，
  //    发布后任何 src 子路径导入都会 404。
  const collectExports = (node, key, out = []) => {
    if (typeof node === 'string') out.push([key, node]);
    else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node))
        collectExports(v, `${key}.${k}`, out);
    }
    return out;
  };

  const exportEntries = pkgJson.exports
    ? collectExports(pkgJson.exports, 'exports')
    : [];

  check('exports 每个非通配目标文件都存在', () => {
    assert(pkgJson.exports, 'package.json 缺少 "exports" 字段');
    const missing = exportEntries.filter(
      ([, target]) =>
        !target.includes('*') && !existsSync(join(pkgDir, target)),
    );
    assert(
      missing.length === 0,
      `以下 exports 目标不存在：\n         ${missing
        .map(([k, t]) => `${k} -> ${t}`)
        .join('\n         ')}`,
    );
  });

  check('exports 的通配符符合 Node 规范（每个键至多一个 *）', () => {
    // Node 解析 exports 模式时只把「第一个 *」当作通配符，
    // 其余 `*` 会被当成字面量。形如 `./src/*/style/*` 的写法因此永远匹配不上，
    // 表现为「本地开发正常（走软链），一发布就 Module not found」。
    const invalid = exportEntries
      .map(([, target]) => target)
      .filter((t) => (t.match(/\*/g) ?? []).length > 1);
    assert(
      invalid.length === 0,
      `以下 exports 目标含多个 *，Node 只会将其余 * 视为字面量：\n         ${invalid.join('\n         ')}`,
    );
  });

  check('exports 的通配符目标至少能匹配到一个真实文件', () => {
    const wildcards = exportEntries.filter(([, target]) =>
      target.includes('*'),
    );
    // 候选文件只扫 src 与 dist，避免遍历 node_modules
    const candidates = ['src', 'dist']
      .map((dir) => join(pkgDir, dir))
      .filter((dir) => existsSync(dir))
      .flatMap((dir) => walk(dir))
      .map((f) => relative(pkgDir, f).split(sep).join('/'));

    const dead = wildcards.filter(([, target]) => {
      const norm = target.replace(/^\.\//, '');
      const matcher = wildcardToRegExp(norm);
      return !candidates.some((rel) => matcher.test(rel));
    });
    assert(
      dead.length === 0,
      `以下 exports 通配符匹配不到任何文件（发布后必然 404）：\n         ${dead
        .map(([k, t]) => `${k} -> ${t}`)
        .join('\n         ')}`,
    );
  });

  // 3) 声明文件与样式入口
  const dtsFiles = existsSync(distDir)
    ? walk(distDir).filter((f) => f.endsWith('.d.ts'))
    : [];

  check('产物包含至少一个 .d.ts', () => {
    assert(
      existsSync(distDir),
      `产物目录不存在：${relative(ROOT, distDir)}（请先执行 pnpm build:lib）`,
    );
    assert(dtsFiles.length > 0, '未产出任何 .d.ts，产物无法被 TypeScript 消费');
  });

  check('产物包含样式入口 dist/style.css', () => {
    const css = join(distDir, 'style.css');
    assert(
      existsSync(css),
      `未找到 ${relative(ROOT, css)}，使用方无法引入样式`,
    );
  });

  // 4/5/6) 扫描产物中的模块引用。
  //
  // 同时扫 `.js` 与 `.d.ts`：声明文件里的引用同样会随包发布，
  // 一旦混进仓库内路径（如 tsconfig 的 paths 映射把某个依赖解析成
  // `../node_modules/<pkg>/type.d.ts`），消费方的 TypeScript 就会解析失败。
  // 只扫 JS 会漏掉这一类——本项目就是先漏了 d.ts，才靠 attw 才发现。
  const jsFiles = existsSync(distDir)
    ? walk(distDir).filter((f) => f.endsWith('.js') || f.endsWith('.d.ts'))
    : [];
  const declared = new Set([
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.peerDependencies ?? {}),
  ]);

  const escaped = [];
  const undeclared = new Set();
  const brokenRelative = [];
  const intoNodeModules = [];

  for (const file of jsFiles) {
    const code = readFileSync(file, 'utf-8');
    for (const spec of extractSpecifiers(code)) {
      if (spec.startsWith('.')) {
        const abs = resolve(dirname(file), spec);
        // 「穿进 node_modules 的相对路径」是独立的一类缺陷：
        // 它在本地能解析（node_modules 确实在包目录内），所以 escaped 检查放行；
        // 但 files 白名单不会把 node_modules 发出去，安装后必然解析失败。
        // 典型来源是 tsconfig 的 paths 映射（把某个依赖指到 ./node_modules/...）。
        if (spec.includes('node_modules/')) {
          intoNodeModules.push(`${relative(ROOT, file)} -> ${spec}`);
          continue;
        }
        if (!abs.startsWith(pkgDir + sep)) {
          escaped.push(`${relative(ROOT, file)} -> ${spec}`);
        } else if (!resolves(file, spec)) {
          brokenRelative.push(`${relative(ROOT, file)} -> ${spec}`);
        }
        continue;
      }
      if (BUILTIN.test(spec)) continue;
      // 取出包名（作用域包保留前两段）
      const name = spec.startsWith('@')
        ? spec.split('/').slice(0, 2).join('/')
        : spec.split('/')[0];
      if (!declared.has(name)) undeclared.add(`${name}  (来自 ${spec})`);
    }
  }

  check('产物中没有穿进 node_modules 的相对路径', () => {
    assert(
      intoNodeModules.length === 0,
      `发现 ${intoNodeModules.length} 处指向 node_modules 的相对路径，` +
        `本地可解析但不会被发布，安装后必然失败：\n         ${intoNodeModules
          .slice(0, 5)
          .join('\n         ')}`,
    );
  });

  check('产物中没有逃出包目录的相对路径 (alias 泄漏)', () => {
    assert(
      escaped.length === 0,
      `发现 ${escaped.length} 处路径逃逸，发布后必然解析失败：\n         ${escaped
        .slice(0, 5)
        .join('\n         ')}`,
    );
  });

  check('产物中所有裸包名依赖都已声明', () => {
    assert(
      undeclared.size === 0,
      `以下依赖未在 dependencies / peerDependencies 中声明：\n         ${[
        ...undeclared,
      ]
        .map((d) => d)
        .join('\n         ')}`,
    );
  });

  check('产物中相对引用的资源文件都存在', () => {
    assert(
      brokenRelative.length === 0,
      `以下相对引用无法解析：\n         ${brokenRelative
        .slice(0, 5)
        .join('\n         ')}`,
    );
  });
}

console.log('');

// 7) 文档中教用户 import 的包内子路径，必须真实存在于该包的 exports 中。
//    历史缺陷：安装文档写 `import '@aura/components/dist/style.css'`，
//    但 exports 只暴露了 `./style.css`；使用者照抄必然 Module not found。
// 8) 反向校验：没有构建产物、却也没标 private 的包，会被 changeset publish 视为待发布项，
//    发布出一个「入口指向 .ts 源码、使用方加载不了」的坏包。
//    @aura/shared 与 @aura/icons 都踩过这个坑。私有包必须显式声明，不能靠运气。
group('工作区发布配置');

check('无构建产物的包必须标记 private', () => {
  const offenders = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !LIB_PACKAGES.includes(name))
    .filter((name) => {
      const p = join(ROOT, 'packages', name, 'package.json');
      if (!existsSync(p)) return false;
      return JSON.parse(readFileSync(p, 'utf-8')).private !== true;
    });

  assert(
    offenders.length === 0,
    `以下包既没有构建产物、又未声明 "private": true，会被误发布：\n         ${offenders.join(
      '\n         ',
    )}`,
  );
});

group('文档引用的包内路径');

/**
 * 把 exports 里的通配符键转成正则。
 *
 * 需要支持「多个通配符」的情况，例如 `./src/*\/style/*`：
 * 早先按 `split('*')` 只取前两段，会把第二个 `*` 丢掉，
 * 导致这类键永远匹配失败（属于校验器自身的假失败）。
 */
function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`);
}

/** exports 键（含通配符）能否匹配某个子路径 */
function matchesExportKey(key, sub) {
  if (!key.includes('*')) return key === sub;
  return wildcardToRegExp(key).test(sub);
}

/** 文档里形如 `src/{组件}/style` 的占位写法，不参与校验 */
function isPlaceholderPath(sub) {
  return /[{<>*]|\.\.\./.test(sub);
}

/**
 * 反例行不参与校验。
 *
 * 文档里刻意展示「错误写法」是很常见的（例如提示不要写
 * `@aura/components/button`），这类行会包含确实不存在的路径。
 * 约定：含 `❌` 标记的行视为反例，跳过。
 */
function isCounterExample(line) {
  return line.includes('❌');
}

check('文档中引用的 @aura/* 子路径都已由 exports 暴露', () => {
  const DOCS = [
    'README.md',
    ...walk(join(ROOT, 'docs')).filter((f) => f.endsWith('.md')),
  ].filter((f) => existsSync(f));

  /** 缓存各包 exports 的键，避免重复读取 */
  const exportsKeys = new Map();
  const keysOf = (pkg) => {
    if (!exportsKeys.has(pkg)) {
      const p = join(ROOT, 'packages', pkg, 'package.json');
      exportsKeys.set(
        pkg,
        existsSync(p)
          ? Object.keys(JSON.parse(readFileSync(p, 'utf-8')).exports ?? {})
          : [],
      );
    }
    return exportsKeys.get(pkg);
  };

  const bad = [];
  const re = /@aura\/([a-z-]+)\/([^\s'"`),;]+)/g;
  for (const file of DOCS) {
    const lines = readFileSync(file, 'utf-8').split('\n');
    lines.forEach((line, i) => {
      if (isCounterExample(line)) return;
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        const [, pkg, sub] = m;
        // 跳过占位写法（如 `src/{组件}/style`）与不存在的包名
        if (isPlaceholderPath(sub)) continue;
        if (!existsSync(join(ROOT, 'packages', pkg))) continue;
        const key = `./${sub.replace(/\/+$/, '')}`;
        if (!keysOf(pkg).some((k) => matchesExportKey(k, key))) {
          bad.push(
            `${relative(ROOT, file)}:${i + 1} 引用了 @aura/${pkg}/${sub}，但 exports 未暴露可匹配的键`,
          );
        }
      }
    });
  }
  assert(
    bad.length === 0,
    `以下文档路径在发布包中不存在：\n         ${bad.join('\n         ')}`,
  );
});

console.log('');
if (failures > 0) {
  console.log(`冒烟测试失败：${failures} 项未通过\n`);
  process.exit(1);
}
console.log('冒烟测试全部通过：产物可交付\n');
