import type { App, Plugin } from 'vue';
import { ProTable } from './pro-table';
import { ProForm } from './pro-form';
import { ProModalForm } from './pro-modal-form';
import { Description } from './description';
import { PageContainer } from './page-container';
import { SearchForm } from './search-form';
import { CascaderPanel } from './cascader-panel';
import { WeekTimeRange } from './week-time-range';
import { YearCalendar } from './year-calendar';
import { PdfViewer } from './pdf-viewer';

export * from './pro-table';
export * from './pro-form';
export * from './pro-modal-form';
export * from './description';
export * from './page-container';
export * from './search-form';
export * from './cascader-panel';
export * from './week-time-range';
export * from './year-calendar';
export * from './pdf-viewer';

/** 业务组件清单，供全量注册与文档站枚举复用 */
export const businessComponents = {
  ProTable,
  ProForm,
  ProModalForm,
  Description,
  PageContainer,
  SearchForm,
  CascaderPanel,
  WeekTimeRange,
  YearCalendar,
  PdfViewer,
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
  },
};

export default AuraBusiness;
