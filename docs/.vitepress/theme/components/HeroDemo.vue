<template>
  <div class="aura-hero-demo">
    <div class="aura-hero-row">
      <Button>默认按钮</Button>
      <Button type="primary">主要按钮</Button>
      <Button type="dashed">虚线按钮</Button>
      <Button type="text">文本按钮</Button>
    </div>
    <div class="aura-hero-row">
      <Input v-model="name" placeholder="请输入内容" style="max-width: 220px" />
      <Switch v-model="on" />
      <Button type="primary" size="small" @click="count++">
        点了 {{ count }} 次
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Switch } from '@aura/components';

const name = ref('');
const on = ref(true);
const count = ref(0);
</script>
