# Progress 进度条

展示操作或任务的当前进度，**只用于有确定进度的场景**。

## 何时使用

- 上传 / 下载的确定进度
- 多步骤流程的完成度（第 3 / 5 步）
- 配额、容量的使用比例

## 何时不用

| 场景                      | 应该用                        |
| ------------------------- | ----------------------------- |
| 进度不确定的加载          | Spin，不要用假进度            |
| 步骤之间的流转关系        | Steps 步骤条（后续提供）      |
| 磁盘 / 配额等静态占用示意 | 仍是 Progress，但注意更新时机 |
| 结果性的成功 / 失败       | Alert / Message               |

> **核心判断**：Progress 表达「进行到多少」。给不出真实进度的任务用 Spin，**不要伪造进度**——假进度比没有进度更伤信任。

## 基础用法

<demo src="./demos/progress/basic.vue" />

## 无障碍

根节点带 `role="progressbar"` 与完整的 `aria-valuenow / valuemin / valuemax`；**可访问名称请传 `label`**——单独一个进度条对读屏只是「进度条 40%」，不知道是什么的 40%。

## 设计规范

| 项     | 规范                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 状态色 | normal 主色；success 完成；danger 出错或超额。颜色只表达状态，别用来装饰 |
| 精度   | 文字取整数百分比；进度更新频率高时注意 tabular-nums 防跳动               |
| 轨道   | 默认 8px；紧凑布局可用 4px，不建议低于 4px（不可辨认）                   |

## API

### Props

| 属性        | 说明                            | 类型                                | 默认值     |
| ----------- | ------------------------------- | ----------------------------------- | ---------- |
| percent     | 进度百分比；超出 0~100 会被钳位 | `number`                            | `0`        |
| status      | 状态                            | `'normal' \| 'success' \| 'danger'` | `'normal'` |
| showInfo    | 是否展示右侧百分比文字          | `boolean`                           | `true`     |
| strokeWidth | 轨道高度（px）                  | `number`                            | `8`        |
| label       | 无障碍名称（progressbar 必需）  | `string`                            | -          |

### 类型导出

```ts
import type { ProgressProps, ProgressStatus } from '@aura-vue/components';
```

### CSS 类名

| 类名                                    | 说明               |
| --------------------------------------- | ------------------ |
| `.aura-progress`                        | 根节点             |
| `.aura-progress--normal/success/danger` | 状态色             |
| `.aura-progress-track / -bar / -info`   | 轨道 / 进度 / 文字 |

## 相关文档

- [Spin 加载中](/components/spin) — 进度不确定时
- [Alert 提醒](/components/alert) — 任务结束后的结果反馈
