import type { App, Plugin } from 'vue';
import { ProTable } from './pro-table';
import { ProForm } from './pro-form';
import { ProModalForm } from './pro-modal-form';
import { Description } from './description';
import { PageContainer } from './page-container';

export * from './pro-table';
export * from './pro-form';
export * from './pro-modal-form';
export * from './description';
export * from './page-container';

/** 业务组件清单，供全量注册与文档站枚举复用 */
export const businessComponents = {
  ProTable,
  ProForm,
  ProModalForm,
  Description,
  PageContainer
} as const;

/**
 * 全量注册插件：
 *   app.use(AuraBusiness)
 *
 * 注意：业务组件依赖 Element Plus，使用方需自行安装并在入口引入其样式，
 * 本包不重复打包 EP 的 CSS（避免样式重复加载与体积膨胀）。
 */
export const AuraBusiness: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(businessComponents)) {
      app.component(name, component);
    }
  }
};

export default AuraBusiness;
