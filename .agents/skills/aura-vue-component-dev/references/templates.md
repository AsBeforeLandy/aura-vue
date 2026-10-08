# Aura Vue 组件五件套模板

骨架提炼自仓库现有组件：`packages/business/src/description`（props 对象 + 桶导出的标准形态）、`packages/business/src/pro-table`（实例方法 + utils 纯函数层）、`packages/business/__tests__/business-components.test.ts`（测试风格）。占位符约定：`Xxx` = 组件名（PascalCase），`xxx` = 目录名 / 类名片段（kebab-case）。

## 1. types.ts（类型 + 运行时 props）

```ts
import type { PropType, VNodeChild } from 'vue';

/** 一句话说明该类型（每个公开类型都要 JSDoc） */
export interface XxxItem {
  /** 字段名 */
  key: string;
  /** 标签文案 */
  label: string;
}

export type XxxProps = {
  /** 一句话说明该 prop 的作用（每个 prop 都要有 JSDoc） */
  items?: XxxItem[];
  /**
   * 尺寸
   * @default 'default'
   */
  size?: 'large' | 'default' | 'small';
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义渲染（逃生舱），优先级最高 */
  render?: (params: { value: unknown; item: XxxItem }) => VNodeChild;
};

/** 运行时 props 对象：businessComponents 映射与 api-surface 门禁的数据来源 */
export const xxxProps = {
  items: { type: Array as PropType<XxxItem[]>, default: undefined },
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default',
  },
  disabled: { type: Boolean, default: false },
  render: {
    type: Function as PropType<XxxProps['render']>,
    default: undefined,
  },
} as const;

/** 无事件的组件写空对象；有事件用 interface XxxEmits 并 defineEmits<XxxEmits>() */
export const xxxEmits = {} as const;
```

有事件的组件（含 v-model）：

```ts
export interface XxxEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

export const xxxEmits = ['update:modelValue', 'change'] as const;
```

需要暴露实例方法的组件（参照 `pro-table/types.ts`）：

```ts
export interface XxxInstance {
  /** 刷新当前页 */
  reload(): Promise<void>;
  /** 获取当前数据 */
  getData(): Record<string, unknown>[];
}
```

## 2. Xxx.vue（组件实现）

```vue
<template>
  <div :class="prefixCls('xxx')">
    <!-- 渲染 -->
  </div>
</template>

<script setup lang="ts">
import { prefixCls } from '@aura-vue/shared';
import { xxxProps, type XxxItem } from './types';
import './style/index.less';

defineOptions({ name: 'AXxx' });

const props = defineProps(xxxProps);
const emit = defineEmits(xxxEmits);

// 受控 / 非受控双轨的表单控件改用 @aura-vue/components 的 useControllable，
// 参照 packages/components/src/input/Input.vue。
</script>
```

要点回顾：

- 根元素只写 `prefixCls('xxx')`；外部 `class` / `style` 由 Vue 单根组件自动透传，不手动合并。
- EP 组件具名按需引入（`import { ElButton } from 'element-plus'`），图标从 `'@element-plus/icons-vue'`。
- 暴露方法：`defineExpose<XxxInstance>({ reload, getData })`。
- 逃生舱渲染函数返回 `VNodeChild`，模板里用 `<component :is="..." />` 包函数组件（参照 `pro-table` 的 `renderCellNode`）。

## 3. style/index.less（样式）

```less
/**
 * Xxx 样式
 *
 * 命名遵循组件库 BEM 约定（aura-xxx / __? 见 design.md：元素单横线、修饰符双横线）。
 * 颜色全部走 CSS 变量，使用方可直接覆盖换肤。
 */

.aura-xxx {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  // 元素：单横线连写
  .aura-xxx-header {
    font-weight: 600;
    color: var(--aura-text, rgba(0, 0, 0, 0.88));
  }

  // 修饰符：双横线
  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* ---------- 暗色主题 ---------- */
html.dark {
  .aura-xxx {
    background: var(--aura-bg, #1b1a22);
    border-color: var(--aura-border-color, #322e42);
  }
}

/* ---------- 移动端 ---------- */
@media (max-width: 768px) {
  .aura-xxx {
    flex-direction: column;
  }
}
```

