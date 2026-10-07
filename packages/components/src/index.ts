import type { App, Plugin } from 'vue';
import { Button } from './button';
import { Input } from './input';
import { Form, FormItem } from './form';
import { Switch } from './switch';
import { Select } from './select';
import { Modal } from './modal';
import { Divider } from './divider';
import { Space } from './space';
import { Tag } from './tag';
import { Typography } from './typography';
import { Alert } from './alert';
import { Spin } from './spin';
import { Empty } from './empty';
import { Tooltip } from './tooltip';
import { Progress } from './progress';
import { Popover } from './popover';

// 注意：Message 是命令式 API（函数调用），不是组件，
// 不进 components 全量注册清单，仅通过下方 export * 对外提供。

export * from './button';
export * from './input';
export * from './form';
export * from './switch';
export * from './select';
export * from './modal';
export * from './divider';
export * from './space';
export * from './tag';
export * from './typography';
export * from './alert';
export * from './spin';
export * from './empty';
export * from './tooltip';
export * from './progress';
export * from './popover';
export * from './message';
export * from './composables/use-controllable';

/** 组件清单，供全量注册与文档站枚举复用 */
export const components = {
  Button,
  Input,
  Form,
  FormItem,
  Switch,
  Select,
  Modal,
  Divider,
  Space,
  Tag,
  Typography,
  Alert,
  Spin,
  Empty,
  Tooltip,
  Progress,
  Popover,
} as const;

/**
 * 全量注册插件：
 *   app.use(AuraComponents)
 *
 * 与 @aura/business 的 AuraBusiness 保持同一套约定：
 * 具名导出 `xxxComponents` 清单 + 默认导出的 install 插件，
 * 让两个包对使用方呈现一致的消费方式。
 */
export const AuraComponents: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component);
    }
  },
};

export default AuraComponents;
