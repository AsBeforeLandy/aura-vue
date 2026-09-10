import type { PropType, VNodeChild } from 'vue';

/**
 * 表格列配置。
 *
 * 设计取舍：**不做「万能 render」**，只收敛 B 端列表页最高频的列形态。
 * 需要完全自定义时用 `cellRender` 逃生舱，而不是让配置对象膨胀成一个小框架。
 */
export interface ProTableColumn<T = Record<string, unknown>> {
  /** 字段名（同时作为默认的展示取值路径） */
  key: string;
  /** 列标题 */
  title: string;
  /** 列宽（数字按 px 处理） */
  width?: number | string;
  /** 最小列宽，配合自适应宽度使用 */
  minWidth?: number | string;
  /** 固定列方向 */
  fixed?: 'left' | 'right';
  /** 是否可排序 */
  sortable?: boolean;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否开启省略（超出显示 tooltip） */
  ellipsis?: boolean;
  /** 列的展示形态，内置几种常见类型，避免每列都写渲染函数 */
  valueType?: 'text' | 'tag' | 'date' | 'datetime' | 'money' | 'index';
  /**
   * tag 类型的取值到颜色的映射。
   * 例：`{ success: { text: '已通过', color: 'success' } }`
   */
  valueEnum?: Record<
    string,
    { text: string; color?: 'success' | 'warning' | 'danger' | 'info' | 'primary' }
  >;
  /** 日期格式化模板，用于 date / datetime（默认 YYYY-MM-DD / YYYY-MM-DD HH:mm:ss） */
  dateFormat?: string;
  /** 是否在表格中隐藏该列（仍可作为查询项/列设置出现） */
  hideInTable?: boolean;
  /** 该列是否出现在查询表单中 */
  hideInSearch?: boolean;
  /** 自定义单元格渲染（逃生舱，优先级高于 valueType） */
  cellRender?: (params: { row: T; value: unknown; index: number }) => VNodeChild;
  /** 表头提示文案 */
  tip?: string;

  // ---------- 以下为查询区专用配置 ----------
  /** 该列在查询区使用的控件类型（与展示用的 valueType 解耦） */
  searchType?: ProTableSearchValueType;
  /** 查询控件的选项，缺省时回退到 valueEnum 推导 */
  searchOptions?: Array<{ label: string; value: string | number }>;
  /** 查询控件占位提示，缺省按 searchType 自动生成 */
  searchPlaceholder?: string;
  /** 查询项独占一行（等价于整行宽度） */
  searchFullWidth?: boolean;
}

/** 查询控件的类型（与展示类型是两套语义，不可混用） */
export type ProTableSearchValueType = 'text' | 'select' | 'date' | 'dateRange' | 'number';

/** 查询项配置：在列配置基础上，指定用哪种控件渲染 */
export interface ProTableSearchItem {
  /** 字段名，需与 columns 中的 key 对应（也可独立存在） */
  key: string;
  /** 标签文案，缺省时取同 key 的列标题 */
  label?: string;
  /** 查询控件类型 */
  valueType?: ProTableSearchValueType;
  /** select 的选项 */
  options?: Array<{ label: string; value: string | number }>;
  /** 控件占位提示 */
  placeholder?: string;
  /** 自定义渲染查询控件（逃生舱） */
  render?: (model: Record<string, unknown>) => VNodeChild;
}

/** 分页配置（对齐后端常见字段命名） */
export interface ProTablePagination {
  /** 当前页，从 1 开始 */
  current?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 总条数 */
  total?: number;
  /** 每页条数可选项 */
  pageSizes?: number[];
}

/** request 函数的入参 */
export interface ProTableRequestParams {
  /** 当前页 */
  current: number;
  /** 每页条数 */
  pageSize: number;
  /** 查询表单的当前值（已排除空值） */
  search: Record<string, unknown>;
  /** 排序信息，未排序时为 undefined */
  sort?: { field: string; order: 'asc' | 'desc' };
}

/** request 函数的返回结构 */
export interface ProTableRequestResult<T = Record<string, unknown>> {
  /** 当前页数据 */
  data: T[];
  /** 总条数 */
  total: number;
  /**
   * 请求是否成功。默认 true。
   * 返回 false 时组件保留原数据并解锁 loading，用于业务侧静默兜底。
   */
  success?: boolean;
}

/** request 函数类型 */
export type ProTableRequest<T = Record<string, unknown>> = (
  params: ProTableRequestParams
) => Promise<ProTableRequestResult<T>>;

