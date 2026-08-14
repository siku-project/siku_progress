<script setup lang="ts">
defineProps<{
  colors: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="swatches">
    <button
      v-for="color in colors"
      :key="color"
      type="button"
      class="swatch"
      :class="{ 'swatch--on': modelValue.toLowerCase() === color.toLowerCase() }"
      :style="{ background: color, boxShadow: `0 0 8px ${color}55` }"
      :aria-label="color"
      @click="emit('update:modelValue', color)"
    ></button>
  </div>
</template>

<style scoped>
.swatches {
  display: flex;
  align-items: center;
  gap: 8px;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  border: 1px solid rgba(216, 234, 250, 0.25);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.swatch:hover {
  transform: scale(1.12);
}

.swatch--on {
  border-color: rgba(242, 248, 253, 0.85);
  transform: scale(1.12);
}
</style>
