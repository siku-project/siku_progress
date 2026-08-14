<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ProgressBar from './ProgressBar.vue'
import ProgressCircle from './ProgressCircle.vue'
import { useProgressStore } from '@/stores/progress'

const store = useProgressStore()
const { current, phase, stoppedAt } = storeToRefs(store)

const widget = computed(() => (current.value?.shape === 'circle' ? ProgressCircle : ProgressBar))
</script>

<template>
  <div class="stage">
    <Transition name="progress-pop">
      <component
        :is="widget"
        v-if="current"
        :key="current.id"
        :item="current"
        :phase="phase"
        :stopped-at="stoppedAt"
      />
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  bottom: 9vh;
  left: 50%;
  z-index: 40;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  justify-content: center;
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
