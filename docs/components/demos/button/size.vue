<script setup lang="ts">
import { Button } from '@aura/components';
</script>

<template>
  <div class="aura-row">
    <Button size="large">Large</Button>
    <Button>Middle</Button>
    <Button size="small">Small</Button>
  </div>
</template>

<style scoped>
.aura-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
