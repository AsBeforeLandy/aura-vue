# 组件设计规范

本文档说明 Aura Vue 在设计组件时遵循的约定。**它既是使用者理解组件行为的钥匙，也是贡献新组件时的验收清单。**

## 命名规范：prefixCls + BEM

所有组件类名由 `@aura/shared` 的 `prefixCls` 生成，统一带 `aura-` 前缀：

```ts
import { prefixCls } from '@aura/shared';

prefixCls('button');          // 'aura-button'
prefixCls('button--primary'); // 'aura-button--primary'
```

命名遵循 BEM 变体：

| 类型 | 写法 | 示例 |
| --- | --- | --- |
| Block（块） | `aura-{block}` | `aura-button` |
| Modifier（修饰符） | `aura-{block}--{modifier}` | `aura-button--primary`、`aura-button--small` |
| Element（元素） | `aura-{block}-{element}` | `aura-select-trigger`、`aura-modal-title` |

**为什么不用 CSS Modules？** 组件库需要对使用方暴露稳定、可预测的类名，使用方才能在自己的样式表中覆盖或扩展。CSS Modules 会把类名哈希化，破坏这种契约。详见[样式与令牌](/styles/)。

## 受控与非受控

组件库所有表单控件（Input / Select / Switch）统一实现**双轨制**，由 `useControllable` 组合式函数驱动。

### 判定规则

```ts
// 传了 modelValue（即 Vue 的 v-model）→ 受控模式
// 只传 defaultValue           → 非受控模式
<Input v-model="form.name" />                 <!-- 受控 -->
<Input :default-value="'初始值'" @change="fn" /> <!-- 非受控 -->
```

### 行为差异

| 模式 | 值来源 | 内部状态 | 外部不更新时 |
| --- | --- | --- | --- |
| 受控 | `props.modelValue` | 不持有 | **显示不变**（严格受控） |
| 非受控 | 内部 `ref` | 自持 | 正常响应交互 |

两种模式都会 emit `update:modelValue`，因此非受控组件也能向上同步最新值。

### 实现要点

```ts
const value = useControllable<string>(props, emit);
```

这个组合式函数返回一个可读写的 `computed`：读时按模式取值，写时非受控更新内部状态，两种情况都对外 emit。

> **受控模式的一个关键细节**：Input 在受控模式下会在 `input` 事件后把 DOM 值复位为外部值（`syncDomValue`），保证"外部不更新则显示不变"。同时用 `compositionstart` / `compositionend` 守卫 IME 组词过程，否则会出现**中文输入被打断**的问题。

## 表单校验接入

Input 处于 `FormItem` 内时会自动接入校验钩子，无需任何额外配置：

```vue
<FormItem label="邮箱" prop="email" :rules="[{ required: true, message: '请输入邮箱' }]">
  <Input v-model="model.email" />
</FormItem>
```

实现依赖 `provide / inject`：

1. `Form` 通过 `provide` 暴露 `model` 与表单项注册表
2. `FormItem` 向 `Form` 注册自身，并把校验触发器通过 `provide` 下传
3. `Input` 用 `inject(formItemHookKey, null)` 拿到钩子，在 `input` 时调 `onControlChange()`、在 `blur` 时调 `onControlBlur()`

这种设计的好处是：**控件对表单是无感知的**。脱离 `FormItem` 使用时，`inject` 拿到 `null`，校验逻辑自然失效，不会报错。

## 表单校验规则

`Rule` 接口定义在 `packages/components/src/form/validator.ts`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `required` | `boolean` | 必填（`undefined` / `null` / `''` 视为空） |
| `min` / `max` | `number` | 长度范围 |
| `pattern` | `RegExp` | 正则匹配 |
| `validator` | `(value) => boolean \| string \| Promise` | 自定义校验器，返回字符串视为错误文案 |
| `trigger` | `'change' \| 'blur'` | 触发时机，缺省则三种时机都触发 |
| `message` | `string` | 错误文案 |

规则**串行执行，返回第一个错误即停止**——这保证了校验开销最小，且错误提示始终聚焦在最关键的问题上。

## 事件命名

| 事件 | 语义 | 触发时机 |
| --- | --- | --- |
| `update:modelValue` | 值变化请求 | 任意交互导致值改变 |
| `change` | 值变化确认 | 与 `update:modelValue` 同时，但语义更明确 |
| `click` / `ok` / `cancel` / `close` | 行为事件 | 由具体组件定义 |

统一使用 `defineEmits<XXXEmits>()` 的**类型式声明**，事件签名集中定义在组件的 `types.ts` 中：

```ts
export type InputEmits = {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'clear'): void;
};
```

## Props 定义

Props 使用 `as const` 对象集中声明，配合 `ExtractPropTypes` 推导类型：

```ts
export const buttonProps = {
  /** 按钮类型 */
  type: { type: String as PropType<ButtonType>, default: 'default' }
} as const;

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;
```

**好处**：`defineProps(buttonProps)` 直接复用，运行时默认值与 TS 类型从同一份定义推导，不会出现"文档写错默认值"的问题。每个 prop 都要写 JSDoc 注释——IDE 悬浮提示和文档站都靠它。

## 样式组织

```
packages/components/src/button/
├── Button.vue            # 组件逻辑与模板
├── types.ts              # Props / Emits / 类型导出
├── index.ts              # 统一出口
└── style/
    └── index.less        # 独立样式文件
```

**样式与逻辑必须分离**，`<style>` 块不写在 `.vue` 文件内。这样构建时 Less 可被单独提取、按需引入，也便于使用方通过变量覆盖换肤。

## 目录结构

```
packages/components/src/
├── index.ts              # 组件库总出口
├── composables/          # 跨组件复用的组合式函数
│   └── use-controllable.ts
├── form/
│   ├── Form.vue
│   ├── FormItem.vue
│   ├── context.ts        # provide/inject 的 key 定义
│   ├── validator.ts      # 校验规则引擎
│   ├── types.ts
│   └── style/index.less
└── style/
    └── base.less         # 全局设计令牌
```

## 新增组件检查清单

- [ ] Props 在 `types.ts` 中以 `as const` 声明，带 JSDoc 注释
- [ ] Emits 以类型别名集中声明
- [ ] 类名通过 `prefixCls` + BEM 生成，无硬编码类名
- [ ] 表单控件实现受控 / 非受控双轨
- [ ] 样式放在独立 `style/index.less`，颜色走 CSS 变量
- [ ] 在 `src/index.ts` 中导出
- [ ] 补充单测（正常 / 边界 / 异常三类用例）
- [ ] 补充文档页与 demo

## 相关文档

- [样式与令牌](/styles/) — 类名与 CSS 变量索引
- [布局与排版](/guide/layout) — 间距与排版约定
