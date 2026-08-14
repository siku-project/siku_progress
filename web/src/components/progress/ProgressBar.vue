<script setup lang="ts">
import { computed, toRef } from 'vue'
import ProgressTrack from './ProgressTrack.vue'
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

const hasHeader = computed(() => Boolean(props.item.label) || props.item.showPercentage)
</script>

<template>
  <div class="bar" :class="{ 'bar--cancelled': phase === 'cancelled' }">
    <div v-if="hasHeader" class="bar__header">
      <span v-if="item.label" class="bar__label">{{ item.label }}</span>
      <span v-if="item.showPercentage" class="bar__percent">{{ percent }}%</span>
    </div>

    <ProgressTrack :item="item" :phase="phase" :stopped-at="stoppedAt" />
  </div>
</template>

<style scoped>
.bar {
  width: 340px;
  max-width: 82vw;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: filter 0.3s ease;
}

.bar--cancelled {
  filter: saturate(0.5);
}

.bar__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  min-height: 17px;
}

.bar__label {
  font-size: 12.5px;
  font-weight: 300;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(242, 248, 253, 0.88);
  text-shadow: 0 1px 8px rgba(5, 14, 30, 0.8);
}

.bar__percent {
  margin-left: auto;
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: rgba(198, 224, 243, 0.62);
  text-shadow: 0 1px 8px rgba(5, 14, 30, 0.8);
}
</style>
