import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProModalForm from '../src/pro-modal-form/ProModalForm.vue';
import type { ProFormItem } from '../src/pro-form/types';

/**
 * ProModalForm 通过 ElDialog + Teleport 把内容渲染到 document.body。
 *
 * 这里必须跟踪并使用 unmount() 卸载组件，而不是简单地
 * `document.body.innerHTML = ''`：
 * 清空 DOM 只是抹掉了渲染产物，Vue 组件树与 Teleport 目标仍然存活，
 * 下一个用例挂载后会与上一个残留的弹窗同时存在于 body 中。
 * 此时 `document.querySelectorAll('.el-dialog__footer .el-button')`
 * 会同时命中「当前用例」和「残留用例」的按钮，
 * `.pop()` 取到的是残留弹窗里的按钮，点击它自然什么都不会发生——
 * 表现为 submit 从未被调用（纯测试隔离问题，非组件缺陷）。
 */
const mountedWrappers: VueWrapper[] = [];

afterEach(() => {
  while (mountedWrappers.length) {
    mountedWrappers.pop()?.unmount();
  }
  document.body.innerHTML = '';
});

const items: ProFormItem[] = [
  {
    name: 'username',
    label: '用户名',
    rules: [{ required: true, message: '请输入用户名' }]
  },
  { name: 'role', label: '角色', valueType: 'select', options: [{ label: '管理员', value: 'admin' }] }
];

/** 打开弹窗并等待 Teleport 内容挂载 */
async function mountOpen(props: Record<string, unknown> = {}) {
  const wrapper = mount(ProModalForm, {
    props: { modelValue: true, items, ...props },
    attachTo: document.body
  });
  mountedWrappers.push(wrapper);
  await nextTick();
  await new Promise((r) => setTimeout(r, 0));
  return wrapper;
}

/** 取当前弹窗底部按钮（取消 / 确定） */
function footerButtons(): HTMLElement[] {
  return [...document.querySelectorAll('.el-dialog__footer .el-button')] as HTMLElement[];
}

/** 点击底部最后一个按钮（即主按钮） */
function clickPrimaryButton() {
  const buttons = footerButtons();
  buttons[buttons.length - 1].click();
}

/**
 * 等待 handleOk 的异步链路走完。
 *
 * handleOk 是异步的：validate() → submit() → emit。校验要过 async-validator，
 * 再叠加一层 submit 的 Promise，因此需要一个宏任务把整条链路推到终点。
 *
 * ⚠️ 这里刻意**只等一次定时器，不插入 `await nextTick()`**。
 * Element Plus 的 FormItem.resetField() 内部是
 * `isResettingField = true → await nextTick() → clearValidate()`，
 * 测试里若额外 `await nextTick()`，会在同一个微任务检查点抢先推进，
 * 让组件侧的 `await nextTick()` 落到更后面的队列，校验窗口被拉长。
 * 交给一个真实的定时器回调，反而让组件自己的时序原样跑完。
 */
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('ProModalForm', () => {
  it('正常：按 mode 推导标题', async () => {
    await mountOpen({ mode: 'edit' });
    expect(document.body.textContent).toContain('编辑');
  });

  it('正常：显式 title 覆盖默认标题', async () => {
    await mountOpen({ mode: 'create', title: '新建用户' });
    expect(document.body.textContent).toContain('新建用户');
  });

  it('正常：initialValues 回填到表单', async () => {
    const wrapper = await mountOpen({
      mode: 'edit',
      initialValues: { username: 'Landy' }
    });
    const instance = wrapper.vm as unknown as {
      getValues: () => Record<string, unknown>;
    };
    expect(instance.getValues().username).toBe('Landy');
  });

  it('正常：submit 成功时 emit success 并关闭弹窗', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const wrapper = await mountOpen({
      initialValues: { username: 'ok' },
      submit,
      onSuccess
    });
    const instance = wrapper.vm as unknown as { getValues: () => Record<string, unknown> };
    expect(instance.getValues().username).toBe('ok');

    clickPrimaryButton();

    await settle();

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ username: 'ok' }));
    expect(onSuccess).toHaveBeenCalled();
    // 提交成功后应请求关闭弹窗
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('边界：view 模式下不渲染提交按钮', async () => {
    await mountOpen({ mode: 'view', initialValues: { username: 'x' } });
    const buttons = footerButtons();
    // 查看态只保留取消按钮
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('取消');
  });

  it('边界：view 模式下表单整体只读', async () => {
    await mountOpen({ mode: 'view', initialValues: { username: '只读值' } });
    expect(document.body.querySelector('.aura-pro-form-readonly')?.textContent).toBe('只读值');
  });

  it('边界：submit 抛错时保持弹窗打开并 emit error', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('服务端校验失败'));
    const onError = vi.fn();
    const wrapper = await mountOpen({ initialValues: { username: 'x' }, submit, onError });

    clickPrimaryButton();

    await settle();

    expect(onError).toHaveBeenCalled();
    // 失败后不应请求关闭弹窗
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('异常：必填校验未通过时不调用 submit', async () => {
    const submit = vi.fn();
    // username 为空，必填规则应拦截提交
    const wrapper = await mountOpen({ initialValues: {}, submit });

    clickPrimaryButton();
    await settle();

    expect(submit).not.toHaveBeenCalled();
    // 校验失败同样不应该关闭弹窗
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
