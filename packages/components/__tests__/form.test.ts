import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive } from 'vue';
import { Form, FormItem } from '../src/form';
import { Input } from '../src/input';
import type { Rule } from '../src/form/validator';

/** 挂载一个包含两个 FormItem 的 Form（外层包一层匿名父组件，便于 findComponent 定位） */
function mountForm(model: Record<string, unknown>, rules?: Rule[]) {
  return mount(
    defineComponent({
      setup() {
        return () =>
          h(Form, { model }, {
            default: () => [
              h(
                FormItem,
                { label: '姓名', prop: 'name', rules },
                () =>
                  h(Input, {
                    placeholder: '请输入姓名',
                    'onUpdate:modelValue': (v: string) => {
                      model.name = v;
                    }
                  })
              ),
              h(FormItem, { label: '年龄', prop: 'age' })
            ]
          });
      }
    })
  );
}

function validateOf(wrapper: ReturnType<typeof mount>) {
  return (wrapper.findComponent(Form).vm as unknown as {
    validate: () => Promise<{ valid: boolean; errors: Record<string, string> }>;
  }).validate.bind(wrapper.findComponent(Form).vm);
}

describe('Form/FormItem - 正常场景', () => {
  it('渲染 label 与控件，校验通过返回 valid', async () => {
    const model = reactive({ name: 'Landy', age: 30 });
    const wrapper = mountForm(model, [{ required: true, message: '请输入姓名' }]);

    expect(wrapper.text()).toContain('姓名');
    expect(wrapper.text()).toContain('年龄');

    const res = await validateOf(wrapper)();
    expect(res.valid).toBe(true);
    expect(wrapper.find('.aura-form-item-error').exists()).toBe(false);
  });

  it('输入值同步到 model 后校验通过', async () => {
    const model = reactive({ name: '', age: 1 });
    const wrapper = mountForm(model, [{ required: true, message: '请输入姓名' }]);

    await wrapper.find('input').setValue('Landy');

    const res = await validateOf(wrapper)();
    expect(res.valid).toBe(true);
  });
});

describe('Form/FormItem - 边界场景', () => {
  it('必填项为空时校验失败并展示错误信息', async () => {
    const model = reactive({ name: '', age: 1 });
    const wrapper = mountForm(model, [{ required: true, message: '请输入姓名' }]);

    const res = await validateOf(wrapper)();

    expect(res.valid).toBe(false);
    expect(res.errors.name).toBe('请输入姓名');

    await nextTick();
    expect(wrapper.find('.aura-form-item-error').text()).toBe('请输入姓名');
  });

  it('min / max 长度规则生效', async () => {
    const model = reactive({ name: 'a', age: 1 });
    const wrapper = mountForm(model, [{ min: 2, max: 4, message: '长度需在 2-4 之间' }]);

    const res = await validateOf(wrapper)();

    expect(res.valid).toBe(false);
    expect(res.errors.name).toBe('长度需在 2-4 之间');
  });

  it('自定义异步校验器生效', async () => {
    const model = reactive({ name: 'bad', age: 1 });
    const wrapper = mountForm(model, [
      {
        validator: async (v) => {
          await Promise.resolve();
          return v === 'ok';
        },
        message: '异步校验未通过'
      }
    ]);

    const res = await validateOf(wrapper)();

    expect(res.valid).toBe(false);
    expect(res.errors.name).toBe('异步校验未通过');
  });

  it('blur 触发的规则不参与 change 校验', async () => {
    const model = reactive({ name: '', age: 1 });
    const wrapper = mountForm(model, [
      { required: true, trigger: 'blur', message: 'blur 校验' }
    ]);

    const item = wrapper.findComponent(FormItem) as unknown as {
      vm: { validate: (t: string) => Promise<string | null> };
    };

    expect(await item.vm.validate('change')).toBeNull();
    expect(await item.vm.validate('blur')).toBe('blur 校验');
  });

  it('resetValidation 清空错误状态', async () => {
    const model = reactive({ name: '', age: 1 });
    const wrapper = mountForm(model, [{ required: true, message: '请输入姓名' }]);

    const formVm = wrapper.findComponent(Form).vm as unknown as {
      validate: () => Promise<unknown>;
      resetValidation: () => void;
    };
    await formVm.validate();
    await nextTick();
    expect(wrapper.find('.aura-form-item-error').exists()).toBe(true);

    formVm.resetValidation();
    await nextTick();
    expect(wrapper.find('.aura-form-item-error').exists()).toBe(false);
  });
});

describe('Form/FormItem - 异常场景', () => {
  it('FormItem 无规则时校验直接通过', async () => {
    const model = reactive({ name: '', age: 1 });
    const wrapper = mountForm(model);

    const res = await validateOf(wrapper)();
    expect(res.valid).toBe(true);
  });

  it('FormItem 脱离 Form 使用时不崩溃，validate 返回 null', async () => {
    const wrapper = mount(FormItem, {
      props: { prop: 'x', rules: [{ required: true }] }
    });

    const item = wrapper.vm as unknown as { validate: (t: string) => Promise<string | null> };
    expect(await item.validate('submit')).toBeNull();
  });

  it('prop 与 model 字段对不上时不抛错', async () => {
    const model = reactive({ name: '' });
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Form, { model }, {
              default: () => h(FormItem, { prop: 'notExist', rules: [{ required: true }] })
            });
        }
      })
    );

    const res = await validateOf(wrapper)();
    expect(res.valid).toBe(false);
    expect(res.errors.notExist).toBe('该项为必填项');
  });
});
