/**
 * 语义色图标的形状数据（Alert / Message 共用）。
 *
 * 图标一律 24×24、stroke=currentColor、fill=none 的内联 SVG：
 * warning 用三角底形区分于其余三类的圆底，中间的「标记路径」按类型区分。
 * 数据收在这里是为了避免两处各写一份后悄悄走样。
 */

/** 底形：除 warning 外都是圆底 */
export type SemanticIconShape = 'circle' | 'triangle';

/** 各类型的标记路径（叠加在底形之上） */
export const SEMANTIC_ICON_MARKS: Record<string, string> = {
  info: 'M12 8h.01M12 11v5',
  success: 'm8.5 12.5 2.5 2.5 5-5.5',
  warning: 'M12 9.5v4M12 16.5h.01',
  danger: 'm9.5 9.5 5 5M14.5 9.5l-5 5',
};

/** 各类型的底形 */
export const SEMANTIC_ICON_SHAPES: Record<string, SemanticIconShape> = {
  info: 'circle',
  success: 'circle',
  warning: 'triangle',
  danger: 'circle',
};

/** 安全取标记路径；未知类型回落为 info，调用方不需要再兜底 */
export function semanticIconMark(type: string): string {
  return SEMANTIC_ICON_MARKS[type] ?? SEMANTIC_ICON_MARKS.info;
}

/** 安全取底形；未知类型回落为圆底 */
export function semanticIconShape(type: string): SemanticIconShape {
  return SEMANTIC_ICON_SHAPES[type] ?? 'circle';
}
