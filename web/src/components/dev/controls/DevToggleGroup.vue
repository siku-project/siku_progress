<script setup lang="ts">
export interface DevToggleOption {
  value: string
  label: string
}

defineProps<{
  options: DevToggleOption[]
  modelValue: string
  columns?: 2 | 4
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const select = (value: string): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="toggle" :class="{ 'toggle--grid': columns === 2 }">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="toggle__btn"
      :class="{ 'toggle__btn--on': modelValue === option.value }"
      @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.toggle {
  display: flex;
  gap: 6px;
}

.toggle--grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.toggle__btn {
  flex: 1 1 0;
  padding: 8px 6px;
  border-radius: 0.6rem;
  border: 1px solid rgba(216, 234, 250, 0.14);
  background: rgba(11, 25, 44, 0.5);
  color: rgba(198, 224, 243, 0.55);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.toggle__btn:hover {
  color: rgba(226, 240, 250, 0.85);
}

.toggle__btn--on {
  border-color: rgba(150, 212, 246, 0.42);
  background: rgba(71, 133, 189, 0.22);
  color: rgba(242, 248, 253, 0.95);
}
</style>
