import { ref } from 'vue'
import { defineStore } from 'pinia'
import { normalizeProgress } from '@/utils/progress'
import type { ProgressInput, ProgressItem } from '@/utils/progress'

export type ProgressPhase = 'running' | 'done' | 'cancelled' | 'failed'

const DONE_HOLD = 950
const CANCEL_HOLD = 500
const FAIL_HOLD = 1000

export const useProgressStore = defineStore('progress', () => {
  const current = ref<ProgressItem | null>(null)
  const phase = ref<ProgressPhase>('running')
  const stoppedAt = ref<number | null>(null)
  const paused = ref(false)
  const pausedAt = ref<number | null>(null)

  let nextId = 1
  let endTimer: ReturnType<typeof setTimeout> | null = null
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let resumeTimer: ReturnType<typeof setTimeout> | null = null

  const clearTimers = (): void => {
    if (endTimer) {
      clearTimeout(endTimer)
      endTimer = null
    }
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = null
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer)
      resumeTimer = null
    }
  }

  const settlePause = (): void => {
    if (paused.value && pausedAt.value && current.value) {
      current.value.startedAt += Date.now() - pausedAt.value
    }
    paused.value = false
    pausedAt.value = null
  }

  const finish = (result: Exclude<ProgressPhase, 'running'>): void => {
    clearTimers()
    settlePause()
    phase.value = result
    stoppedAt.value = Date.now()
    holdTimer = setTimeout(
      () => {
        current.value = null
      },
      result === 'done' ? DONE_HOLD : result === 'failed' ? FAIL_HOLD : CANCEL_HOLD,
    )
  }

  const start = (input: ProgressInput): ProgressItem => {
    clearTimers()
    const item = normalizeProgress(input, nextId++)
    current.value = item
    phase.value = 'running'
    stoppedAt.value = null
    paused.value = false
    pausedAt.value = null
    if (!item.indeterminate) {
      endTimer = setTimeout(() => finish('done'), item.duration)
    }
    return item
  }

  const pause = (autoResumeMs?: number): boolean => {
    if (
      !current.value ||
      phase.value !== 'running' ||
      current.value.indeterminate ||
      paused.value
    ) {
      return false
    }
    if (endTimer) {
      clearTimeout(endTimer)
      endTimer = null
    }
    paused.value = true
    pausedAt.value = Date.now()
    if (typeof autoResumeMs === 'number' && Number.isFinite(autoResumeMs) && autoResumeMs > 0) {
      resumeTimer = setTimeout(() => resume(), autoResumeMs)
    }
    return true
  }

  const resume = (): boolean => {
    if (!current.value || phase.value !== 'running' || !paused.value) {
      return false
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer)
      resumeTimer = null
    }
    settlePause()
    const remaining = current.value.startedAt + current.value.duration - Date.now()
    endTimer = setTimeout(() => finish('done'), Math.max(remaining, 0))
    return true
  }

  const stop = (): boolean => {
    if (!current.value || phase.value !== 'running') {
      return false
    }
    finish('done')
    return true
  }

  const cancel = (): boolean => {
    if (!current.value || phase.value !== 'running') {
      return false
    }
    finish('cancelled')
    return true
  }

  const fail = (): boolean => {
    if (!current.value || phase.value !== 'running' || current.value.indeterminate) {
      return false
    }
    finish('failed')
    return true
  }

  const clear = (): void => {
    clearTimers()
    current.value = null
  }

  return {
    current,
    phase,
    stoppedAt,
    paused,
    pausedAt,
    start,
    pause,
    resume,
    stop,
    cancel,
    fail,
    clear,
  }
})
