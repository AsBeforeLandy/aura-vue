<template>
  <div class="demo">
    <div v-if="component" class="demo-render">
      <component :is="component" />
    </div>
    <div v-else-if="errorMsg" class="demo-render">
      <p class="demo-error">Demo 渲染失败：{{ errorMsg }}</p>
    </div>
    <div v-if="sourceText" class="demo-togglebar">
      <button type="button" class="demo-toggle" @click="toggle">
        <span class="demo-toggle-icon" :class="{ open }" aria-hidden="true">{ } </span>
        {{ open ? '收起代码' : '查看代码' }}
      </button>
      <span class="demo-toggle-divider" aria-hidden="true"></span>
      <button type="button" class="demo-toggle" @click="copySource">
        {{ copied ? '已复制 ✓' : '复制代码' }}
      </button>
    </div>
    <transition name="demo-collapse">
      <div v-show="open && sourceText" class="demo-source">
        <pre><code class="hljs" v-html="highlighted"></code></pre>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import hljs from 'highlight.js/lib/common';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('xml', xml);

const props = defineProps<{
  component?: unknown;
  source?: string;
}>();

const open = ref(false);
const sourceText = computed(() => props.source || '');
const errorMsg = computed(() => (props.component ? '' : '未注入组件'));

/** Vue SFC 源码：用 xml + js 分块高亮过于复杂，统一用 xml（含 <script> 内样式块仍可读），
 *  相较纯文本已有明显着色提升 */
const highlighted = computed(() => {
  const src = sourceText.value;
  if (!src) return '';
  try {
    return hljs.highlight(src, { language: 'xml', ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(src);
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toggle() {
  open.value = !open.value;
}

const copied = ref(false);

async function copySource() {
  try {
    await navigator.clipboard.writeText(sourceText.value);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = sourceText.value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1600);
}
</script>

<style scoped>
.demo {
  margin: 16px 0;
  border: 1px solid var(--aura-docs-border, var(--vp-c-divider));
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.demo:hover {
  border-color: var(--vp-c-brand-3);
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.08);
}
.demo-render {
  padding: 24px;
}
.demo-error {
  color: var(--vp-c-danger-1, #e11d48);
}
.demo-togglebar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--aura-docs-bg-soft, transparent);
}
.demo-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}
.demo-toggle:hover {
  color: var(--vp-c-brand-1);
}
.demo-toggle-icon {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: var(--vp-c-brand-1);
  transition: transform 0.2s;
}
.demo-toggle-icon.open {
  transform: rotate(90deg);
}
.demo-toggle-divider {
  width: 1px;
  height: 14px;
  background: var(--vp-c-divider);
}
.demo-source {
  border-top: 1px solid var(--vp-c-divider);
  max-height: 480px;
  overflow: auto;
}
.demo-source pre {
  margin: 0;
  padding: 16px 20px;
  background: var(--vp-code-block-bg, #0d1117);
}
.demo-source code {
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  white-space: pre;
}
</style>

<style>
/* hljs token 色，适配 VitePress 主题变量（跟随暗/亮） */
.demo-source .hljs-tag,
.demo-source .hljs-name { color: var(--vp-c-brand-1, #7c3aed); }
.demo-source .hljs-attr { color: #e879f9; }
.demo-source .hljs-string { color: #7ee787; }
.demo-source .hljs-comment { color: var(--vp-c-text-3, #8b949e); font-style: italic; }
.demo-source .hljs-attribute { color: #ffa657; }
.demo-source .hljs-built_in { color: #79c0ff; }
.demo-source .hljs-title { color: #d2a8ff; }
.demo-source .hljs-meta { color: #ff7b72; }
.demo-source .hljs-keyword,
.demo-source .hljs-selector-tag { color: #ff7b72; }
.demo-source .hljs-number,
.demo-source .hljs-literal { color: #79c0ff; }
</style>
