# Select 选择器

从一组固定选项中挑选单个值。采用自定义下拉面板（而非原生 `<select>`），支持完整的键盘导航与浮层定位。

## 何时使用

- 需要从 3 个以上固定选项中选一个时
- 选项内容较长、需要固定宽度展示时
- 需要禁用部分选项时

## 何时不用

| 场景 | 应该用 |
| --- | --- |
| 只有 2 个选项 | Switch（互斥状态）或单选组 |
| 选项超过 10 个且需搜索 | 带搜索的 Select（待提供） |
| 需要多选 | 多选 Select / 复选框组（待提供） |
| 选项需要分组或自定义渲染 | 待提供 |

## 基础用法

<demo src="./demos/select/basic.vue" />

## 选项格式

`options` 支持两种写法，可混用：

```ts
// 字符串数组：label 与 value 相同
const simple = ['待处理', '进行中', '已完成'];

// 对象数组：可单独指定 label / value / disabled
const full = [
  { label: '杭州', value: 'hangzhou' },
  { label: '深圳（暂不可选）', value: 'shenzhen', disabled: true }
];
```

<demo src="./demos/select/strings.vue" />

## 受控 / 非受控与禁用

<demo src="./demos/select/states.vue" />

## 键盘导航

组件提供完整的键盘操作能力，无需鼠标即可完成选择：

| 按键 | 行为 |
| --- | --- |
| `↑` / `↓` | 移动高亮项（自动跳过禁用项，循环滚动） |
| `Enter` | 选中当前高亮项 |
| `Esc` | 关闭面板 |
| `Space` / `Enter`（关闭态） | 打开面板 |

打开面板时，若有已选项则高亮该项，否则默认高亮第一个可选项。

## 浮层定位

下拉面板通过 `Teleport` 渲染到 `body`，并使用 `fixed` 定位，因此：

- **不受父级 `overflow: hidden` 裁剪**（这是原生实现的常见痛点）
- 下方空间不足且上方更宽裕时，**自动向上展开**
- 页面滚动、窗口尺寸变化时自动重新计算位置
- 宽度默认与触发框等宽

## 面板配色

面板颜色通过 CSS 变量配置：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--aura-select-popup-bg` | 面板背景色 | `--aura-bg` |
| `--aura-select-color-scheme` | 面板色彩方案 | `light` |
| `--aura-color-primary-shadow` | 选项高亮底色 | 主色低透明度 |

```css
:root {
  --aura-select-popup-bg: #ffffff;
  --aura-select-color-scheme: dark; /* 暗色模式下避免原生弹层配色突兀 */
}
```

## 设计规范

| 项 | 规范 |
| --- | --- |
| 占位文案 | "请选择 + 名词"，如"请选择城市" |
| 宽度 | 不宜小于 120px，选项过长时截断并保留 tooltip |
| 禁用选项 | 需在文案上说明原因，如"深圳（暂不可选）" |
| 默认值 | 除非业务明确有默认项，否则保持空占位，避免误选 |

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 受控值（传入即视为受控模式） | `string` | - |
| defaultValue | 非受控模式初始值 | `string` | - |
| options | 选项，支持对象或字符串 | `Array<{ label, value, disabled? } \| string>` | `[]` |
| placeholder | 占位文案 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |

### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中变化时触发 | `(value: string)` |
| change | 选中变化时触发（与上一个同时触发） | `(value: string)` |

### 类型导出

```ts
import type { SelectProps, SelectEmits, SelectOption } from '@aura/components';
```

### CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.aura-select` | 容器 |
| `.aura-select--disabled` | 禁用态 |
| `.aura-select-trigger` | 触发按钮 |
| `.aura-select-trigger--open` | 面板展开中 |
| `.aura-select-label` | 已选值文本 |
| `.aura-select-placeholder` | 占位文本 |
| `.aura-select-arrow` | 下拉箭头（`--open` 时旋转） |
| `.aura-select-dropdown` | 面板（Teleport 到 body） |
| `.aura-select-option` | 选项（`--active` / `--selected` / `--disabled`） |

## 常见问题

### 面板被容器裁剪了？

不会。面板 Teleport 到 `body` 并使用 `fixed` 定位，不受任何父级溢出裁切影响。

### 面板背景色是黑的？

这是原生 `<select>` 的弹层配色问题（由 `color-scheme` 决定），本组件使用自定义面板，因此不存在该问题。若你在项目其他位置仍使用原生 select，请设置 `color-scheme: light`。

## 相关文档

- [Switch 开关](/components/switch) — 布尔状态场景
- [样式与令牌](/styles/) — 组件级 CSS 变量索引
