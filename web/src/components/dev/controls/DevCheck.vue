<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggle = (): void => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <button
    type="button"
    class="check"
    :class="{ 'check--on': modelValue, 'check--disabled': disabled }"
    @click="toggle"
  >
    <span class="check__box">
      <span v-if="modelValue" class="check__dot"></span>
    </span>
    {{ label }}
  </button>
</template>

<style scoped>
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  font-size: 11.5px;
  font-weight: 300;
  color: rgba(198, 224, 243, 0.6);
  cursor: pointer;
  transition: color 0.25s ease;
}

.check:hover,
.check--on {
  color: rgba(226, 240, 250, 0.88);
}

.check--disabled {
  opacity: 0.35;
  cursor: default;
}

.check--disabled:hover {
  color: rgba(198, 224, 243, 0.6);
}

.check__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1px solid rgba(216, 234, 250, 0.22);
  background: rgba(11, 25, 44, 0.6);
  transition: border-color 0.25s ease;
}

.check--on .check__box {
  border-color: rgba(150, 212, 246, 0.5);
}

.check__dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background: rgba(161, 203, 232, 0.95);
  box-shadow: 0 0 6px rgba(161, 203, 232, 0.6);
}
</style>
