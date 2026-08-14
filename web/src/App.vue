<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import ProgressView from './views/ProgressView.vue'

const BoilerplateView = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./views/BoilerplateView.vue'))
  : null
</script>

<template>
  <VApp>
    <component :is="BoilerplateView" v-if="BoilerplateView" />
    <ProgressView v-else />
  </VApp>
</template>
