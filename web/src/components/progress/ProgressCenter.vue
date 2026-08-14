<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ProgressBar from './ProgressBar.vue'
import ProgressCircle from './ProgressCircle.vue'
import { useProgressStore } from '@/stores/progress'

const store = useProgressStore()
const { current, phase, stoppedAt, paused, pausedAt, value } = storeToRefs(store)

const widget = computed(() => (current.value?.shape === 'circle' ? ProgressCircle : ProgressBar))

const stageClass = computed(() => `stage--${current.value?.position ?? 'bottom-center'}`)
</script>

<template>
  <div class="stage" :class="stageClass">
    <Transition name="progress-pop">
      <component
        :is="widget"
        v-if="current"
        :key="current.id"
        :item="current"
        :phase="phase"
        :stopped-at="stoppedAt"
        :paused="paused"
        :paused-at="pausedAt"
        :value="value"
      />
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  z-index: 40;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

.stage--top-left {
  top: 8vh;
  left: 4vw;
}

.stage--top-center {
  top: 8vh;
  left: 50%;
  transform: translateX(-50%);
}

.stage--top-right {
  top: 8vh;
  right: 4vw;
}

.stage--center-left {
  top: 50%;
  left: 4vw;
  transform: translateY(-50%);
}

.stage--center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.stage--center-right {
  top: 50%;
  right: 4vw;
  transform: translateY(-50%);
}

.stage--bottom-left {
  bottom: 9vh;
  left: 4vw;
}

.stage--bottom-center {
  bottom: 9vh;
  left: 50%;
  transform: translateX(-50%);
}

.stage--bottom-right {
  bottom: 9vh;
  right: 4vw;
}

.progress-pop-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.progress-pop-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.progress-pop-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.progress-pop-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.985);
}
</style>
