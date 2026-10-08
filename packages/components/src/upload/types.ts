import type { ExtractPropTypes, PropType } from 'vue';

/** 文件条目的状态 */
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'danger';

/** 文件条目（fileList 的元素） */
export interface UploadItem {
  /** 唯一标识（组件生成，作为列表 key） */
  uid: string;
  /** 文件名 */
  name: string;
  /** 字节大小 */
  size?: number;
  status: UploadStatus;
  /** 上传进度 0~100（uploading 时有意义） */
  percent?: number;
  /** 原始 File 对象 */
  raw?: File;
  /** 服务端返回（success 时有意义） */
  response?: unknown;
}

/**
 * 自定义上传（逃生舱）：拿到文件与三个进度回调，
 * 自己决定怎么传（fetch / XHR / 模拟）。给了它就忽略 action。
 */
export type UploadRequest = (options: {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: (response?: unknown) => void;
  onError: (error?: unknown) => void;
}) => void;

export const uploadProps = {
  /** 受控文件列表（传入即视为受控模式，配合 v-model:fileList） */
  fileList: {
    type: Array as PropType<UploadItem[]>,
    default: undefined,
  },
  /** 非受控模式初始列表 */
  defaultFileList: {
    type: Array as PropType<UploadItem[]>,
    default: undefined,
  },
  /** 接受的文件类型（透传原生 accept，如 "image/*,.pdf"） */
  accept: {
    type: String,
    default: undefined,
  },
  /** 是否支持一次选择多个文件 */
  multiple: {
    type: Boolean,
    default: false,
  },
  /** 选择后是否立即上传；false 时只进列表（status=ready） */
  autoUpload: {
    type: Boolean,
    default: true,
  },
  /** 上传地址；与 customRequest 二选一 */
  action: {
    type: String,
    default: undefined,
  },
  /** 自定义上传（逃生舱），给了它就忽略 action */
  customRequest: {
    type: Function as PropType<UploadRequest>,
    default: undefined,
  },
  /**
   * 上传前校验：返回 false 阻止该文件进列表；支持 Promise<boolean>。
   * 类型过滤用 accept，业务级校验（大小、张数）用这里。
   */
  beforeUpload: {
    type: Function as PropType<(file: File) => boolean | Promise<boolean>>,
    default: undefined,
  },
  /** 拖拽模式：整块虚线区域可拖入文件 */
  drag: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
} as const;

export type UploadProps = ExtractPropTypes<typeof uploadProps>;

export type UploadEmits = {
  (e: 'update:fileList', value: UploadItem[]): void;
  (e: 'change', value: UploadItem[]): void;
  (e: 'remove', item: UploadItem): void;
  (e: 'success', item: UploadItem, response: unknown): void;
  (e: 'error', item: UploadItem, error: unknown): void;
};
