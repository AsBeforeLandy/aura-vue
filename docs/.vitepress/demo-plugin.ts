import type { Plugin } from 'vite';

/**
 * dumi 式 Demo 一行引用：
 *   .md 里写 <demo src="./demos/button/basic.vue" />
 *   编译期自动展开为 <Demo> 组件调用，并注入组件 import 与 ?raw 源码 import。
 *
 * 约定：
 *   - src 为相对当前 .md 的路径，Vite 会自行解析（demo 与页面同目录树）。
 *   - 使用了 <demo> 的页面不要再手写 <script setup>（组件库已全局注册）。
 *   - 支持 <demo ... /> 自闭合或成对 <demo>...</demo>。
 */
export function demoPlugin(): Plugin {
  let runId = 0;
  return {
    name: 'aura-vue:demo',
    enforce: 'pre',
    transform(code, file) {
      if (!file.endsWith('.md')) return;

      const demoTagRe = /<demo\s+src="([^"]+)"\s*(\/?)\s*(>)/g;
      const matches = [...code.matchAll(demoTagRe)];
      if (matches.length === 0) return;

      const replacements: Array<{ start: number; end: number; text: string }> = [];
      const imports: string[] = [];
      const uid = runId++;

      for (const m of matches) {
        const src = m[1];
        const selfClosing = m[2] === '/';
        const idx = replacements.length;
        const compVar = `__demo_c${uid}_${idx}`;
        const srcVar = `__demo_s${uid}_${idx}`;
        imports.push(
          `import ${compVar} from '${src}';`,
          `import ${srcVar} from '${src}?raw';`
        );

        const tagStart = m.index ?? 0;
        const afterSrc = tagStart + m[0].length;
        let end: number;
        let attrs = '';
        if (selfClosing) {
          end = afterSrc;
        } else {
          const closeIdx = code.indexOf('</demo>', afterSrc);
          if (closeIdx === -1) {
            throw new Error(`[aura-vue:demo] 缺少 </demo> 闭合标签: ${file}`);
          }
          attrs = code.slice(afterSrc, closeIdx).trim();
          end = closeIdx + '</demo>'.length;
        }

        const rendered = `<Demo :component="${compVar}" :source="${srcVar}"${attrs ? ' ' + attrs : ''} />`;
        replacements.push({ start: tagStart, end, text: rendered });
      }

      let out = code;
      for (const r of [...replacements].reverse()) {
        out = out.slice(0, r.start) + r.text + out.slice(r.end);
      }

      const scriptBlock = `\n\n<script setup lang="ts">\n${imports.join('\n')}\n</script>\n`;
      out += scriptBlock;

      return { code: out, map: null };
    }
  };
}
