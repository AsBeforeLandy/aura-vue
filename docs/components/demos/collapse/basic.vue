<script setup lang="ts">
import { ref } from 'vue';
import { Collapse, CollapseItem } from '@aura/components';

const openKeys = ref(['a']);
</script>

<template>
  <div class="stack">
    <p>受控多开（v-model 绑定数组）：</p>
    <Collapse v-model="openKeys">
      <CollapseItem title="什么是 Aura Vue？" value="a">
        Aura Vue 是 Aura UI 的 Vue3 实现，样式与逻辑分离。
      </CollapseItem>
      <CollapseItem title="如何参与贡献？" value="b">
        参照仓库内的组件开发规范 skill，走五件套流程。
      </CollapseItem>
      <CollapseItem title="禁用项" value="c" disabled>
        禁用项不可展开。
      </CollapseItem>
    </Collapse>

    <p>手风琴模式（同时最多展开一项）：</p>
    <Collapse accordion>
      <CollapseItem title="第一问" value="q1">答案一。</CollapseItem>
      <CollapseItem title="第二问" value="q2">答案二。</CollapseItem>
    </Collapse>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

p {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 13px;
}
</style>
