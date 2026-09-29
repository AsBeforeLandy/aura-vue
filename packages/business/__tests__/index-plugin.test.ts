import { describe, expect, it } from 'vitest';
import { createApp } from 'vue';
import AuraBusiness, {
  AuraBusiness as NamedPlugin,
  businessComponents,
  Description,
  PageContainer,
  ProForm,
  ProModalForm,
  ProTable,
} from '../src/index';

describe('businessComponents 清单', () => {
  it('正常：覆盖全部五个业务组件', () => {
    expect(Object.keys(businessComponents).sort()).toEqual([
      'Description',
      'PageContainer',
      'ProForm',
      'ProModalForm',
      'ProTable',
    ]);
  });

  it('正常：清单中的组件与各模块导出的是同一实例', () => {
    expect(businessComponents.ProTable).toBe(ProTable);
    expect(businessComponents.ProForm).toBe(ProForm);
    expect(businessComponents.ProModalForm).toBe(ProModalForm);
    expect(businessComponents.Description).toBe(Description);
    expect(businessComponents.PageContainer).toBe(PageContainer);
  });
});

describe('AuraBusiness 插件', () => {
  it('正常：install 把组件按清单名注册为全局组件', () => {
    const app = createApp({ render: () => null });
    app.use(AuraBusiness);

    for (const [name, component] of Object.entries(businessComponents)) {
      expect(app.component(name)).toBe(component);
    }
  });

  it('正常：默认导出与具名导出指向同一插件对象', () => {
    expect(AuraBusiness).toBe(NamedPlugin);
  });

  it('边界：插件只暴露 install，注册过程不产生副作用', () => {
    expect(typeof AuraBusiness.install).toBe('function');
    expect(Object.keys(AuraBusiness)).toEqual(['install']);

    const app = createApp({ render: () => null });
    expect(() => app.use(AuraBusiness)).not.toThrow();
  });
});
