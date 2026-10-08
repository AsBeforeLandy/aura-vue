<script setup lang="ts">
import { ref } from 'vue';
import { YearCalendar } from '@aura-vue/business';

const selected = ref<string[]>([]);
</script>

<template>
  <YearCalendar
    v-model="selected"
    :year="2026"
    :cell-size="10"
    :hide-year-title="true"
    color="#d4d4d8"
    selected-color="#7c3aed"
  />
</template>
