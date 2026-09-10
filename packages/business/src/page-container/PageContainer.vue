<template>
  <div :class="prefixCls('page-container')" :style="rootStyle">
    <!-- 面包屑 -->
    <ElBreadcrumb
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :class="prefixCls('page-container-breadcrumb')"
      separator="/"
    >
      <ElBreadcrumbItem v-for="(item, i) in breadcrumbs" :key="i">
        <a v-if="item.link" :href="item.link" :class="prefixCls('page-container-breadcrumb-link')">
          {{ item.text }}
        </a>
        <span v-else>{{ item.text }}</span>
      </ElBreadcrumbItem>
    </ElBreadcrumb>

    <!-- 标题区 -->
    <div v-if="hasHeader" :class="[prefixCls('page-container-header'), { 'is-divider': divider }]">
      <div :class="prefixCls('page-container-header-main')">
        <ElButton
          v-if="back"
          :class="prefixCls('page-container-back')"
          :icon="ArrowLeft"
          link
          @click="handleBack"
        >
          返回
        </ElButton>
        <div :class="prefixCls('page-container-heading')">
          <div v-if="title" :class="prefixCls('page-container-title')">{{ title }}</div>
          <div v-if="subTitle" :class="prefixCls('page-container-subtitle')">{{ subTitle }}</div>
        </div>
      </div>
      <div :class="prefixCls('page-container-extra')">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容区 -->
    <div
      v-loading="loading"
      :class="[prefixCls('page-container-body'), { 'is-card': card }]"
    >
      <slot />
    </div>

    <!-- 底部操作栏 -->
    <div
      v-if="$slots.footer"
      :class="[prefixCls('page-container-footer'), { 'is-fixed': fixedFooter }]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import {
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  vLoading
} from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { prefixCls } from '@aura/shared';
import { pageContainerProps, type PageContainerEmits } from './types';
import './style/index.less';

defineOptions({ name: 'APageContainer' });

const props = defineProps(pageContainerProps);
const emit = defineEmits<PageContainerEmits>();
const slots = useSlots();

const rootStyle = computed(() => {
  const p = typeof props.padding === 'number' ? `${props.padding}px` : props.padding;
  return { '--aura-page-padding': p };
});

/** 有标题、副标题、返回按钮或 extra 插槽时才渲染标题区 */
const hasHeader = computed(
  () => Boolean(props.title || props.subTitle || props.back) || Boolean(slots.extra)
);

function handleBack() {
  emit('back');
  // 传了链接时走原生跳转；否则完全交给外部通过 @back 处理路由
  if (props.backLink && typeof window !== 'undefined') {
    window.location.href = props.backLink;
  }
}
</script>
