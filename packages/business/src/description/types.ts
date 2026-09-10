import type { PropType, VNodeChild } from 'vue';

/** 描述项：详情页里"一行字段"的配置 */
export interface DescriptionItem {
  /** 字段名，同时作为取值路径（支持 'user.name' 形式） */
  key: string;
  /** 标签文案 */
  label: string;
  /** 占据的列数（在 columns 划分的栅格里），缺省占 1 列 */
  span?: number;
  /** 展示形态，与 ProTable 的 valueType 语义保持一致，降低记忆成本 */
  valueType?: 'text' | 'tag' | 'date' | 'datetime' | 'money';
  /** tag 类型的值到颜色/文案的映射 */
  valueEnum?: Record<
    string,
    { text: string; color?: 'success' | 'warning' | 'danger' | 'info' | 'primary' }
  >;
  /** 日期格式化模板 */
  dateFormat?: string;
  /** 空值占位文案 */
  emptyText?: string;
  /** 是否在描述列表中隐藏 */
  hidden?: boolean;
  /** 自定义渲染（逃生舱），优先级最高 */
  render?: (params: { value: unknown; item: DescriptionItem }) => VNodeChild;
}

/** 分组：把描述项按业务语义分块，块之间加分隔标题 */
export interface DescriptionGroup {
  /** 分组标题 */
  title?: string;
  /** 分组内的描述项 */
  items: DescriptionItem[];
}

export type DescriptionDirection = 'horizontal' | 'vertical';

export type DescriptionProps = {
  /** 描述项（与 groups 二选一） */
  items?: DescriptionItem[];
  /** 分组描述项（与 items 二选一） */
  groups?: DescriptionGroup[];
  /** 数据源 */
  data?: Record<string, unknown>;
  /** 每行几列 */
  columns?: number;
  /** 标签与值的排列方向 */
  direction?: DescriptionDirection;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 标签宽度（label 列固定宽度） */
  labelWidth?: number | string;
  /** 全局空值占位 */
  emptyText?: string;
  /** 标题（可选，显示在列表上方） */
  title?: string;
  /** 尺寸 */
  size?: 'large' | 'default' | 'small';
};

export const descriptionProps = {
  items: { type: Array as PropType<DescriptionItem[]>, default: undefined },
  groups: { type: Array as PropType<DescriptionGroup[]>, default: undefined },
  data: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  },
  columns: { type: Number, default: 2 },
  direction: { type: String as PropType<DescriptionDirection>, default: 'horizontal' },
  bordered: { type: Boolean, default: false },
  labelWidth: { type: [Number, String] as PropType<number | string>, default: 110 },
  emptyText: { type: String, default: '-' },
  title: { type: String, default: '' },
  size: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' }
} as const;

export const descriptionEmits = {} as const;
