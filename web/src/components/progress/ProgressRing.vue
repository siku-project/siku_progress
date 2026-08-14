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

const SIZE = 120
const STROKE = 10
const GLOW = 4
const RADIUS = (SIZE - STROKE - GLOW) / 2 - 1
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

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

const dashArray = computed(
  () => `${arcLength.value} ${Math.max(CIRCUMFERENCE - arcLength.value, 0)}`,
)

const dashOffset = computed(() => {
  if (sweep.value.anchor === 'center') {
    return arcLength.value / 2
  }
  if (sweep.value.anchor === 'end') {
    return arcLength.value
  }
  return 0
})

const transition = computed(() => {
  if (props.phase === 'cancelled' || !running.value) {
    return 'none'
  }
  return `stroke-dasharray ${props.item.duration}ms linear, stroke-dashoffset ${props.item.duration}ms linear`
})

const groupTransform = computed(() => {
  const rotate = `rotate(${sweep.value.rotate} ${CENTER} ${CENTER})`
  return sweep.value.mirror ? `matrix(-1 0 0 1 ${SIZE} 0) ${rotate}` : rotate
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
    :class="{ 'gauge--done': phase === 'done', 'gauge--cancelled': phase === 'cancelled' }"
  >
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`" aria-hidden="true">
      <circle
        class="gauge__border"
        :cx="CENTER"
        :cy="CENTER"
        :r="RADIUS"
        :stroke-width="STROKE + 2"
      />
      <circle class="gauge__track" :cx="CENTER" :cy="CENTER" :r="RADIUS" :stroke-width="STROKE" />
      <g :transform="groupTransform">
        <circle
          class="gauge__glow"
          :cx="CENTER"
          :cy="CENTER"
          :r="RADIUS"
          :stroke-width="STROKE + GLOW"
          :style="{ ...dashStyle, stroke: hexToRgba(item.color, 0.11) }"
        />
        <circle
          class="gauge__arc"
          :cx="CENTER"
          :cy="CENTER"
          :r="RADIUS"
          :stroke-width="STROKE - 2"
          :style="{ ...dashStyle, stroke: hexToRgba(item.color, 0.82) }"
        />
        <circle
          class="gauge__frost"
          :cx="CENTER"
          :cy="CENTER"
          :r="RADIUS"
          :stroke-width="2.5"
          :style="dashStyle"
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
  filter: brightness(1.22);
}

.gauge--cancelled {
  filter: saturate(0.35) brightness(0.85);
}
</style>
