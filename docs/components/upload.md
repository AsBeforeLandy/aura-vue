# Upload 上传

选择 / 拖拽文件并上传，展示**文件清单与上传状态**。

## 何时使用

- 表单里的附件上传（头像、凭证、批量导入）
- 拖拽批量上传

## 何时不用

| 场景                     | 应该用                                 |
| ------------------------ | -------------------------------------- |
| 只是选个文件名不传服务器 | 原生 input（或 autoUpload=false 用法） |
| 粘贴截图类交互           | 暂未提供                               |
| 大文件夹批量上传         | 专门的传输组件                         |

> **核心判断**：Upload 管「选文件 → 校验 → 传出去 → 展示状态」的完整链路；只选不传的场景请关掉 `auto-upload`。

## 基础用法

<demo src="./demos/upload/basic.vue" />

## 上传方式（三选一）

| 方式                | 用法                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `action` 地址       | 内部走 XMLHttpRequest，带进度回调（最常见的表单提交场景）        |
| `customRequest`     | 逃生舱：拿到文件与进度回调，自己决定怎么传（fetch / SDK / 模拟） |
| `auto-upload=false` | 只进列表不上传，配合外部流程（如随表单一起提交）                 |

`before-upload` 做业务级校验（大小、张数），返回 `false` 或 `Promise<false>` 阻止文件进列表；**文件类型过滤交给原生 `accept`**，两者职责不同。

## 无障碍

文件输入裁剪式隐藏（`aria-hidden`），可访问触发点是「选择文件」按钮；删除按钮是原生 `<button>` 并带 `aria-label="删除"`。文件清单**没有 live region**——上传进度变化不会逐条播报，开始与结束状态请依赖页面其他反馈（如 Message）。

## 设计规范

| 项   | 规范                                                            |
| ---- | --------------------------------------------------------------- |
| 类型 | `accept` 必给（图片、pdf、office…），别让用户传完才发现格式不对 |
| 大小 | 超限在 `before-upload` 里拦，并给出明确的大小限制文案           |
| 状态 | 四态齐备：ready / uploading（百分比）/ success / danger         |
| 清单 | 文件名超长省略号截断；失败行要给重试或删除出口                  |

## API

### Props

| 属性            | 说明                                   | 类型                                          | 默认值  |
| --------------- | -------------------------------------- | --------------------------------------------- | ------- |
| fileList        | 受控文件列表（配合 v-model:file-list） | `UploadItem[]`                                | -       |
| defaultFileList | 非受控初始列表                         | `UploadItem[]`                                | -       |
| accept          | 接受的文件类型（原生 accept）          | `string`                                      | -       |
| multiple        | 是否支持多选                           | `boolean`                                     | `false` |
| autoUpload      | 选择后是否立即上传                     | `boolean`                                     | `true`  |
| action          | 上传地址（与 customRequest 二选一）    | `string`                                      | -       |
| customRequest   | 自定义上传（逃生舱）                   | `(options: UploadRequest) => void`            | -       |
| beforeUpload    | 上传前校验，返回 false 阻止进列表      | `(file: File) => boolean \| Promise<boolean>` | -       |
| drag            | 拖拽模式                               | `boolean`                                     | `false` |
| disabled        | 是否禁用                               | `boolean`                                     | `false` |

### Events

| 事件             | 说明         | 回调参数                                |
| ---------------- | ------------ | --------------------------------------- |
| update:file-list | 列表变化     | `(value: UploadItem[])`                 |
| change           | 列表变化     | `(value: UploadItem[])`                 |
| remove           | 移除文件     | `(item: UploadItem)`                    |
| success          | 单个文件成功 | `(item: UploadItem, response: unknown)` |
| error            | 单个文件失败 | `(item: UploadItem, error: unknown)`    |

### Slots

| 插槽         | 说明                               |
| ------------ | ---------------------------------- |
| default      | 触发器（默认渲染「选择文件」按钮） |
| drag-content | 拖拽模式的提示内容                 |

### 类型导出

```ts
import type {
  UploadProps,
  UploadItem,
  UploadStatus,
  UploadRequest,
  UploadEmits,
} from '@aura/components';
```

### CSS 类名

| 类名                                                    | 说明           |
| ------------------------------------------------------- | -------------- |
| `.aura-upload-input`                                    | 隐藏的文件输入 |
| `.aura-upload-dropzone` / `--active`                    | 拖拽区         |
| `.aura-upload-list` / `-row` / `--success` / `--danger` | 文件清单       |
| `.aura-upload-name / -size / -status / -remove`         | 行内结构       |

## 已知限制

- 暂不支持粘贴上传、文件夹上传、失败自动重试

## 相关文档

- [Progress 进度条](/components/progress) — 进度展示的独立形态
- [Message 全局消息](/components/message) — 上传结果的即时反馈
