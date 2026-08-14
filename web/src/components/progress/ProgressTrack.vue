<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { BarDirection, ProgressItem } from '@/utils/progress'
import { SUCCESS_COLOR, hexToRgba } from '@/utils/progress'
import { resolveSegments } from '@/utils/progressGeometry'
import type { ProgressSegment } from '@/utils/progressGeometry'
import type { ProgressPhase } from '@/stores/progress'

const props = defineProps<{
  item: ProgressItem
  phase: ProgressPhase
  stoppedAt: number | null
}>()

const running = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      running.value = true
    })
  })
})

const segments = computed<ProgressSegment[]>(() =>
  resolveSegments(props.item.direction as BarDirection, props.item.mode),
)

const stoppedRatio = computed<number | null>(() => {
  if (props.phase !== 'cancelled' || !props.stoppedAt) {
    return null
  }
  const ratio = (props.stoppedAt - props.item.startedAt) / props.item.duration
  return Math.min(1, Math.max(0, ratio))
})

const scaleFor = (segment: ProgressSegment): number => {
  if (stoppedRatio.value !== null) {
    return segment.from + (segment.to - segment.from) * stoppedRatio.value
  }
  return running.value ? segment.to : segment.from
}

const transitionFor = (): string => {
  if (props.phase === 'cancelled') {
    return '0ms'
  }
  return running.value ? `${props.item.duration}ms` : '0ms'
}

const styleFor = (color: string) => ({
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 55%, transparent 100%), linear-gradient(180deg, ${hexToRgba(color, 0.82)} 0%, ${hexToRgba(color, 0.52)} 60%, ${hexToRgba(color, 0.62)} 100%)`,
  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 10px ${hexToRgba(color, 0.2)}, 0 0 16px ${hexToRgba(color, 0.32)}`,
})

const fillStyle = computed(() => styleFor(props.item.color))

const completeStyle = computed(() => styleFor(SUCCESS_COLOR))
</script>

<template>
  <div
    class="track"
    :class="{
      'track--done': phase === 'done',
      'track--celebrate': phase === 'done' && !item.indeterminate,
      'track--cancelled': phase === 'cancelled',
    }"
  >
    <template v-if="item.indeterminate">
      <span v-if="phase === 'done'" class="track__complete" :style="completeStyle"></span>
      <span
        v-else
        class="track__pulse"
        :class="{ 'track__pulse--reverse': item.direction === 'right-left' }"
        :style="{
          ...fillStyle,
          animationDuration: `${item.duration}ms`,
          animationPlayState: phase === 'running' ? 'running' : 'paused',
        }"
      ></span>
    </template>
    <template v-else>
      <span
        v-for="segment in segments"
        :key="segment.key"
        class="track__fill"
        :class="`track__fill--${segment.placement}`"
        :style="{
          ...fillStyle,
          transformOrigin: segment.origin,
          transform: `scaleX(${scaleFor(segment)})`,
          transitionDuration: transitionFor(),
        }"
      ></span>
    </template>
    <span class="track__sheen" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.track {
  position: relative;
  height: 12px;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid rgba(212, 231, 247, 0.16);
  background:
    radial-gradient(120% 90% at 50% -20%, rgba(203, 227, 246, 0.08) 0%, transparent 60%),
    linear-gradient(180deg, rgba(14, 32, 54, 0.6) 0%, rgba(8, 20, 37, 0.68) 100%);
  box-shadow:
    inset 0 1px 3px rgba(4, 12, 24, 0.55),
    inset 0 -1px 0 rgba(233, 244, 253, 0.05),
    0 1px 0 rgba(233, 244, 253, 0.05);
  transition:
    border-color 0.3s ease,
    filter 0.3s ease;
}

.track__fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 9999px;
  transition-property: transform;
  transition-timing-function: linear;
  will-change: transform;
}

.track__fill--full {
  left: 0;
  right: 0;
}

.track__fill--left {
  left: 0;
  width: 50%;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.track__fill--right {
  right: 0;
  width: 50%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.track__pulse {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 34%;
  border-radius: 9999px;
  animation-name: pulse-sweep;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform;
}

.track__pulse--reverse {
  animation-direction: reverse;
}

@keyframes pulse-sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(294%);
  }
}

.track__sheen {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    117deg,
    transparent 30%,
    rgba(233, 244, 253, 0.07) 45%,
    rgba(233, 244, 253, 0.02) 51%,
    transparent 63%
  );
}

.track__complete {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  animation: complete-in 220ms ease-out;
}

@keyframes complete-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.track--done {
  border-color: rgba(212, 231, 247, 0.32);
}

.track--celebrate {
  animation: track-bloom 900ms ease-out forwards;
}

@keyframes track-bloom {
  0% {
    filter: brightness(1);
  }
  25% {
    filter: brightness(1.5);
  }
  100% {
    filter: brightness(1.05);
  }
}

.track--cancelled {
  border-color: rgba(244, 110, 122, 0.35);
  filter: saturate(0.35) brightness(0.85);
}
</style>
