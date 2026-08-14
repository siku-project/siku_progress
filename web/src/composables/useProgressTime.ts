import { onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { formatRemaining } from '@/utils/progress'
import type { ProgressItem } from '@/utils/progress'
import type { ProgressPhase } from '@/stores/progress'

const TICK_INTERVAL = 100
const LOADING_PRIOR = 6000
const LOADING_FLOOR = 1000
const SMOOTHING = 0.75
const ROUNDING = 500

export const useProgressTime = (
  item: Ref<ProgressItem>,
  phase: Ref<ProgressPhase>,
  stoppedAt: Ref<number | null>,
) => {
  const time = ref<string | null>(null)

  let interval: ReturnType<typeof setInterval> | null = null
  let smoothed: number | null = null

  const stop = (): void => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  const applyLoading = (now: number): void => {
    const elapsed = now - item.value.startedAt
    const raw = Math.max(LOADING_FLOOR, Math.max(LOADING_PRIOR - elapsed, elapsed * 0.5))
    smoothed = smoothed === null ? raw : smoothed * SMOOTHING + raw * (1 - SMOOTHING)
    time.value = formatRemaining(Math.round(smoothed / ROUNDING) * ROUNDING, true)
  }

  const applyTimed = (now: number): void => {
    time.value = formatRemaining(item.value.startedAt + item.value.duration - now)
  }

  const tick = (): void => {
    if (item.value.indeterminate) {
      applyLoading(Date.now())
    } else {
      applyTimed(Date.now())
    }
  }

  const run = (): void => {
    stop()
    smoothed = null
    if (!item.value.showTime) {
      time.value = null
      return
    }
    tick()
    interval = setInterval(tick, TICK_INTERVAL)
  }

  watch(() => item.value.id, run, { immediate: true })

  watch(phase, (value) => {
    if (value === 'running') {
      return
    }
    stop()
    if (!item.value.showTime) {
      return
    }
    if (item.value.indeterminate) {
      time.value = null
    } else if (value === 'done') {
      time.value = formatRemaining(0)
    } else if ((value === 'cancelled' || value === 'failed') && stoppedAt.value) {
      time.value = formatRemaining(item.value.startedAt + item.value.duration - stoppedAt.value)
    }
  })

  onBeforeUnmount(stop)

  return { time }
}
