<template>
  <ElForm
    ref="formRef"
    :model="searchModel"
    :class="prefixCls('search-form')"
    label-width="auto"
    @submit.prevent="handleSearch"
  >
    <ElRow :gutter="16">
      <ElCol
        v-for="field in visibleFields"
        :key="field.name"
        :xs="24"
        :sm="12"
        :md="field.span ?? 8"
      >
        <ElFormItem
          :label="field.label"
          :prop="field.name"
          :class="prefixCls('search-form-field')"
        >
          <ElSelect
            v-if="field.type === 'select'"
            v-model="searchModel[field.name]"
            clearable
            :placeholder="field.placeholder"
            v-bind="field.fieldProps"
          >
            <ElOption
              v-for="opt in field.options ?? []"
              :key="String(opt.value)"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <ElInputNumber
            v-else-if="field.type === 'number'"
            v-model="searchModel[field.name]"
            :placeholder="field.placeholder"
            style="width: 100%"
            v-bind="field.fieldProps"
          />
          <ElDatePicker
            v-else-if="field.type === 'date'"
            v-model="searchModel[field.name]"
            :placeholder="field.placeholder"
            style="width: 100%"
            v-bind="field.fieldProps"
          />
          <ElDatePicker
            v-else-if="field.type === 'dateRange'"
            v-model="searchModel[field.name]"
            type="daterange"
            style="width: 100%"
            v-bind="field.fieldProps"
          />
          <component :is="field.render" v-else-if="field.type === 'custom'" />
          <ElInput
            v-else
            v-model="searchModel[field.name]"
            clearable
            :placeholder="field.placeholder"
            v-bind="field.fieldProps"
          />
        </ElFormItem>
      </ElCol>

      <!-- 操作区：flex: auto 占据行尾剩余空间，字段换行时随行对齐 -->
      <div :class="prefixCls('search-form-actions')">
        <ElButton
          type="primary"
          :loading="props.loading"
          :icon="Search"
          native-type="submit"
          @click.prevent="handleSearch"
        >
          {{ props.submitText }}
        </ElButton>
        <ElButton :icon="RefreshLeft" @click="handleReset">
          {{ props.resetText }}
        </ElButton>
        <ElButton
          v-if="collapsible"
          link
          type="primary"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? '展开' : '收起' }}
          <ElIcon :class="collapseArrowClass">
            <ArrowDown />
          </ElIcon>
        </ElButton>
      </div>
    </ElRow>
  </ElForm>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  ElButton,
  ElCol,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRow,
  ElSelect,
  type FormInstance,
} from 'element-plus';
import { ArrowDown, RefreshLeft, Search } from '@element-plus/icons-vue';
import { classNames, prefixCls } from '@aura-vue/shared';
import { searchFormProps, type SearchFormEmits } from './types';
import './style/index.less';

defineOptions({ name: 'ASearchForm' });

const props = defineProps(searchFormProps);
const emit = defineEmits<SearchFormEmits>();

const formRef = ref<FormInstance>();
const collapsed = ref(props.defaultCollapsed);

/** 查询值：以 initialValues 初始化，字段注册后由控件双向写入。
 *  这里刻意用宽松类型——查询控件的 model 值域横跨 string/number/Date/array，
 *  用 unknown 会让 EP 控件的 v-model 类型校验失败，闭包内是运行时校验的边界。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 见上方说明：EP 控件 v-model 值域无法用单一类型表达
const searchModel = reactive<Record<string, any>>({
  ...props.initialValues,
});

const collapsible = computed(() => props.fields.length > props.collapseAfter);

const visibleFields = computed(() =>
  collapsed.value && collapsible.value
    ? props.fields.slice(0, props.collapseAfter)
    : props.fields,
);

/** 展开箭头：展开状态时旋转 180°（与 ProTable 查询区同款） */
const collapseArrowClass = computed(() =>
  classNames(prefixCls('search-form-arrow'), !collapsed.value && 'is-open'),
);

/** 查询：直接抛出全部字段值。
 *  不调用 validate()——EP 对「未声明规则」的字段一律判校验失败
 *  （ProForm 的同类处理见其 validate 实现），而本组件不声明规则，
 *  antd onFinish 的对应语义就是「无规则即通过」。 */
function handleSearch() {
  emit('search', { ...searchModel });
}

function handleReset() {
  formRef.value?.resetFields();
  emit('reset');
}

defineExpose({ formRef });
</script>
