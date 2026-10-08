import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Upload } from '../src/upload';
import type { UploadRequest } from '../src/upload/types';
import { formatSize } from '../src/upload/utils';

function makeFile(name: string, size: number): File {
  // happy-dom 支持 File 构造器；size 由内容长度决定
  return new File(['x'.repeat(size)], name, { type: 'text/plain' });
}

function fakeFileList(files: File[]): FileList {
  // FileList 无法构造，伪造最小 array-like（组件只读 length 与可索引项）
  return {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    *[Symbol.iterator]() {
      yield* files;
    },
  } as unknown as FileList;
}

async function pickFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, 'files', {
    value: fakeFileList(files),
    configurable: true,
  });
  await input.trigger('change');
}

const mountUpload = (props = {}, slots = {}) => mount(Upload, { props, slots });

describe('Upload', () => {
  it('正常：渲染触发按钮与隐藏的文件输入', () => {
    const wrapper = mountUpload();

    expect(wrapper.find('button').text()).toContain('选择文件');
    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
    expect(input.classes()).toContain('aura-upload-input');
  });

  it('正常：autoUpload=false 时文件进列表且状态为 ready', async () => {
    const wrapper = mountUpload({ autoUpload: false });

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);

    expect(wrapper.emitted('change')).toHaveLength(1);
    const list = wrapper.emitted('update:fileList')?.[0][0] as {
      name: string;
      status: string;
    }[];
    expect(list).toHaveLength(1);
    expect(list[0]!.name).toBe('a.txt');
    expect(list[0]!.status).toBe('ready');
    expect(wrapper.text()).toContain('a.txt');
  });

  it('正常：customRequest 成功——状态流转 uploading → success，进度与响应透传', async () => {
    const wrapper = mountUpload({
      customRequest: ({
        onProgress,
        onSuccess,
      }: Parameters<UploadRequest>[0]) => {
        onProgress(40);
        onSuccess({ url: '/f/1' });
      },
    });

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);

    expect(wrapper.emitted('success')).toHaveLength(1);
    const [item, response] = wrapper.emitted('success')![0] as [
      { status: string; percent: number },
      unknown,
    ];
    expect(item.status).toBe('success');
    expect(item.percent).toBe(100);
    expect(response).toEqual({ url: '/f/1' });
    expect(wrapper.find('.aura-upload-row--success').exists()).toBe(true);
  });

  it('正常：customRequest 失败——状态置 danger 并派发 error', async () => {
    const wrapper = mountUpload({
      customRequest: ({ onError }: Parameters<UploadRequest>[0]) =>
        onError(new Error('boom')),
    });

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);

    expect(wrapper.emitted('error')).toHaveLength(1);
    expect(wrapper.find('.aura-upload-row--danger').exists()).toBe(true);
  });

  it('正常：进度回调更新列表里的 percent', async () => {
    const wrapper = mountUpload({
      customRequest: ({ onProgress }: Parameters<UploadRequest>[0]) => {
        onProgress(55);
      },
    });

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);

    const list = wrapper.emitted('update:fileList')!.at(-1)![0] as {
      status: string;
      percent: number;
    }[];
    expect(list[0]!.percent).toBe(55);
  });

  it('正常：beforeUpload 返回 false 阻止文件进列表', async () => {
    const wrapper = mountUpload({
      autoUpload: false,
      beforeUpload: (file: File) => file.size < 5,
    });

    await pickFiles(wrapper, [makeFile('big.txt', 100), makeFile('ok.txt', 1)]);

    const list = wrapper.emitted('update:fileList')!.at(-1)![0] as {
      name: string;
    }[];
    expect(list).toHaveLength(1);
    expect(list[0]!.name).toBe('ok.txt');
  });

  it('正常：remove 移除条目并派发 remove 事件', async () => {
    const wrapper = mountUpload({ autoUpload: false });

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);
    expect(wrapper.findAll('.aura-upload-row')).toHaveLength(1);

    await wrapper.find('.aura-upload-remove').trigger('click');

    expect(wrapper.emitted('remove')).toHaveLength(1);
    expect(
      (wrapper.emitted('update:fileList')!.at(-1)![0] as unknown[]).length,
    ).toBe(0);
    expect(wrapper.findAll('.aura-upload-row')).toHaveLength(0);
  });

  it('正常：受控模式——内部变更只 emit，不改外部传入的列表', async () => {
    const controlled = [
      { uid: 'x', name: '外部的.txt', status: 'ready' as const },
    ];
    const wrapper = mountUpload({ fileList: controlled, autoUpload: false });

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);

    expect(wrapper.emitted('update:fileList')).toHaveLength(1);
    // 外部列表对象未被篡改
    expect(controlled).toHaveLength(1);
  });

  it('正常：drag 模式渲染虚线拖放区，drop 进列表', async () => {
    const wrapper = mountUpload({ drag: true, autoUpload: false });

    expect(wrapper.find('.aura-upload-dropzone').exists()).toBe(true);

    await wrapper.trigger('drop', {
      dataTransfer: { files: [makeFile('dropped.txt', 10)] },
    });

    expect(wrapper.text()).toContain('dropped.txt');
  });

  it('异常：无 action 且无 customRequest 时停留在 ready（不视为错误）', async () => {
    const wrapper = mountUpload();

    await pickFiles(wrapper, [makeFile('a.txt', 10)]);

    const list = wrapper.emitted('update:fileList')!.at(-1)![0] as {
      status: string;
    }[];
    expect(list[0]!.status).toBe('ready');
    expect(wrapper.emitted('error')).toBeUndefined();
  });

  it('异常：disabled 时点击不打开选择器', async () => {
    const wrapper = mountUpload({ disabled: true });
    const input = wrapper.find('input[type="file"]');

    await wrapper.find('button').trigger('click');

    expect(input.attributes('disabled')).toBeDefined();
  });
});

describe('upload/utils', () => {
  it('formatSize：B / KB / MB 三档', () => {
    expect(formatSize(undefined)).toBe('');
    expect(formatSize(500)).toBe('500 B');
    expect(formatSize(2048)).toBe('2 KB');
    expect(formatSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
