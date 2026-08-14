<script setup lang="ts">
import '@/assets/progress-effects.css'
import { resolveIcon } from '@/utils/icons'

defineProps<{
  icon?: string
  label?: string
  center?: boolean
  flicker?: boolean
}>()
</script>

<template>
  <span class="plabel" :class="{ 'plabel--center': center, 'plabel--flicker': flicker }">
    <v-icon v-if="icon" class="plabel__icon" size="15" :icon="resolveIcon(icon)" />
    <template v-if="label">{{ label }}</template>
  </span>
</template>

<style scoped>
.plabel {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(244, 250, 255, 0.97);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
  overflow-wrap: anywhere;
}

.plabel--center {
  justify-content: center;
  text-align: center;
}

.plabel--flicker {
  animation: progress-text-flicker 520ms steps(2) 2;
}

.plabel__icon {
  color: rgba(226, 240, 250, 0.9);
  filter: drop-shadow(0 1px 3px rgba(5, 14, 30, 0.7));
}
</style>