/** 工具条列设置项 */
export interface ProTableToolbarConfig {
  /** 是否显示刷新按钮 */
  reload?: boolean;
  /** 是否显示密度切换 */
  density?: boolean;
  /** 是否显示列设置 */
  columnSetting?: boolean;
}

/** Element Plus 表格支持的尺寸 */
export type ProTableSize = 'large' | 'default' | 'small';

export type ProTableProps<T = Record<string, unknown>> = {
  /** 列配置 */
  columns: ProTableColumn<T>[];
  /**
   * 数据请求函数。传入后组件接管分页/查询/刷新时序。
   * 不传则使用 `data` 受控数据，适合本地数据或已在外层完成请求的场景。
   */
  request?: ProTableRequest<T>;
  /** 受控数据（request 缺省时生效） */
  data?: T[];
  /** 行唯一键，用于行选择与 key 绑定 */
  rowKey?: string;
  /** 查询表单是否显示 */
  search?: boolean;
  /** 查询区是否默认展开（超出 3 项时折叠） */
  searchDefaultCollapsed?: boolean;
  /** 查询区一行显示几项 */
  searchSpan?: number;
  /** 分页配置 */
  pagination?: ProTablePagination | false;
  /** 工具条配置 */
  toolbar?: ProTableToolbarConfig;
  /** 表格密度 */
  size?: ProTableSize;
  /** 是否显示行选择列 */
  rowSelection?: boolean;
  /** 是否斑马纹 */
  stripe?: boolean;
  /** 是否显示边框 */
  border?: boolean;
  /** 空数据文案 */
  emptyText?: string;
  /** 标题（可选，工具条左侧） */
  title?: string;
  /** 请求前是否清空当前数据（false 时刷新保留旧数据，减少闪烁） */
  clearOnReload?: boolean;
};

export type ProTableEmits<T = Record<string, unknown>> = {
  /** 行选择变化 */
  (e: 'selection-change', rows: T[]): void;
  /** 分页变化 */
  (e: 'page-change', payload: { current: number; pageSize: number }): void;
  /** 查询条件变化（点击查询或重置后） */
  (e: 'search', values: Record<string, unknown>): void;
  /** 数据加载完成 */
  (e: 'loaded', payload: { data: T[]; total: number }): void;
  /** 加载失败 */
  (e: 'error', error: unknown): void;
};

/** 组件对外暴露的实例方法 */
export interface ProTableInstance {
  /** 重新加载当前页 */
  reload: () => Promise<void>;
  /** 回到第一页并重新加载（通常用于查询） */
  reloadAndReset: () => Promise<void>;
  /** 清空行选择 */
  clearSelection: () => void;
  /** 获取当前查询表单值 */
  getSearchValues: () => Record<string, unknown>;
  /** 设置查询表单值（不触发请求） */
  setSearchValues: (values: Record<string, unknown>) => void;
  /** 获取当前表格数据 */
  getData: () => Record<string, unknown>[];
  /** 获取当前选中的行 */
  getSelectedRows: () => Record<string, unknown>[];
  /** 设置用户的列显示偏好（用于持久化恢复） */
  setHiddenColumns: (keys: string[]) => void;
}

/** 内部使用：统一的 props 定义，便于 defineProps 复用与类型推导 */
export const proTableProps = {
  columns: { type: Array as PropType<ProTableColumn[]>, required: true },
  request: { type: Function as PropType<ProTableRequest>, default: undefined },
  data: { type: Array as PropType<Record<string, unknown>[]>, default: undefined },
  rowKey: { type: String, default: 'id' },
  search: { type: Boolean, default: true },
  searchDefaultCollapsed: { type: Boolean, default: true },
  searchSpan: { type: Number, default: 3 },
  pagination: {
    type: [Object, Boolean] as PropType<ProTablePagination | false>,
    default: () => ({ current: 1, pageSize: 10 })
  },
  toolbar: {
    type: Object as PropType<ProTableToolbarConfig>,
    default: () => ({ reload: true, density: true, columnSetting: true })
  },
  size: { type: String as PropType<ProTableSize>, default: 'default' },
  rowSelection: { type: Boolean, default: false },
  stripe: { type: Boolean, default: false },
  border: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无数据' },
  title: { type: String, default: '' },
  clearOnReload: { type: Boolean, default: false }
} as const;