禁止事项：硬编码色值（hex/rgb/rgba，fallback 里的默认值除外）、`!important`、`color-mix`。颜色 / 圆角 / 间距一律 `var(--aura-*)` 令牌（清单见 `packages/components/src/style/base.less`）；过渡用 `--aura-duration-*` / `--aura-easing`；覆盖 `prefers-reduced-motion` 的组件参照 motion 相关约定。

## 4. index.ts（桶导出）

```ts
import Xxx from './Xxx.vue';

export { Xxx };
export type { XxxProps, XxxItem, XxxInstance } from './types';
export { xxxProps } from './types';
```

组件与**全部公开类型**都要导出；内部类型不进公开 API。随后接入包级 `src/index.ts` 与 `businessComponents` 映射（见 SKILL.md Step 9）。

## 5. **tests**/xxx.test.ts（测试）

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Xxx from '../src/xxx/Xxx.vue';

describe('Xxx', () => {
  afterEach(() => {
    // Teleport 弹层用例必须清理；无弹层可省
    document.body.innerHTML = '';
  });

  it('正常：默认渲染', () => {
    const wrapper = mount(Xxx, {
      props: { items: [{ key: 'a', label: 'A' }] },
    });
    expect(wrapper.text()).toContain('A');
  });

  it('正常：受控值往返', async () => {
    const wrapper = mount(Xxx, { props: { modelValue: 'a' } });
    await wrapper.setProps({ modelValue: 'b' });
    await nextTick();
    expect(wrapper.text()).toContain('b');
  });

  it('边界：空数组 / disabled', () => {
    const wrapper = mount(Xxx, { props: { items: [], disabled: true } });
    expect(wrapper.find('.aura-xxx--disabled').exists()).toBe(true);
  });

  it('异常：非法输入不崩溃', () => {
    expect(() =>
      mount(Xxx, { props: { items: undefined as never } }),
    ).not.toThrow();
  });
});
```

要点回顾：

- 用例名带「正常 / 边界 / 异常」前缀，与 `business-components.test.ts` 一致。
- EP 的 ElTable 在 happy-dom 下渲染不出 `<td>`：通过 `defineExpose` 的方法断言数据链路，别硬断言 DOM。
- 断言 DOM 行为与暴露方法；`vi.fn()` 测 emit（`wrapper.emitted('change')`）。

## 6. docs/business/xxx.md（文档页）

````md
# Xxx 中文名

一句话描述。基于 [Element Plus](https://element-plus.org/) 的 `ElXxx` 二次封装。

## 何时使用

- 需要……时
- 需要……时

## 何时不用

| 场景     | 应该用        |
| -------- | ------------- |
| ……的场景 | [替代组件](…) |

## 基础用法

`xxx` 就绪后，一句话说明核心机制：

<demo src="./demos/xxx/basic.vue" />

## API

### Props

| 属性  | 说明   | 类型                              | 默认值      |
| ----- | ------ | --------------------------------- | ----------- |
| items | 描述项 | `XxxItem[]`                       | -           |
| size  | 尺寸   | `'large' \| 'default' \| 'small'` | `'default'` |

### Events

| 事件   | 说明         | 回调参数          |
| ------ | ------------ | ----------------- |
| change | 值变化时触发 | `(value: string)` |

### 类型导出

```ts
import type { XxxProps, XxxItem } from '@aura-vue/business';
```
````

### CSS 类名

| 类名        | 说明 |
| ----------- | ---- |
| `.aura-xxx` | 容器 |

## 相关文档

- [ProForm 高级表单](/business/pro-form) — 配套表单

````

demo 文件 `docs/business/demos/xxx/basic.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Xxx } from '@aura-vue/business';

const value = ref('');
</script>

<template>
  <Xxx v-model="value" />
</template>
````

新组件记得同步 `docs/.vitepress/config.mts` 的 `/business/` 侧边栏；demo 里新用的 EP 组件要补 `docs/.vitepress/theme/index.ts` 的按需样式。
