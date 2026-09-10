import type { PropType, VNodeChild } from 'vue';

/** 面包屑项 */
export interface PageBreadcrumb {
  /** 展示文案 */
  text: string;
  /** 跳转链接，缺省时该项不可点击（通常用于"当前位置"） */
  link?: string;
}

export type PageContainerProps = {
  /** 页面标题 */
  title?: string;
  /** 副标题 / 页面说明 */
  subTitle?: string;
  /** 面包屑 */
  breadcrumbs?: PageBreadcrumb[];
  /** 是否显示返回按钮 */
  back?: boolean;
  /** 返回按钮点击后的跳转地址，缺省时 emit back 事件交由外部处理 */
  backLink?: string;
  /** 内容区是否包卡片（false 时内容直接平铺） */
  card?: boolean;
  /** 内容区 loading */
  loading?: boolean;
  /** 底部操作栏是否固定吸底 */
  fixedFooter?: boolean;
  /** 页面左右内边距 */
  padding?: number | string;
  /** 是否显示分隔线（标题区与内容区之间） */
  divider?: boolean;
};

export type PageContainerEmits = {
  (e: 'back'): void;
};

export const pageContainerProps = {
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  breadcrumbs: { type: Array as PropType<PageBreadcrumb[]>, default: undefined },
  back: { type: Boolean, default: false },
  backLink: { type: String, default: '' },
  card: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  fixedFooter: { type: Boolean, default: false },
  padding: { type: [Number, String] as PropType<number | string>, default: 16 },
  divider: { type: Boolean, default: true }
} as const;

/** 供插槽类型推导使用 */
export interface PageContainerSlots {
  /** 标题右侧的内容（常用放操作按钮） */
  extra?: () => VNodeChild;
  /** 页面正文 */
  default?: () => VNodeChild;
  /** 底部操作栏 */
  footer?: () => VNodeChild;
}
