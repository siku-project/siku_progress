<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  hintTone?: 'muted' | 'warning'
}>()
</script>

<template>
  <label class="field">
    <span class="field__head">
      <span class="field__label">{{ label }}</span>
      <span
        v-if="hint"
        class="field__hint"
        :class="{ 'field__hint--warning': hintTone === 'warning' }"
      >
        {{ hint }}
      </span>
    </span>
    <slot />
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1 1 0;
  min-width: 0;
}

.field__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.field__label {
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(198, 224, 243, 0.5);
}

.field__hint {
  font-size: 9.5px;
  font-weight: 300;
  letter-spacing: 0.04em;
  color: rgba(198, 224, 243, 0.38);
  font-variant-numeric: tabular-nums;
}

.field__hint--warning {
  color: rgba(240, 190, 96, 0.75);
}

.field :slotted(input),
.field :slotted(select),
.field :slotted(textarea) {
  width: 100%;
  padding: 8px 11px;
  border-radius: 0.6rem;
  border: 1px solid rgba(216, 234, 250, 0.16);
  background: rgba(11, 25, 44, 0.66);
  color: rgba(242, 248, 253, 0.92);
  font-size: 12.5px;
  font-weight: 300;
  outline: none;
  transition: border-color 0.25s ease;
}

.field :slotted(input:focus),
.field :slotted(select:focus),
.field :slotted(textarea:focus) {
  border-color: rgba(216, 234, 250, 0.4);
}
</style>
