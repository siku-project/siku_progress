<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressItem } from '@/utils/progress'
import { FAIL_COLOR, SUCCESS_COLOR } from '@/utils/progress'
import { frostFillStyle } from '@/utils/progressStyle'
import type { ProgressPhase } from '@/stores/progress'

const props = defineProps<{
  item: ProgressItem
  phase: ProgressPhase
  stepsDone: number
}>()

const chunks = computed(() => Array.from({ length: props.item.steps ?? 1 }, (_, index) => index))

const fillStyle = computed(() =>
  frostFillStyle(props.phase === 'failed' ? FAIL_COLOR : props.item.color),
)

const waveStyle = frostFillStyle(SUCCESS_COLOR)
</script>

<template>
  <div
    class="steps"
    :class="{ 'steps--failed': phase === 'failed', 'steps--cancelled': phase === 'cancelled' }"
  >
    <div v-for="index in chunks" :key="index" class="steps__chunk">
      <span
        v-if="phase === 'done'"
        class="steps__fill steps__fill--wave"
        :style="{ ...waveStyle, animationDelay: `${index * 150}ms` }"
      ></span>
      <span
        v-else
        class="steps__fill"
        :class="{ 'steps__fill--on': stepsDone > index }"
        :style="fillStyle"
      ></span>
      <span class="steps__sheen" aria-hidden="true"></span>
    </div>
  </div>
</template>

<style scoped>
.steps {
  display: flex;
  gap: 5px;
}

.steps__chunk {
  position: relative;
  flex: 1 1 0;
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
  transition: border-color 0.3s ease;
}

.steps__fill {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.28s ease-out;
}

.steps__fill--on {
  transform: scaleX(1);
  animation: step-pop 0.4s ease-out;
}

.steps__fill--wave {
  transform: scaleX(1);
  animation: step-wave 0.7s ease-in-out both;
}

.steps__sheen {
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

.steps--failed .steps__chunk {
  border-color: rgba(244, 110, 122, 0.45);
}

.steps--cancelled {
  filter: saturate(0.35) brightness(0.85);
}

@keyframes step-pop {
  0% {
    filter: brightness(1.45);
  }
  100% {
    filter: brightness(1);
  }
}

@keyframes step-wave {
  0% {
    transform: scaleX(1);
    filter: brightness(1);
  }
  40% {
    transform: scaleX(0);
  }
  75% {
    transform: scaleX(1);
    filter: brightness(1.4);
  }
  100% {
    transform: scaleX(1);
    filter: brightness(1.08);
  }
}
</style>
