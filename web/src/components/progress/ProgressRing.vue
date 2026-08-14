<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CircleDirection, ProgressItem } from '@/utils/progress'
import { FAIL_COLOR, GLITCH_COLD_COLOR, SUCCESS_COLOR, hexToRgba } from '@/utils/progress'
import { resolveCircleSweep } from '@/utils/progressGeometry'
import type { ProgressPhase } from '@/stores/progress'

const props = defineProps<{
  item: ProgressItem
  phase: ProgressPhase
  stoppedAt: number | null
  paused?: boolean
  pausedAt?: number | null
  value?: number
}>()

const GLOW = 4

const size = computed(() => props.item.size)
const stroke = computed(() => Math.max(6, Math.round(size.value / 12)))
const radius = computed(() => (size.value - stroke.value - GLOW) / 2 - 1)
const circumference = computed(() => 2 * Math.PI * radius.value)
const center = computed(() => size.value / 2)

const running = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      running.value = true
    })
  })
})

const sweep = computed(() =>
  resolveCircleSweep(props.item.direction as CircleDirection, props.item.mode),
)

const stoppedRatio = computed<number | null>(() => {
  if ((props.phase !== 'cancelled' && props.phase !== 'failed') || !props.stoppedAt) {
    return null
  }
  const ratio = (props.stoppedAt - props.item.startedAt) / props.item.duration
  return Math.min(1, Math.max(0, ratio))
})

const effectiveColor = computed(() => {
  if (props.item.indeterminate && props.phase === 'done') {
    return SUCCESS_COLOR
  }
  if (props.phase === 'failed') {
    return FAIL_COLOR
  }
  return props.item.color
})

const frozenRatio = computed<number | null>(() => {
  if (!props.paused || !props.pausedAt) {
    return null
  }
  const ratio = (props.pausedAt - props.item.startedAt) / props.item.duration
  return Math.min(1, Math.max(0, ratio))
})

const arcRatio = computed<number>(() => {
  if (props.item.indeterminate) {
    return props.phase === 'done' ? 1 : 0.27
  }
  if (props.item.control) {
    return sweep.value.from + (sweep.value.to - sweep.value.from) * (props.value ?? 0)
  }
  if (stoppedRatio.value !== null) {
    return sweep.value.from + (sweep.value.to - sweep.value.from) * stoppedRatio.value
  }
  if (frozenRatio.value !== null) {
    return sweep.value.from + (sweep.value.to - sweep.value.from) * frozenRatio.value
  }
  return running.value ? sweep.value.to : sweep.value.from
})

const arcLength = computed(() => arcRatio.value * circumference.value)

const dashArray = computed(
  () => `${arcLength.value} ${Math.max(circumference.value - arcLength.value, 0)}`,
)

const dashOffset = computed(() => {
  if (props.item.indeterminate) {
    return 0
  }
  if (sweep.value.anchor === 'center') {
    return arcLength.value / 2
  }
  if (sweep.value.anchor === 'end') {
    return arcLength.value
  }
  return 0
})

const transition = computed(() => {
  if (props.item.control) {
    return props.phase === 'running' && !props.paused
      ? 'stroke-dasharray 90ms linear, stroke-dashoffset 90ms linear'
      : 'none'
  }
  if (
    props.item.indeterminate ||
    props.phase === 'cancelled' ||
    props.phase === 'failed' ||
    props.paused ||
    !running.value
  ) {
    return 'none'
  }
  const remaining = Math.max(props.item.startedAt + props.item.duration - Date.now(), 0)
  return `stroke-dasharray ${remaining}ms linear, stroke-dashoffset ${remaining}ms linear`
})

const groupTransform = computed(() => {
  const rotate = `rotate(${sweep.value.rotate} ${center.value} ${center.value})`
  return sweep.value.mirror ? `matrix(-1 0 0 1 ${size.value} 0) ${rotate}` : rotate
})

const dashStyle = computed(() => ({
  strokeDasharray: dashArray.value,
  strokeDashoffset: dashOffset.value,
  transition: transition.value,
}))
</script>

