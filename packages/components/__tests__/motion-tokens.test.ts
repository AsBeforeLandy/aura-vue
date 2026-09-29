import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 动效令牌契约。
 *
 * 两件事必须由测试守住，否则很容易在后续开发里悄悄失效：
 *
 * 1. 组件样式**不得硬编码过渡时长**。一旦有人写 `transition: color .2s`，
 *    `prefers-reduced-motion` 就管不到它了——而这类回归在视觉上完全看不出来，
 *    只有真正开启系统偏好的用户会受影响。
 * 2. `reduce` 偏好下**过渡归零、但 loading 旋转不能停**。
 *    停了会让「正在处理中」看起来像界面卡死，比动起来更糟。
 *
 * happy-dom 不解析 Less、也不算样式表，因此这里直接读源码断言契约——
 * 与 Modal 动画契约测试同一套思路。
 */

const here = dirname(fileURLToPath(import.meta.url));
const componentsSrc = resolve(here, '../src');
const businessSrc = resolve(here, '../../business/src');
const baseLess = join(componentsSrc, 'style/base.less');

const readBase = () => readFileSync(baseLess, 'utf-8');

/** 递归收集 .less 文件 */
function collectLess(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectLess(full, out);
    else if (entry.name.endsWith('.less')) out.push(full);
  }
  return out;
}

describe('动效令牌 - 定义', () => {
  it('base.less 定义了过渡时长与缓动令牌', () => {
    const css = readBase();

    expect(css).toMatch(/--aura-duration-fast:\s*[\d.]+s/);
    expect(css).toMatch(/--aura-duration-base:\s*[\d.]+s/);
    expect(css).toMatch(/--aura-easing:\s*cubic-bezier\(/);
    // loading 旋转单独一个令牌：它的处理方式与过渡不同（放缓而非归零）
    expect(css).toMatch(/--aura-spin-duration:\s*[\d.]+s/);
  });
});

describe('动效令牌 - prefers-reduced-motion', () => {
  it('存在 reduce 媒体查询', () => {
    expect(readBase()).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('reduce 下过渡时长归零', () => {
    const css = readBase();
    const block = css.slice(
      css.indexOf('@media (prefers-reduced-motion: reduce)'),
    );

    expect(block).toMatch(/--aura-duration-fast:\s*0s/);
    expect(block).toMatch(/--aura-duration-base:\s*0s/);
  });

  it('reduce 下 loading 旋转被放缓而不是停止', () => {
    const css = readBase();
    const block = css.slice(
      css.indexOf('@media (prefers-reduced-motion: reduce)'),
    );

    const match = block.match(/--aura-spin-duration:\s*([\d.]+)s/);
    expect(match).not.toBeNull();

    const reduced = Number(match![1]);
    const normal = Number(
      readBase().match(/--aura-spin-duration:\s*([\d.]+)s/)![1],
    );

    // 不能为 0（那等于停转，丢失「进行中」语义），且必须明显慢于默认值
    expect(reduced).toBeGreaterThan(0);
    expect(reduced).toBeGreaterThan(normal * 2);
  });

  it('用 :root 覆盖令牌，而不是用 * 通配去禁用所有过渡', () => {
    // `* { transition: none !important }` 会连消费方自己的过渡一起干掉，属于越界；
    // 正确做法是只覆盖自己的令牌，把是否采纳的决定权留给消费方。
    //
    // 断言前必须剥掉注释——base.less 的说明里**正例举了这个反例写法**，
    // 不剥注释会把文档当成代码命中（第一版就踩了这个）。
    const code = readBase()
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');

    expect(code).not.toMatch(/\*\s*\{[^}]*transition/s);
    expect(code).not.toMatch(/!important/);
  });
});

describe('动效令牌 - 组件样式必须走令牌', () => {
  const files = [...collectLess(componentsSrc), ...collectLess(businessSrc)];

  it('收集到了待检查的样式文件', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('除 base.less 外，没有任何硬编码的过渡/动画时长', () => {
    const offenders: string[] = [];

    for (const file of files) {
      if (resolve(file) === resolve(baseLess)) continue;

      // 去掉注释与令牌引用后再找时长字面量：
      // 令牌被替换成占位符，剩下的数字才是真正写死的
      const stripped = readFileSync(file, 'utf-8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/var\(--aura-[a-z-]+\)/g, 'TOKEN');

      for (const line of stripped.split('\n')) {
        if (!/transition|animation/.test(line)) continue;
        if (/\b\d+(\.\d+)?m?s\b/.test(line)) {
          offenders.push(`${relative(componentsSrc, file)}: ${line.trim()}`);
        }
      }
    }

    expect(
      offenders,
      `以下过渡/动画写死了时长，prefers-reduced-motion 将无法作用于它们：\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });
});
