import { ref } from 'vue'
import { defineStore } from 'pinia'
import { normalizeProgress } from '@/utils/progress'
import type { ProgressInput, ProgressItem } from '@/utils/progress'

export type ProgressPhase = 'running' | 'done' | 'cancelled'

const DONE_HOLD = 650
const CANCEL_HOLD = 500

export const useProgressStore = defineStore('progress', () => {
  const current = ref<ProgressItem | null>(null)
  const phase = ref<ProgressPhase>('running')
  const stoppedAt = ref<number | null>(null)

  let nextId = 1
  let endTimer: ReturnType<typeof setTimeout> | null = null
  let holdTimer: ReturnType<typeof setTimeout> | null = null

  const clearTimers = (): void => {
    if (endTimer) {
      clearTimeout(endTimer)
      endTimer = null
    }
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = null
    }
  }

  const finish = (result: Exclude<ProgressPhase, 'running'>): void => {
    clearTimers()
    phase.value = result
    stoppedAt.value = Date.now()
    holdTimer = setTimeout(
      () => {
        current.value = null
      },
      result === 'done' ? DONE_HOLD : CANCEL_HOLD,
    )
  }

  const start = (input: ProgressInput): ProgressItem => {
    clearTimers()
    const item = normalizeProgress(input, nextId++)
    current.value = item
    phase.value = 'running'
    stoppedAt.value = null
    endTimer = setTimeout(() => finish('done'), item.duration)
    return item
  }

  const cancel = (): boolean => {
    if (!current.value || phase.value !== 'running') {
      return false
    }
    finish('cancelled')
    return true
  }

  const clear = (): void => {
    clearTimers()
    current.value = null
  }

  return { current, phase, stoppedAt, start, cancel, clear }
})
