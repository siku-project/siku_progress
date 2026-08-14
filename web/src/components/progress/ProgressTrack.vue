<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ProgressItem } from '@/utils/progress'
import { hexToRgba } from '@/utils/progress'
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
  resolveSegments(props.item.direction, props.item.mode),
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

const fillStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 55%, transparent 100%), linear-gradient(180deg, ${hexToRgba(props.item.color, 0.82)} 0%, ${hexToRgba(props.item.color, 0.52)} 60%, ${hexToRgba(props.item.color, 0.62)} 100%)`,
  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 10px ${hexToRgba(props.item.color, 0.2)}, 0 0 16px ${hexToRgba(props.item.color, 0.32)}`,
}))
</script>

<template>
  <div
    class="track"
    :class="{ 'track--done': phase === 'done', 'track--cancelled': phase === 'cancelled' }"
  >
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

.track--done {
  border-color: rgba(212, 231, 247, 0.32);
  filter: brightness(1.22);
}

.track--cancelled {
  border-color: rgba(244, 110, 122, 0.35);
  filter: saturate(0.35) brightness(0.85);
}
</style>
