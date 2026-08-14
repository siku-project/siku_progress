<script setup lang="ts">
import { computed, toRef } from 'vue'
import ProgressRing from './ProgressRing.vue'
import ProgressLabel from './ProgressLabel.vue'
import { useProgressPercentage } from '@/composables/useProgressPercentage'
import { useProgressTime } from '@/composables/useProgressTime'
import type { ProgressItem } from '@/utils/progress'
import type { ProgressPhase } from '@/stores/progress'

const props = defineProps<{
  item: ProgressItem
  phase: ProgressPhase
  stoppedAt: number | null
  paused: boolean
  pausedAt: number | null
  value: number
}>()

const item = toRef(props, 'item')
const phase = toRef(props, 'phase')
const stoppedAt = toRef(props, 'stoppedAt')
const paused = toRef(props, 'paused')

const { percent } = useProgressPercentage(item, phase, stoppedAt, paused)
const { time } = useProgressTime(item, phase, stoppedAt, paused)

const percentFontSize = computed(
  () => `${Math.min(21, Math.max(13, Math.round(props.item.size * 0.14)))}px`,
)

const timeFontSize = computed(
  () => `${Math.min(19, Math.max(12, Math.round(props.item.size * 0.13)))}px`,
)

const hasLabel = computed(() => Boolean(props.item.label) || Boolean(props.item.icon))

const shownPercent = computed(() =>
  props.item.control ? Math.round(props.value * 100) : percent.value,
)
</script>

<template>
  <div
    class="circle"
    :class="{
      'circle--cancelled': phase === 'cancelled',
      'circle--failed': phase === 'failed',
      'circle--paused': paused,
    }"
  >
    <ProgressLabel
      v-if="hasLabel && item.labelPosition === 'top'"
      :icon="item.icon"
      :label="item.label"
      center
      :flicker="phase === 'failed'"
    />

    <ProgressRing
      :item="item"
      :phase="phase"
      :stopped-at="stoppedAt"
      :paused="paused"
      :paused-at="pausedAt"
      :value="value"
    >
      <span
        v-if="item.showPercentage"
        class="circle__percent"
        :style="{ fontSize: percentFontSize }"
      >
        {{ shownPercent }}%
      </span>
      <span
        v-else-if="item.showTime && time"
        class="circle__time"
        :style="{ fontSize: timeFontSize }"
      >
        {{ time }}
      </span>
    </ProgressRing>

    <ProgressLabel
      v-if="hasLabel && item.labelPosition === 'bottom'"
      :icon="item.icon"
      :label="item.label"
      center
      :flicker="phase === 'failed'"
    />
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

.circle--paused {
  filter: saturate(0.7) brightness(0.92);
}

.circle--failed .circle__percent,
.circle--failed .circle__time {
  animation: progress-text-flicker 520ms steps(2) 2;
}

.circle__time {
  font-weight: 300;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
  color: rgba(230, 242, 252, 0.94);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
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
