import type { ExtractPropTypes, PropType } from 'vue';

/** 面包屑节点；`to` 提供时渲染为链接 */
export interface BreadcrumbItem {
  /** 节点文案 */
  label: string;
  /** 跳转地址；提供时渲染为 <a>（当前页节点不渲染链接） */
  to?: string;
}

export const breadcrumbProps = {
  /** 面包屑节点；末项自动视为当前页 */
  items: {
    type: Array as PropType<BreadcrumbItem[]>,
    default: () => [],
  },
} as const;

export type BreadcrumbProps = ExtractPropTypes<typeof breadcrumbProps>;
