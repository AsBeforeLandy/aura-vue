#!/usr/bin/env node
/**
 * 公开 API 表面快照校验。
 *
 * ## 为什么需要
 *
 * `checkDistExports` 那类产物检查只能确认「文件在不在」，
 * 无法发现「导出没了」「props 改名了」「事件改名了」这类**破坏性变更**。
 * 类型层面也无能为力：改个 prop 名字，类型照样编译通过，
 * 但消费方的代码会在运行时静默失效。
 *
 * 这里直接从**构建产物**里读出真实 API 表面（导出名 / 组件清单 /
 * 每个组件的 props 类型与默认值 / emits），与仓库中的快照比对。
 * 不一致就失败，强制开发者显式确认：要么是误改，要么更新快照并补 changeset。
 *
 * ## 用法
 *
 *   node scripts/api-surface.mjs            # 校验（CI 用）
 *   node scripts/api-surface.mjs --update   # 更新快照（API 确实变了时）
 *
 * 快照文件：`packages/<pkg>/api-surface.json`，需提交到仓库。
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const UPDATE = process.argv.includes('--update');

/** 与 smoke.mjs 同一套派生规则：有 `vite build` 的包才是库包 */
const LIB_PACKAGES = readdirSync(join(ROOT, 'packages'), {
  withFileTypes: true,
})
  .filter((e) => e.isDirectory())
  .filter((e) => {
    const p = join(ROOT, 'packages', e.name, 'package.json');
    if (!existsSync(p)) return false;
    const { scripts } = JSON.parse(readFileSync(p, 'utf-8'));
    return /vite\s+build/.test(scripts?.build ?? '');
  })
  .map((e) => e.name);

if (LIB_PACKAGES.length === 0) {
  console.error(
    'api-surface — 未推导出任何库包，检查 packages/*/package.json 的 build 脚本',
  );
  process.exit(1);
}

/** 值 → 可比较的描述（避免把函数、对象实例原样写进快照，导致每次构建都「变化」） */
function describeValue(value) {
  if (typeof value === 'function') return '[function]';
  if (Array.isArray(value)) return '[array]';
  if (value !== null && typeof value === 'object') return '[object]';
  return value;
}

/** Vue 组件的 props 描述子可能是构造函数、构造函数数组，或 { type, default, required } */
function normalizeProp(descriptor) {
  const isWrapped =
    descriptor !== null &&
    typeof descriptor === 'object' &&
    !Array.isArray(descriptor) &&
    ('type' in descriptor ||
      'default' in descriptor ||
      'required' in descriptor);

  const typeSpec = isWrapped ? descriptor.type : descriptor;
  const types = (Array.isArray(typeSpec) ? typeSpec : [typeSpec])
    .filter(Boolean)
    .map((t) =>
      typeof t === 'function' ? t.name || '匿名构造函数' : String(t),
    )
    .sort();

  const out = { type: types };
  if (isWrapped) {
    if (descriptor.required) out.required = true;
    if ('default' in descriptor)
      out.default = describeValue(descriptor.default);
  }
  return out;
}

/** emits 可能是字符串数组，也可能是对象字面量 */
function normalizeEmits(emits) {
  if (!emits) return [];
  const list = Array.isArray(emits) ? emits : Object.keys(emits);
  return [...new Set(list.filter((e) => typeof e === 'string'))].sort();
}

function isComponentLike(value) {
  if (!value) return false;
  if (typeof value !== 'function' && typeof value !== 'object') return false;
  return (
    'props' in value ||
    'setup' in value ||
    'render' in value ||
    '__name' in value
  );
}

/** 在模块导出里找「组件清单」对象（components / businessComponents 这类） */
function findComponentMap(mod) {
  for (const [name, value] of Object.entries(mod)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const values = Object.values(value);
    if (values.length === 0 || !values.every(isComponentLike)) continue;
    return { name, map: value };
  }
  return null;
}

function buildSurface(mod) {
  const found = findComponentMap(mod);
  const surface = {
    exports: Object.keys(mod).sort(),
    componentMap: found?.name ?? null,
    components: {},
  };

  if (found) {
    for (const [name, component] of Object.entries(found.map)) {
      const props = {};
      for (const key of Object.keys(component.props ?? {}).sort()) {
        props[key] = normalizeProp(component.props[key]);
      }
      surface.components[name] = {
        props,
        emits: normalizeEmits(component.emits),
      };
    }
  }
  return surface;
}

/** 收集两个快照之间的差异，输出人类可读的描述 */
function diff(prev, next, path = '', out = []) {
  if (JSON.stringify(prev) === JSON.stringify(next)) return out;

  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (isObj(prev) && isObj(next)) {
    for (const key of [
      ...new Set([...Object.keys(prev), ...Object.keys(next)]),
    ].sort()) {
      const p = path ? `${path}.${key}` : key;
      if (!(key in prev)) out.push(`+ ${p}`);
      else if (!(key in next)) out.push(`- ${p}`);
      else diff(prev[key], next[key], p, out);
    }
    return out;
  }

  if (Array.isArray(prev) && Array.isArray(next)) {
    for (const item of prev.filter((x) => !next.includes(x)))
      out.push(`- ${path}[] ${item}`);
    for (const item of next.filter((x) => !prev.includes(x)))
      out.push(`+ ${path}[] ${item}`);
    return out;
  }

  out.push(`~ ${path}: ${JSON.stringify(prev)} -> ${JSON.stringify(next)}`);
  return out;
}

let failed = false;

for (const pkg of LIB_PACKAGES) {
  const pkgDir = join(ROOT, 'packages', pkg);
  const entry = join(pkgDir, 'dist', 'index.js');
  const snapshotPath = join(pkgDir, 'api-surface.json');
  const pkgName = JSON.parse(
    readFileSync(join(pkgDir, 'package.json'), 'utf-8'),
  ).name;

  if (!existsSync(entry)) {
    console.error(
      `api-surface — ${pkgName}: 未找到 ${relative(ROOT, entry)}，请先执行 pnpm build:lib`,
    );
    failed = true;
    continue;
  }

  const mod = await import(pathToFileURL(entry).href);
  const current = buildSurface(mod);

  if (UPDATE) {
    writeFileSync(snapshotPath, `${JSON.stringify(current, null, 2)}\n`);
    console.log(
      `api-surface — ${pkgName}: 快照已更新（${relative(ROOT, snapshotPath)}）`,
    );
    continue;
  }

  if (!existsSync(snapshotPath)) {
    console.error(
      `api-surface — ${pkgName}: 缺少快照文件 ${relative(ROOT, snapshotPath)}，` +
        '请执行 node scripts/api-surface.mjs --update 生成并提交',
    );
    failed = true;
    continue;
  }

  const prev = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
  const changes = diff(prev, current);

  if (changes.length === 0) {
    console.log(
      `api-surface — ${pkgName}: 公开 API 未变化（${current.exports.length} 个导出口）`,
    );
    continue;
  }

  failed = true;
  console.error('');
  console.error(`api-surface — ${pkgName}: 公开 API 发生变化`);
  for (const line of changes) console.error(`  ${line}`);
  console.error('');
  console.error('若这是有意的：');
  console.error('  1) 执行 node scripts/api-surface.mjs --update 更新快照');
  console.error(
    '  2) 在 .changeset/ 补一条说明（破坏性变更用 major，其余按语义选择）',
  );
  console.error('若是误改：直接修正源码，不要更新快照。');
}

if (failed) process.exit(1);
