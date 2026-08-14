import { onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { ProgressItem } from '@/utils/progress'
import type { ProgressPhase } from '@/stores/progress'

const TICK_INTERVAL = 100

const clamp = (value: number): number => Math.min(1, Math.max(0, value))

export const useProgressPercentage = (
  item: Ref<ProgressItem>,
  phase: Ref<ProgressPhase>,
  stoppedAt: Ref<number | null>,
) => {
  const percent = ref(0)

  let interval: ReturnType<typeof setInterval> | null = null

  const ratioNow = (): number => clamp((Date.now() - item.value.startedAt) / item.value.duration)

  const apply = (ratio: number): void => {
    percent.value = Math.round((item.value.mode === 'fill' ? ratio : 1 - ratio) * 100)
  }

  const stop = (): void => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  const run = (): void => {
    stop()
    apply(0)
    interval = setInterval(() => {
      const ratio = ratioNow()
      apply(ratio)
      if (ratio >= 1) {
        stop()
      }
    }, TICK_INTERVAL)
  }

  watch(() => item.value.id, run, { immediate: true })

  watch(phase, (value) => {
    if (value === 'done') {
      stop()
      apply(1)
    } else if (value === 'cancelled' || value === 'failed') {
      stop()
      apply(
        stoppedAt.value
          ? clamp((stoppedAt.value - item.value.startedAt) / item.value.duration)
          : ratioNow(),
      )
    }
  })

  onBeforeUnmount(stop)

  return { percent }
}
