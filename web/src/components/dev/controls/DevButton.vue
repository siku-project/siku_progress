<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'primary' | 'ghost'
}>()
</script>

<template>
  <button type="button" class="btn" :class="variant ? `btn--${variant}` : ''">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  flex: 1 1 auto;
  padding: 9px 12px;
  border-radius: 0.6rem;
  border: 1px solid rgba(216, 234, 250, 0.16);
  background: rgba(11, 25, 44, 0.55);
  color: rgba(226, 240, 250, 0.82);
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn:hover {
  border-color: rgba(216, 234, 250, 0.32);
  color: rgba(244, 250, 255, 0.95);
}

.btn--primary {
  border-color: rgba(150, 212, 246, 0.42);
  background: rgba(71, 133, 189, 0.28);
  color: rgba(244, 250, 255, 0.96);
}

.btn--ghost {
  flex: 1 1 40%;
  background: rgba(11, 25, 44, 0.4);
  font-size: 11px;
}
</style>
