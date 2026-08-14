<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CircleDirection, ProgressItem } from '@/utils/progress'
import { hexToRgba } from '@/utils/progress'
import { resolveCircleSweep } from '@/utils/progressGeometry'
import type { ProgressPhase } from '@/stores/progress'

const props = defineProps<{
  item: ProgressItem
  phase: ProgressPhase
  stoppedAt: number | null
}>()

const SIZE = 116
const STROKE = 9
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

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
  if (props.phase !== 'cancelled' || !props.stoppedAt) {
    return null
  }
  const ratio = (props.stoppedAt - props.item.startedAt) / props.item.duration
  return Math.min(1, Math.max(0, ratio))
})

const arcRatio = computed<number>(() => {
  if (stoppedRatio.value !== null) {
    return sweep.value.from + (sweep.value.to - sweep.value.from) * stoppedRatio.value
  }
  return running.value ? sweep.value.to : sweep.value.from
})

const arcLength = computed(() => arcRatio.value * CIRCUMFERENCE)

const dashArray = computed(() => `${arcLength.value} ${CIRCUMFERENCE}`)

const dashOffset = computed(() => {
  if (sweep.value.anchor === 'center') {
    return arcLength.value / 2
  }
  if (sweep.value.anchor === 'end') {
    return arcLength.value - CIRCUMFERENCE
  }
  return 0
})

const transition = computed(() => {
  if (props.phase === 'cancelled' || !running.value) {
    return 'none'
  }
  return `stroke-dasharray ${props.item.duration}ms linear, stroke-dashoffset ${props.item.duration}ms linear`
})

const groupTransform = computed(
  () => `${sweep.value.mirror ? 'scaleX(-1) ' : ''}rotate(${sweep.value.rotate}deg)`,
)

const arcStyle = computed(() => ({
  stroke: hexToRgba(props.item.color, 0.85),
  filter: `drop-shadow(0 0 6px ${hexToRgba(props.item.color, 0.45)})`,
}))
</script>

<template>
  <div
    class="ring"
    :class="{ 'ring--done': phase === 'done', 'ring--cancelled': phase === 'cancelled' }"
  >
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
      <circle
        class="ring__track"
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        :stroke-width="STROKE"
      />
      <g class="ring__sweep" :style="{ transform: groupTransform }">
        <circle
          class="ring__arc"
          :cx="SIZE / 2"
          :cy="SIZE / 2"
          :r="RADIUS"
          :stroke-width="STROKE"
          :style="{
            ...arcStyle,
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            transition,
          }"
        />
        <circle
          class="ring__frost"
          :cx="SIZE / 2"
          :cy="SIZE / 2"
          :r="RADIUS"
          :stroke-width="3"
          :style="{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            transition,
          }"
        />
      </g>
    </svg>

    <div class="ring__center">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  display: inline-flex;
  transition: filter 0.3s ease;
}

.ring__track {
  fill: none;
  stroke: rgba(212, 231, 247, 0.14);
}

.ring__sweep {
  transform-origin: 50% 50%;
}

.ring__arc {
  fill: none;
  stroke-linecap: round;
}

.ring__frost {
  fill: none;
  stroke: rgba(255, 255, 255, 0.22);
  stroke-linecap: round;
}

.ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ring--done {
  filter: brightness(1.22);
}

.ring--cancelled {
  filter: saturate(0.35) brightness(0.85);
}
</style>
