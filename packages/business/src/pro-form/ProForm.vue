<template>
  <ElForm
    ref="formRef"
    :model="innerModel"
    :label-position="labelPosition"
    :label-width="resolvedLabelWidth"
    :disabled="disabled"
    :size="size"
    :class="prefixCls('pro-form')"
    @submit.prevent
  >
    <ElRow :gutter="gutter">
      <ElCol
        v-for="item in visibleItems"
        :key="item.name"
        :xs="24"
        :sm="item.fullWidth ? 24 : 24"
        :md="item.fullWidth ? 24 : item.span ?? 24 / columns"
      >
        <ElFormItem
          :label="item.label"
          :prop="item.name"
          :rules="normalizeRules(item.rules)"
        >
          <template v-if="item.tip" #label>
            <span>{{ item.label }}</span>
            <ElTooltip :content="item.tip" placement="top">
              <ElIcon :class="prefixCls('pro-form-tip')"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </template>

          <!-- 只读模式：统一降级为纯文本展示，避免误操作 -->
          <div v-if="isReadonly(item)" :class="prefixCls('pro-form-readonly')">
            {{ formatReadonly(item) }}
          </div>

          <!-- 逃生舱：完全自定义字段渲染 -->
          <component :is="renderCustom(item)" v-else-if="item.render" />

          <!-- slot 类型：由使用方提供具名插槽 -->
          <slot
            v-else-if="item.valueType === 'slot'"
            :name="item.name"
            :model="innerModel"
            :item="item"
          />

          <component
            :is="controlNode(item)"
            v-else
          />
        </ElFormItem>
        <div v-if="item.extra" :class="prefixCls('pro-form-extra')">{{ item.extra }}</div>
      </ElCol>
    </ElRow>

    <div v-if="showActions" :class="prefixCls('pro-form-actions')">
      <slot name="actions" :submit="handleSubmit" :reset="handleReset">
        <ElButton @click="handleReset">{{ resetText }}</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitText }}
        </ElButton>
      </slot>
    </div>
  </ElForm>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import {
  ElButton,
  ElCol,
  ElForm,
  ElFormItem,
  ElIcon,
  ElRow,
  ElTooltip
} from 'element-plus';
import { QuestionFilled } from '@element-plus/icons-vue';
import { prefixCls } from '@aura/shared';
import {
  proFormProps,
  type ProFormEmits,
  type ProFormInstance,
  type ProFormItem
} from './types';
import { normalizeRules, renderControl } from './render-control';
import './style/index.less';

defineOptions({ name: 'AProForm' });

const props = defineProps(proFormProps);
const emit = defineEmits<ProFormEmits>();

const formRef = ref();

/**
 * 表单数据双轨实现。
 *
 * 这里刻意让内部始终持有一份 `innerModel` 作为 ElForm 的 model 源：
 * Element Plus 的 FormItem 校验要求 model 是一个「响应式对象」且包含 prop 对应的键，
 * 直接把 props.modelValue 交给 ElForm 会有两个问题——
 *   1. props 对象不能被组件就地改写（补齐缺失键会破坏单向数据流）；
 *   2. 使用方若只传了部分字段，缺失的键不会触发校验（空值被当作"无需校验"跳过）。
 * 因此内部维护影子对象，对外仍通过 emit 同步，使用方感知不到差异。
 */
const innerModel = reactive<Record<string, unknown>>({});
const isControlled = computed(() => props.modelValue !== undefined);

/**
 * 受控模式下把外部值同步进影子对象。
 *
 * 注意：**不能删除 innerModel 中外部未提供的键**。
 * 那些键是 ensureKeys() 按 items 补齐的（值为 undefined），
 * Element Plus 的 FormItem 只有在 model 里能取到对应 prop 时才会执行校验，
 * 删掉它们会导致"必填字段留空却能提交"这类静默失效。
 * 外部显式传 null 表示"要覆盖成空"，与"未提供"是两回事。
 */
function syncFromProps() {
  if (!isControlled.value) return;
  Object.assign(innerModel, props.modelValue ?? {});
}

/** 补齐 items 中声明的键，确保每个字段都能被 ElForm 校验到 */
function ensureKeys() {
  for (const item of props.items) {
    if (!(item.name in innerModel)) {
      innerModel[item.name] = item.valueType === 'checkbox' ? [] : undefined;
    }
  }
}

const resolvedLabelWidth = computed(() =>
  typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
);

/** 过滤条件隐藏的字段 */
const visibleItems = computed(() =>
  props.items.filter((item) => {
    if (typeof item.hidden === 'function') return !item.hidden();
    return !item.hidden;
  })
);

function isReadonly(item: ProFormItem): boolean {
  return props.readonly && !item.readonly;
}

/** 只读态的值格式化：枚举转文案、空值给占位符、数组用顿号连接 */
function formatReadonly(item: ProFormItem): string {
  const value = innerModel[item.name];
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) {
    if (item.options?.length) {
      return value
        .map((v) => item.options!.find((o) => o.value === v)?.label ?? String(v))
        .join('、');
    }
    return value.join('、');
  }
  if (item.options?.length) {
    return item.options.find((o) => o.value === value)?.label ?? String(value);
  }
  if (item.valueType === 'switch') return value ? '是' : '否';
  return String(value);
}

/** 生成控件节点：包一层函数组件，把 props 变化变成响应式依赖 */
function controlNode(item: ProFormItem) {
  return () => {
    if (item.valueType === 'slot') return null;
    return renderControl(item, {
      value: innerModel[item.name],
      disabled: props.disabled || Boolean(item.disabled),
      onUpdate: (val: unknown) => handleChange(item.name, val)
    });
  };
}