<template>
  <div
    class="gauge"
    :class="{
      'gauge--done': phase === 'done' && item.indeterminate,
      'gauge--celebrate': phase === 'done' && !item.indeterminate,
      'gauge--cancelled': phase === 'cancelled',
      'gauge--failed': phase === 'failed',
    }"
  >
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
      :class="{
        'gauge__svg--spin': item.indeterminate,
        'gauge__svg--reverse': item.indeterminate && item.direction === 'counter-clockwise',
      }"
      :style="
        item.indeterminate
          ? {
              animationDuration: `${item.duration}ms`,
              animationPlayState: phase === 'running' ? 'running' : 'paused',
            }
          : undefined
      "
    >
      <circle
        class="gauge__border"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="stroke + 2"
      />
      <circle class="gauge__track" :cx="center" :cy="center" :r="radius" :stroke-width="stroke" />
      <g :transform="groupTransform">
        <circle
          class="gauge__glow"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke + GLOW"
          :style="{ ...dashStyle, stroke: hexToRgba(effectiveColor, 0.11) }"
        />
        <circle
          class="gauge__arc"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke - 2"
          :style="{ ...dashStyle, stroke: hexToRgba(effectiveColor, 0.82) }"
        />
        <circle
          class="gauge__frost"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="2.5"
          :style="dashStyle"
        />
      </g>
      <g v-if="phase === 'failed'" :transform="groupTransform">
        <circle
          class="gauge__ghost gauge__ghost--warm"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke - 2"
          :style="{ ...dashStyle, stroke: hexToRgba(FAIL_COLOR, 0.4) }"
        />
        <circle
          class="gauge__ghost gauge__ghost--cold"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke - 2"
          :style="{ ...dashStyle, stroke: hexToRgba(GLITCH_COLD_COLOR, 0.35) }"
        />
      </g>
    </svg>

    <div class="gauge__center">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.gauge {
  position: relative;
  display: inline-flex;
  outline: none;
  transition: filter 0.3s ease;
}

.gauge svg {
  display: block;
  outline: none;
  border: none;
  overflow: visible;
}

.gauge__svg--spin {
  animation-name: gauge-spin;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.gauge__svg--reverse {
  animation-direction: reverse;
}

@keyframes gauge-spin {
  to {
    transform: rotate(360deg);
  }
}

.gauge__border {
  fill: none;
  stroke: rgba(212, 231, 247, 0.16);
}

.gauge__track {
  fill: none;
  stroke: rgba(10, 23, 41, 0.66);
}

.gauge__glow {
  fill: none;
  stroke-linecap: round;
}

.gauge__arc {
  fill: none;
  stroke-linecap: round;
}

.gauge__frost {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-linecap: round;
}

.gauge__center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.gauge--done {
  filter: brightness(1.1);
}

.gauge--celebrate {
  animation: gauge-bloom 900ms ease-in-out;
}

@keyframes gauge-bloom {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.04);
    filter: brightness(1.5);
  }
  65% {
    transform: scale(0.99);
    filter: brightness(1.15);
  }
  100% {
    transform: scale(1);
    filter: brightness(1.05);
  }
}

.gauge--cancelled {
  filter: saturate(0.35) brightness(0.85);
}

.gauge--failed {
  animation: glitch-jitter 850ms steps(1) both;
}

.gauge__ghost {
  fill: none;
  stroke-linecap: round;
}

.gauge__ghost--warm {
  animation: ghost-warm 140ms steps(2) 6;
}

.gauge__ghost--cold {
  animation: ghost-cold 160ms steps(2) 5;
}

@keyframes ghost-warm {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(-5px);
  }
  100% {
    opacity: 0;
    transform: translateX(3px);
  }
}

@keyframes ghost-cold {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(5px);
  }
  100% {
    opacity: 0;
    transform: translateX(-3px);
  }
}

@keyframes glitch-jitter {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  6% {
    transform: translate(-6px, 1px) skewX(-4deg);
  }
  10% {
    transform: translate(6px, -1px) skewX(3deg);
    opacity: 0.55;
  }
  14% {
    transform: translate(-4px, 0);
    opacity: 1;
  }
  22% {
    transform: translate(5px, 2px) skewX(-3deg);
  }
  28% {
    transform: translate(-7px, -1px);
    opacity: 0.6;
  }
  34% {
    transform: translate(0, 0);
    opacity: 1;
  }
  44% {
    transform: translate(5px, 0) skewX(4deg);
    opacity: 0.7;
  }
  50% {
    transform: translate(-4px, 1px);
    opacity: 1;
  }
  58% {
    transform: translate(3px, -1px) skewX(-2deg);
    opacity: 0.8;
  }
  66% {
    transform: translate(0, 0);
    opacity: 1;
  }
  78% {
    transform: translate(-2px, 0);
    opacity: 0.9;
  }
  86% {
    transform: translate(2px, 0);
    opacity: 1;
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}
</style>
