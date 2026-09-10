<script setup lang="ts">
import { Switch } from '@aura/components';
</script>

<template>
  <div class="aura-switch-row">
    <Switch disabled />
    <Switch :model-value="true" disabled />
  </div>
</template>

<style scoped>
.aura-switch-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