function renderCustom(item: ProFormItem) {
  return () => item.render!({ model: { ...innerModel } });
}

/** 字段值变化：写回内部状态并向上同步 */
function handleChange(name: string, value: unknown) {
  innerModel[name] = value;
  const next = { ...innerModel };
  emit('update:modelValue', next);
  emit('change', { name, value, model: next });
}

/**
 * 触发校验，返回是否通过。
 *
 * 实现说明（依据 element-plus 2.14 的 form-item 源码：
 * `es/components/form/src/form-item.vue_vue_type_script_setup_true_lang.mjs`）：
 *
 *   1. **不用 `formRef.validate()` 的聚合结果**。在「弹窗 + 动态 items」场景下，
 *      EP 的聚合校验会因字段重注册时序而漏判（实测 fields 规则完整、
 *      单个字段能校验出错误，但聚合调用却返回通过）。
 *
 *   2. **调 `field.validate()` 时不传 trigger**。传空串会命中 EP 内部的
 *      `getFilteredRule(trigger)` 分支（源码 L106-112：无 trigger 时保留全部规则，
 *      有 trigger 时按 `rule.trigger` 过滤），传 `''` 会筛不出任何规则，
 *      随后 L148 直接 `return true` 跳过校验。
 *
 *   3. **只校验「声明了规则」的字段**，而不是无脑遍历所有 fields。
 *      EP 的 `validate()` 有三条返回路径，其中两条都返回 `false`：
 *        - L141 `if (isResettingField || !props.prop) return false` —— 重置窗口内跳过
 *        - L143 `if (!validateEnabled.value) return false` —— **该字段没有任何规则**
 *      后者是常态（例如只做展示、不参与校验的 select 字段），
 *      把它当成"校验失败"会让「只要有一个无规则字段，表单就永远提交不了」。
 *
 *      注意 EP 并没有把 `validateEnabled` 放进 expose，字段代理上取不到，
 *      所以这里以 `props.items` 中是否声明了 rules 作为唯一判据——
 *      这也是业务侧真正能控制的输入，语义清晰且不依赖 EP 内部实现。
 *
 *   4. 剩下真正需要校验的字段：**reject 即失败**；返回 `false` 说明落在
 *      resetField 的 `isResettingField` 窗口内（跳过未执行），也不能当作通过。
 */
interface FormFieldProxy {
  prop?: string;
  validate: () => Promise<unknown>;
}

async function validate(): Promise<boolean> {
  const fields = formRef.value?.fields as FormFieldProxy[] | undefined;
  if (!fields?.length) return true;

  // 先让一个 tick 过去：EP 的 resetField 会把 isResettingField 置为 true，
  // 并在 await nextTick() 后才复位（源码 L167-176）；
  // 若校验恰好落在该窗口内，field.validate() 会返回 false 而非 reject。
  await nextTick();

  // 只挑出「在 items 里声明了规则」的字段参与校验。
  const validatableNames = new Set(
    props.items
      .filter((item) => Array.isArray(item.rules) && item.rules.length > 0)
      .map((item) => item.name)
  );
  const validatable = fields.filter(
    (field) => field.prop && validatableNames.has(field.prop)
  );
  if (!validatable.length) return true;

  const results = await Promise.all(
    validatable.map(async (field) => {
      try {
        const result = await field.validate();
        // 显式 false 表示"未执行校验"（resetting 窗口），不能当作通过放行
        return result !== false;
      } catch {
        return false;
      }
    })
  );
  return results.every(Boolean);
}

function clearValidate() {
  formRef.value?.clearValidate?.();
}

/** 重置为初始值并清空校验状态 */
function reset() {
  const snapshot = { ...initialSnapshot };
  for (const key of Object.keys(innerModel)) delete innerModel[key];
  Object.assign(innerModel, snapshot);
  emit('update:modelValue', { ...snapshot });
  clearValidate();
  emit('reset');
}

function getValues(): Record<string, unknown> {
  return { ...innerModel };
}

function setValues(values: Record<string, unknown>) {
  Object.assign(innerModel, values);
  emit('update:modelValue', { ...innerModel });
}

function getValue(name: string) {
  return innerModel[name];
}

function setValue(name: string, value: unknown) {
  handleChange(name, value);
}

async function handleSubmit() {
  const ok = await validate();
  if (!ok) {
    emit('validate-error', formRef.value?.fields);
    return;
  }
  emit('submit', getValues());
}

function handleReset() {
  reset();
}

defineExpose<ProFormInstance>({
  validate,
  clearValidate,
  reset,
  getValues,
  setValues,
  getValue,
  setValue
});

/** 初始值快照，用于 reset 时恢复 */
let initialSnapshot: Record<string, unknown> = {};

/** 记录初始值：受控模式取 modelValue，非受控取 defaultValue */
function syncInitialValues() {
  initialSnapshot = {
    ...(isControlled.value ? props.modelValue ?? {} : props.defaultValue ?? {})
  };
  // 非受控模式下用 defaultValue 作为内部状态的起点
  if (!isControlled.value) {
    Object.assign(innerModel, props.defaultValue ?? {});
  }
}

watch(
  () => props.items,
  () => ensureKeys(),
  { immediate: true, deep: true }
);

watch(
  () => props.defaultValue,
  () => syncInitialValues(),
  { immediate: true, deep: true }
);

// 受控模式下把外部值同步进影子对象。
// flush: 'sync' 保证在 ElForm 建立字段校验之前 model 里就已有对应键。
watch(
  () => props.modelValue,
  () => syncFromProps(),
  { immediate: true, deep: true, flush: 'sync' }
);
</script>
