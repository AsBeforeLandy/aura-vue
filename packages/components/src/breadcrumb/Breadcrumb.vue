<template>
  <!--
    面包屑是「当前位置指示器」而非导航组：nav 带可访问名称，
    内部用 ol / li；末项是当前页（aria-current="page"），
    其余有 to 的渲染为链接。
  -->
  <nav :class="prefixCls('breadcrumb')" aria-label="面包屑">
    <ol :class="prefixCls('breadcrumb-list')">
      <li
        v-for="(item, i) in items"
        :key="i"
        :class="prefixCls('breadcrumb-item')"
      >
        <a
          v-if="item.to && i < items.length - 1"
          :href="item.to"
          :class="prefixCls('breadcrumb-link')"
        >
          {{ item.label }}
        </a>
        <span
          v-else
          :class="prefixCls('breadcrumb-current')"
          :aria-current="i === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { prefixCls } from '@aura/shared';
import { breadcrumbProps } from './types';
import './style/index.less';

defineOptions({ name: 'ABreadcrumb' });

defineProps(breadcrumbProps);
</script>
