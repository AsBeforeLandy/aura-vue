<script setup lang="ts">
import { Select } from '@aura/components';

const options = ['杭州', '上海', '广州'];
</script>

<template>
  <Select :options="options" />
</template>
