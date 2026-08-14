<script setup lang="ts">
import { computed, toRef } from 'vue'
import ProgressRing from './ProgressRing.vue'
import { useProgressPercentage } from '@/composables/useProgressPercentage'
import type { ProgressItem } from '@/utils/progress'
import type { ProgressPhase } from '@/stores/progress'

const props = defineProps<{
  item: ProgressItem
  phase: ProgressPhase
  stoppedAt: number | null
}>()

const item = toRef(props, 'item')
const phase = toRef(props, 'phase')
const stoppedAt = toRef(props, 'stoppedAt')

const { percent } = useProgressPercentage(item, phase, stoppedAt)

const percentFontSize = computed(
  () => `${Math.min(21, Math.max(13, Math.round(props.item.size * 0.14)))}px`,
)
</script>

<template>
  <div class="circle" :class="{ 'circle--cancelled': phase === 'cancelled' }">
    <span v-if="item.label && item.labelPosition === 'top'" class="circle__label">
      {{ item.label }}
    </span>

    <ProgressRing :item="item" :phase="phase" :stopped-at="stoppedAt">
      <span
        v-if="item.showPercentage"
        class="circle__percent"
        :style="{ fontSize: percentFontSize }"
      >
        {{ percent }}%
      </span>
    </ProgressRing>

    <span v-if="item.label && item.labelPosition === 'bottom'" class="circle__label">
      {{ item.label }}
    </span>
  </div>
</template>

<style scoped>
.circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 82vw;
  transition: filter 0.3s ease;
}

.circle--cancelled {
  filter: saturate(0.5);
}

.circle__label {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  text-align: center;
  color: rgba(244, 250, 255, 0.97);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
  overflow-wrap: anywhere;
}

.circle__percent {
  font-weight: 300;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: rgba(244, 250, 255, 0.97);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
}
</style>
