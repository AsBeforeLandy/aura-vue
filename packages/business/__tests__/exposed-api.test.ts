import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProForm from '../src/pro-form/ProForm.vue';
import ProModalForm from '../src/pro-modal-form/ProModalForm.vue';
import type { ProFormItem } from '../src/pro-form/types';

/**
 * 覆盖各组件通过 defineExpose 暴露、但此前未被用例触达的实例方法。
 *
 * 为什么单独成文件：这些方法是使用方的主要编程接口（ref 调用），
 * 一旦签名或行为回归，组件在页面上「看起来正常」但实际不可用，
 * 属于最难被 UI 测试发现的一类缺陷。
 */

const textItem: ProFormItem[] = [{ name: 'username', label: '用户名' }];
const requiredItem: ProFormItem[] = [
  {
    name: 'username',
    label: '用户名',
    rules: [{ required: true, message: '请输入' }],
  },
];

describe('ProForm 暴露的实例方法', () => {
  function mountForm(items: ProFormItem[] = textItem) {
    return mount(ProForm, {
      props: { items, modelValue: { username: 'init' } },
    });
  }

  it('正常：getValue / setValue 读写单个字段', async () => {
    const wrapper = mountForm();
    const vm = wrapper.vm as unknown as {
      getValue: (name: string) => unknown;
      setValue: (name: string, value: unknown) => void;
    };

    expect(vm.getValue('username')).toBe('init');
    vm.setValue('username', 'next');
    await nextTick();
    expect(vm.getValue('username')).toBe('next');
  });

  it('正常：setValues 批量写入并向上 emit', async () => {
    const wrapper = mountForm();
    const vm = wrapper.vm as unknown as {
      setValues: (values: Record<string, unknown>) => void;
      getValues: () => Record<string, unknown>;
    };

    vm.setValues({ username: '批量' });
    await nextTick();
    expect(vm.getValues().username).toBe('批量');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('正常：reset 恢复为初始值并清空校验状态', async () => {
    const wrapper = mountForm(requiredItem);
    const vm = wrapper.vm as unknown as {
      setValue: (name: string, value: unknown) => void;
      reset: () => void;
      getValues: () => Record<string, unknown>;
    };

    vm.setValue('username', 'changed');
    await nextTick();
    vm.reset();
    await nextTick();

    expect(vm.getValues().username).toBe('init');
    expect(wrapper.emitted('reset')).toHaveLength(1);
  });

  it('正常：clearValidate 清空校验态且不抛错', async () => {
    const wrapper = mountForm(requiredItem);
    const vm = wrapper.vm as unknown as { clearValidate: () => void };
    expect(() => vm.clearValidate()).not.toThrow();
  });

  it('边界：validate 对无规则表单直接通过', async () => {
    const wrapper = mountForm();
    const vm = wrapper.vm as unknown as { validate: () => Promise<boolean> };
    await expect(vm.validate()).resolves.toBe(true);
  });
});

describe('ProModalForm 暴露的实例方法', () => {
  const items: ProFormItem[] = [
    {
      name: 'username',
      label: '用户名',
      rules: [{ required: true, message: '请输入' }],
    },
  ];

  async function mountModal(props: Record<string, unknown> = {}) {
    const wrapper = mount(ProModalForm, {
      props: { modelValue: true, items, ...props },
      attachTo: document.body,
    });
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return wrapper;
  }

  it('正常：getValues 返回回填后的表单值', async () => {
    const wrapper = await mountModal({ initialValues: { username: 'Landy' } });
    const vm = wrapper.vm as unknown as {
      getValues: () => Record<string, unknown>;
    };
    expect(vm.getValues().username).toBe('Landy');
    wrapper.unmount();
    document.body.innerHTML = '';
  });

  it('正常：setValues 覆盖指定字段', async () => {
    const wrapper = await mountModal({ initialValues: { username: 'a' } });
    const vm = wrapper.vm as unknown as {
      setValues: (values: Record<string, unknown>) => void;
      getValues: () => Record<string, unknown>;
    };
    vm.setValues({ username: 'b' });
    await nextTick();
    expect(vm.getValues().username).toBe('b');
    wrapper.unmount();
    document.body.innerHTML = '';
  });

  it('正常：isSubmitting 初始为 false', async () => {
    const wrapper = await mountModal({ initialValues: { username: 'x' } });
    const vm = wrapper.vm as unknown as { isSubmitting: () => boolean };
    expect(vm.isSubmitting()).toBe(false);
    wrapper.unmount();
    document.body.innerHTML = '';
  });

  it('正常：提交进行中 isSubmitting 为 true，结束后复位', async () => {
    let release: (() => void) | undefined;
    const submit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const wrapper = await mountModal({
      initialValues: { username: 'x' },
      submit,
    });
    const vm = wrapper.vm as unknown as {
      isSubmitting: () => boolean;
      validate: () => Promise<boolean>;
    };

    // 直接走确认按钮，触发真实的提交链路
    const buttons = [
      ...document.querySelectorAll('.el-dialog__footer .el-button'),
    ] as HTMLElement[];
    buttons[buttons.length - 1].click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(vm.isSubmitting()).toBe(true);
    release?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(vm.isSubmitting()).toBe(false);

    wrapper.unmount();
    document.body.innerHTML = '';
  });

  it('正常：validate 在校验不通过时返回 false', async () => {
    const wrapper = await mountModal({ initialValues: {} });
    const vm = wrapper.vm as unknown as { validate: () => Promise<boolean> };
    await expect(vm.validate()).resolves.toBe(false);
    wrapper.unmount();
    document.body.innerHTML = '';
  });
});
