<script setup lang="ts">
import { computed, toRef } from 'vue'
import IcePanel from '@/components/ui/IcePanel.vue'
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

const wrapper = computed(() => (props.item.background ? IcePanel : 'div'))
const wrapperProps = computed(() => (props.item.background ? { variant: 'secondary' } : {}))
</script>

<template>
  <div class="bar" :class="{ 'bar--cancelled': phase === 'cancelled' }">
    <component :is="wrapper" v-bind="wrapperProps" class="bar__panel">
      <div
        class="bar__inner"
        :class="{ 'bar__inner--boxed': item.background, 'bar__inner--bare': !hasHeader }"
      >
        <div v-if="hasHeader" class="bar__header">
          <span v-if="item.label" class="bar__label">{{ item.label }}</span>
          <span v-if="item.showPercentage" class="bar__percent">{{ percent }}%</span>
        </div>

        <ProgressTrack :item="item" :phase="phase" :stopped-at="stoppedAt" />
      </div>
    </component>
  </div>
</template>

<style scoped>
.bar {
  width: 360px;
  max-width: 82vw;
  transition: filter 0.3s ease;
}

.bar--cancelled {
  filter: saturate(0.5);
}

.bar__panel {
  border-radius: 1rem;
}

.bar__inner {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.bar__inner--boxed {
  padding: 12px 16px 14px;
}

.bar__inner--boxed.bar__inner--bare {
  padding: 12px 16px;
}

.bar__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  min-height: 18px;
}

.bar__label {
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

.bar__percent {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: rgba(230, 242, 252, 0.95);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
}
</style>
