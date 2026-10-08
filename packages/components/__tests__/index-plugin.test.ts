import { describe, expect, it } from 'vitest';
import { createApp } from 'vue';
import AuraComponents, {
  AuraComponents as NamedPlugin,
  components,
} from '../src/index';

/**
 * 全量注册插件的契约。
 *
 * 与 @aura/business 的 AuraBusiness 对齐：两个包都应提供
 * 「具名 components 清单 + 默认导出 install 插件」，
 * 这样使用方的消费方式在包之间保持一致。
 */
describe('components 清单', () => {
  it('正常：覆盖全部基础组件', () => {
    expect(Object.keys(components).sort()).toEqual([
      'Alert',
      'Button',
      'Divider',
      'Empty',
      'Form',
      'FormItem',
      'Input',
      'Modal',
      'Popover',
      'Progress',
      'Segmented',
      'Select',
      'Skeleton',
      'Space',
      'Spin',
      'Steps',
      'Switch',
      'Tag',
      'Tooltip',
      'Typography',
    ]);
  });
});

describe('AuraComponents 插件', () => {
  it('正常：install 把组件按清单名注册为全局组件', () => {
    const app = createApp({ render: () => null });
    app.use(AuraComponents);

    for (const [name, component] of Object.entries(components)) {
      expect(app.component(name)).toBe(component);
    }
  });

  it('正常：默认导出与具名导出指向同一插件对象', () => {
    expect(AuraComponents).toBe(NamedPlugin);
  });

  it('边界：插件只暴露 install', () => {
    expect(typeof AuraComponents.install).toBe('function');
    expect(Object.keys(AuraComponents)).toEqual(['install']);
  });
});
