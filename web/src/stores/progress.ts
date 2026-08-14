import { ref } from 'vue'
import { defineStore } from 'pinia'
import { normalizeProgress } from '@/utils/progress'
import type { ProgressInput, ProgressItem } from '@/utils/progress'

export type ProgressPhase = 'running' | 'done' | 'cancelled' | 'failed'

const DONE_HOLD = 950
const CANCEL_HOLD = 500
const FAIL_HOLD = 1000
const CONTROL_TICK = 50

export const useProgressStore = defineStore('progress', () => {
  const current = ref<ProgressItem | null>(null)
  const phase = ref<ProgressPhase>('running')
  const stoppedAt = ref<number | null>(null)
  const paused = ref(false)
  const pausedAt = ref<number | null>(null)
  const value = ref(0)
  const stepsDone = ref(0)

  let nextId = 1
  let endTimer: ReturnType<typeof setTimeout> | null = null
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let resumeTimer: ReturnType<typeof setTimeout> | null = null
  let controlTimer: ReturnType<typeof setInterval> | null = null
  let held = false
  let everRose = false

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
    if (controlTimer) {
      clearInterval(controlTimer)
      controlTimer = null
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
    const steps = current.value?.steps
    const doneHold = steps ? 700 + steps * 150 + 750 : DONE_HOLD
    holdTimer = setTimeout(
      () => {
        current.value = null
      },
      result === 'done' ? doneHold : result === 'failed' ? FAIL_HOLD : CANCEL_HOLD,
    )
  }

  const applyValue = (next: number): void => {
    const item = current.value
    if (!item?.control) {
      return
    }
    const clamped = Math.min(1, Math.max(0, next))
    if (clamped > value.value) {
      everRose = true
    }
    value.value = clamped
    if (clamped >= 1 && item.control.completeAtFull) {
      finish('done')
    } else if (clamped <= 0 && item.control.failAtEmpty && (everRose || item.control.startAt > 0)) {
      finish('failed')
    }
  }

  const tickControl = (): void => {
    const item = current.value
    if (!item?.control || phase.value !== 'running' || paused.value) {
      return
    }
    const dt = CONTROL_TICK / 1000
    if (item.control.mode === 'hold') {
      applyValue(value.value + (held ? item.control.riseRate : -item.control.fallRate) * dt)
    } else if (item.control.mode === 'pulse') {
      applyValue(value.value - item.control.fallRate * dt)
    }
  }

  const start = (input: ProgressInput): ProgressItem => {
    clearTimers()
    const item = normalizeProgress(input, nextId++)
    current.value = item
    phase.value = 'running'
    stoppedAt.value = null
    paused.value = false
    pausedAt.value = null
    held = false
    everRose = false
    value.value = item.control ? item.control.startAt : 0
    stepsDone.value = 0
    if (item.control) {
      if (item.control.mode !== 'direct') {
        controlTimer = setInterval(tickControl, CONTROL_TICK)
      }
    } else if (!item.indeterminate && !item.steps) {
      endTimer = setTimeout(() => finish('done'), item.duration)
    }
    return item
  }

  const applySteps = (next: number): void => {
    const item = current.value
    if (!item?.steps) {
      return
    }
    stepsDone.value = Math.min(item.steps, Math.max(0, Math.round(next)))
    if (stepsDone.value >= item.steps) {
      finish('done')
    }
  }

  const completeStep = (): boolean => {
    const item = current.value
    if (!item?.steps || phase.value !== 'running' || paused.value) {
      return false
    }
    applySteps(stepsDone.value + 1)
    return true
  }

  const setSteps = (next: number): boolean => {
    const item = current.value
    if (!item?.steps || phase.value !== 'running' || paused.value) {
      return false
    }
    if (typeof next !== 'number' || !Number.isFinite(next)) {
      return false
    }
    applySteps(next)
    return true
  }

  const setValue = (next: number): boolean => {
    if (!current.value?.control || phase.value !== 'running') {
      return false
    }
    if (typeof next !== 'number' || !Number.isFinite(next)) {
      return false
    }
    applyValue(next)
    return true
  }

  const setHeld = (state: boolean): boolean => {
    if (
      !current.value?.control ||
      current.value.control.mode !== 'hold' ||
      phase.value !== 'running'
    ) {
      return false
    }
    held = state === true
    return true
  }

  const pulse = (): boolean => {
    const item = current.value
    if (
      !item?.control ||
      item.control.mode !== 'pulse' ||
      phase.value !== 'running' ||
      paused.value
    ) {
      return false
    }
    applyValue(value.value + item.control.pulseGain)
    return true
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
    if (!current.value.control) {
      const remaining = current.value.startedAt + current.value.duration - Date.now()
      endTimer = setTimeout(() => finish('done'), Math.max(remaining, 0))
    }
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
    value,
    stepsDone,
    start,
    setValue,
    setHeld,
    pulse,
    completeStep,
    setSteps,
    pause,
    resume,
    stop,
    cancel,
    fail,
    clear,
  }
})
