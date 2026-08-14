<script setup lang="ts">
import { computed, toRef } from 'vue'
import IcePanel from '@/components/ui/IcePanel.vue'
import ProgressTrack from './ProgressTrack.vue'
import ProgressStepTrack from './ProgressStepTrack.vue'
import { resolveIcon } from '@/utils/icons'
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
  stepsDone: number
}>()

const item = toRef(props, 'item')
const phase = toRef(props, 'phase')
const stoppedAt = toRef(props, 'stoppedAt')
const paused = toRef(props, 'paused')

const { percent } = useProgressPercentage(item, phase, stoppedAt, paused)
const { time } = useProgressTime(item, phase, stoppedAt, paused)

const shownPercent = computed(() =>
  props.item.control ? Math.round(props.value * 100) : percent.value,
)

const metaText = computed(() =>
  props.item.steps ? `${props.stepsDone}/${props.item.steps}` : `${shownPercent.value}%`,
)

const hasMeta = computed(() => props.item.showPercentage || props.item.showTime)

const hasLabel = computed(() => Boolean(props.item.label) || Boolean(props.item.icon))

const hasHeader = computed(() => hasLabel.value || hasMeta.value)

const celebrate = computed(() => props.phase === 'done' && !props.item.indeterminate)

const wrapper = computed(() => (props.item.background ? IcePanel : 'div'))
</script>

<template>
  <div
    class="bar"
    :class="{
      'bar--cancelled': phase === 'cancelled',
      'bar--celebrate': celebrate,
      'bar--failed': phase === 'failed',
      'bar--paused': paused,
    }"
  >
    <component :is="wrapper" class="bar__panel">
      <div
        class="bar__inner"
        :class="{ 'bar__inner--boxed': item.background, 'bar__inner--bare': !hasHeader }"
      >
        <div v-if="hasHeader" class="bar__header">
          <span v-if="hasLabel" class="bar__label">
            <v-icon
              v-if="item.icon"
              class="bar__label-icon"
              size="15"
              :icon="resolveIcon(item.icon)"
            />
            <template v-if="item.label">{{ item.label }}</template>
          </span>
          <span v-if="hasMeta" class="bar__meta">
            <span v-if="item.showPercentage" class="bar__percent">{{ metaText }}</span>
            <span v-if="item.showTime && time" class="bar__time">{{ time }}</span>
          </span>
        </div>

        <ProgressStepTrack v-if="item.steps" :item="item" :phase="phase" :steps-done="stepsDone" />
        <ProgressTrack
          v-else
          :item="item"
          :phase="phase"
          :stopped-at="stoppedAt"
          :paused="paused"
          :paused-at="pausedAt"
          :value="value"
        />
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

.bar--paused {
  filter: saturate(0.7) brightness(0.92);
}

.bar--failed .bar__label,
.bar--failed .bar__percent,
.bar--failed .bar__time {
  animation: text-flicker 520ms steps(2) 2;
}

@keyframes text-flicker {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.9;
  }
  75% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.bar--celebrate {
  animation: bar-pulse 900ms ease-in-out;
}

@keyframes bar-pulse {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.03);
  }
  65% {
    transform: scale(0.99);
  }
  100% {
    transform: scale(1);
  }
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

.bar__label-icon {
  color: rgba(226, 240, 250, 0.9);
  filter: drop-shadow(0 1px 3px rgba(5, 14, 30, 0.7));
}

.bar__meta {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.bar__percent {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: rgba(230, 242, 252, 0.95);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
}

.bar__time {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: rgba(226, 240, 250, 0.92);
  text-shadow:
    0 1px 3px rgba(5, 14, 30, 0.85),
    0 1px 10px rgba(5, 14, 30, 0.6);
}
</style>
