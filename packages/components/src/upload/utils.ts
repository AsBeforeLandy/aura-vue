import type { UploadRequest } from './types';

/** 基于 XMLHttpRequest 的默认上传实现（进度回调走 upload.onprogress） */
export function xhrRequest(action: string): UploadRequest {
  return ({ file, onProgress, onSuccess, onError }) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);

    xhr.open('POST', action);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onSuccess(JSON.parse(xhr.responseText));
        } catch {
          onSuccess(xhr.responseText);
        }
      } else {
        onError(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => onError(new Error('网络错误'));
    xhr.send(form);
  };
}

let uidSeed = 0;

/** 生成条目 uid（组件内自增，保证同批多文件不撞 key） */
export function nextUid(): string {
  uidSeed += 1;
  return `aura-upload-${uidSeed}`;
}

/** 字节大小的人类可读格式（超过 1MB 用 MB，保留一位小数） */
export function formatSize(bytes?: number): string {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
