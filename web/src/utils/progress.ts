export const PROGRESS_SHAPES = ['bar', 'circle'] as const

export type ProgressShape = (typeof PROGRESS_SHAPES)[number]

export const BAR_DIRECTIONS = ['left-right', 'right-left', 'edges-center', 'center-edges'] as const

export type BarDirection = (typeof BAR_DIRECTIONS)[number]

export const CIRCLE_DIRECTIONS = [
  'clockwise',
  'counter-clockwise',
  'bottom-top',
  'top-bottom',
] as const

export type CircleDirection = (typeof CIRCLE_DIRECTIONS)[number]

export type ProgressDirection = BarDirection | CircleDirection

export const PROGRESS_MODES = ['fill', 'drain'] as const

export type ProgressMode = (typeof PROGRESS_MODES)[number]

export const LABEL_POSITIONS = ['top', 'bottom'] as const

export type LabelPosition = (typeof LABEL_POSITIONS)[number]

export const LOADING_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

export type ProgressPosition = (typeof LOADING_POSITIONS)[number]

export const TIMED_POSITIONS = ['top-center', 'center', 'bottom-center'] as const

export const CONTROL_MODES = ['direct', 'hold', 'pulse'] as const

export type ControlMode = (typeof CONTROL_MODES)[number]

export interface ProgressControlInput {
  mode?: ControlMode
  riseRate?: number
  fallRate?: number
  pulseGain?: number
  startAt?: number
  completeAtFull?: boolean
  failAtEmpty?: boolean
}

export interface ProgressControl {
  mode: ControlMode
  riseRate: number
  fallRate: number
  pulseGain: number
  startAt: number
  completeAtFull: boolean
  failAtEmpty: boolean
}

export const CONTROL_DEFAULT_RISE = 0.35
export const CONTROL_DEFAULT_FALL = 0.25
export const CONTROL_DEFAULT_PULSE_GAIN = 0.08
export const STEPS_MAX = 10

export const LABEL_ADVISED_MAX = 40
export const MIN_DURATION = 100
export const DEFAULT_DURATION = 5000
export const DEFAULT_COLOR = '#a1cbe8'
export const SUCCESS_COLOR = '#34d3a6'
export const FAIL_COLOR = '#f46e7a'
export const GLITCH_COLD_COLOR = '#6fa8d4'
export const CIRCLE_MIN_SIZE = 64
export const CIRCLE_MAX_SIZE = 156
export const CIRCLE_DEFAULT_SIZE = 120
export const CIRCLE_CENTER_MIN_SIZE = 96
export const LOADING_DEFAULT_CYCLE = 1400

export const PROGRESS_BASE_DEFAULTS: ProgressDefaults = {
  progress: {
    color: DEFAULT_COLOR,
    duration: DEFAULT_DURATION,
    position: 'bottom-center',
    barDirection: 'left-right',
    circleDirection: 'clockwise',
    mode: 'fill',
    background: true,
    labelPosition: 'bottom',
    circleSize: CIRCLE_DEFAULT_SIZE,
    showPercentage: false,
    showTime: false,
  },
  loading: {
    color: DEFAULT_COLOR,
    cycle: LOADING_DEFAULT_CYCLE,
    position: 'bottom-center',
    barDirection: 'left-right',
    circleDirection: 'clockwise',
    background: true,
    labelPosition: 'bottom',
    circleSize: CIRCLE_DEFAULT_SIZE,
    showTime: false,
  },
  control: {
    color: DEFAULT_COLOR,
    position: 'bottom-center',
    barDirection: 'left-right',
    circleDirection: 'clockwise',
    background: true,
    labelPosition: 'bottom',
    circleSize: CIRCLE_DEFAULT_SIZE,
    showPercentage: false,
    behavior: 'direct',
    riseRate: CONTROL_DEFAULT_RISE,
    fallRate: CONTROL_DEFAULT_FALL,
    pulseGain: CONTROL_DEFAULT_PULSE_GAIN,
    startAt: 0,
    completeAtFull: true,
    failAtEmpty: false,
  },
  steps: {
    color: DEFAULT_COLOR,
    position: 'bottom-center',
    background: true,
    showCounter: false,
  },
}

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const ICON_PATTERN = /^mdi-[a-z0-9-]+$/i

export interface ProgressInput {
  shape?: ProgressShape
  label?: string
  icon?: string
  labelPosition?: LabelPosition
  duration?: number
  direction?: ProgressDirection
  mode?: ProgressMode
  color?: string
  showPercentage?: boolean
  showTime?: boolean
  background?: boolean
  size?: number
  indeterminate?: boolean
  position?: ProgressPosition
  control?: ProgressControlInput
  steps?: number
}

export interface TimedDefaults {
  color: string
  duration: number
  position: ProgressPosition
  barDirection: BarDirection
  circleDirection: CircleDirection
  mode: ProgressMode
  background: boolean
  labelPosition: LabelPosition
  circleSize: number
  showPercentage: boolean
  showTime: boolean
}

export interface LoadingDefaults {
  color: string
  cycle: number
  position: ProgressPosition
  barDirection: BarDirection
  circleDirection: CircleDirection
  background: boolean
  labelPosition: LabelPosition
  circleSize: number
  showTime: boolean
}

export interface ControlDefaults {
  color: string
  position: ProgressPosition
  barDirection: BarDirection
  circleDirection: CircleDirection
  background: boolean
  labelPosition: LabelPosition
  circleSize: number
  showPercentage: boolean
  behavior: ControlMode
  riseRate: number
  fallRate: number
  pulseGain: number
  startAt: number
  completeAtFull: boolean
  failAtEmpty: boolean
}

export interface StepsDefaults {
  color: string
  position: ProgressPosition
  background: boolean
  showCounter: boolean
}

export interface ProgressDefaults {
  progress: TimedDefaults
  loading: LoadingDefaults
  control: ControlDefaults
  steps: StepsDefaults
}

export interface ProgressItem {
  id: number
  shape: ProgressShape
  label?: string
  icon?: string
  labelPosition: LabelPosition
  duration: number
  direction: ProgressDirection
  mode: ProgressMode
  color: string
  showPercentage: boolean
  showTime: boolean
  background: boolean
  size: number
  indeterminate: boolean
  position: ProgressPosition
  control?: ProgressControl
  steps?: number
  startedAt: number
}

export const isValidHex = (value: string): boolean => HEX_PATTERN.test(value)

export const hexToRgba = (hex: string, alpha: number): string => {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value
  const int = Number.parseInt(full, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const resolveDirection = (
  shape: ProgressShape,
  direction: ProgressDirection | undefined,
  indeterminate: boolean,
  barFallback: BarDirection,
  circleFallback: CircleDirection,
): ProgressDirection => {
  if (shape === 'circle') {
    if (indeterminate) {
      return direction === 'clockwise' || direction === 'counter-clockwise'
        ? direction
        : circleFallback
    }
    return CIRCLE_DIRECTIONS.includes(direction as CircleDirection)
      ? (direction as CircleDirection)
      : circleFallback
  }
  if (indeterminate) {
    return direction === 'left-right' || direction === 'right-left' ? direction : barFallback
  }
  return BAR_DIRECTIONS.includes(direction as BarDirection)
    ? (direction as BarDirection)
    : barFallback
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

const resolveControl = (
  control: ProgressControlInput | undefined,
  indeterminate: boolean,
  defaults: ControlDefaults,
): ProgressControl | undefined => {
  if (!control || typeof control !== 'object' || indeterminate) {
    return undefined
  }
  const positive = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
  return {
    mode: CONTROL_MODES.includes(control.mode as ControlMode)
      ? (control.mode as ControlMode)
      : defaults.behavior,
    riseRate: positive(control.riseRate, defaults.riseRate),
    fallRate:
      typeof control.fallRate === 'number' && Number.isFinite(control.fallRate)
        ? Math.max(0, control.fallRate)
        : defaults.fallRate,
    pulseGain: positive(control.pulseGain, defaults.pulseGain),
    startAt:
      typeof control.startAt === 'number' && Number.isFinite(control.startAt)
        ? clamp01(control.startAt)
        : defaults.startAt,
    completeAtFull:
      typeof control.completeAtFull === 'boolean'
        ? control.completeAtFull
        : defaults.completeAtFull,
    failAtEmpty:
      typeof control.failAtEmpty === 'boolean' ? control.failAtEmpty : defaults.failAtEmpty,
  }
}

interface FamilyView {
  color: string
  duration: number
  position: ProgressPosition
  barDirection: BarDirection
  circleDirection: CircleDirection
  mode: ProgressMode
  background: boolean
  labelPosition: LabelPosition
  circleSize: number
  showPercentage: boolean
  showTime: boolean
}

const resolveFamily = (
  defaults: ProgressDefaults,
  indeterminate: boolean,
  control: ProgressControl | undefined,
  steps: number | undefined,
): FamilyView => {
  if (indeterminate) {
    const family = defaults.loading
    return {
      color: family.color,
      duration: family.cycle,
      position: family.position,
      barDirection: family.barDirection,
      circleDirection: family.circleDirection,
      mode: 'fill',
      background: family.background,
      labelPosition: family.labelPosition,
      circleSize: family.circleSize,
      showPercentage: false,
      showTime: family.showTime,
    }
  }
  if (control) {
    const family = defaults.control
    return {
      color: family.color,
      duration: defaults.progress.duration,
      position: family.position,
      barDirection: family.barDirection,
      circleDirection: family.circleDirection,
      mode: 'fill',
      background: family.background,
      labelPosition: family.labelPosition,
      circleSize: family.circleSize,
      showPercentage: family.showPercentage,
      showTime: false,
    }
  }
  if (steps) {
    const family = defaults.steps
    return {
      color: family.color,
      duration: defaults.progress.duration,
      position: family.position,
      barDirection: 'left-right',
      circleDirection: 'clockwise',
      mode: 'fill',
      background: family.background,
      labelPosition: 'bottom',
      circleSize: CIRCLE_DEFAULT_SIZE,
      showPercentage: family.showCounter,
      showTime: false,
    }
  }
  const family = defaults.progress
  return {
    color: family.color,
    duration: family.duration,
    position: family.position,
    barDirection: family.barDirection,
    circleDirection: family.circleDirection,
    mode: family.mode,
    background: family.background,
    labelPosition: family.labelPosition,
    circleSize: family.circleSize,
    showPercentage: family.showPercentage,
    showTime: family.showTime,
  }
}

const resolvePosition = (
  indeterminate: boolean,
  position: ProgressPosition | undefined,
  fallback: ProgressPosition,
): ProgressPosition => {
  const allowed: readonly ProgressPosition[] = indeterminate ? LOADING_POSITIONS : TIMED_POSITIONS
  return allowed.includes(position as ProgressPosition) ? (position as ProgressPosition) : fallback
}

export const normalizeProgress = (
  input: ProgressInput,
  id: number,
  defaults: ProgressDefaults = PROGRESS_BASE_DEFAULTS,
): ProgressItem => {
  const shape = PROGRESS_SHAPES.includes(input.shape as ProgressShape)
    ? (input.shape as ProgressShape)
    : 'bar'
  const label = typeof input.label === 'string' ? input.label.trim() : ''
  const indeterminate = input.indeterminate === true
  const control = resolveControl(input.control, indeterminate, defaults.control)
  const steps =
    shape === 'bar' &&
    !indeterminate &&
    !control &&
    typeof input.steps === 'number' &&
    Number.isFinite(input.steps)
      ? Math.min(STEPS_MAX, Math.max(1, Math.round(input.steps)))
      : undefined
  const family = resolveFamily(defaults, indeterminate, control, steps)
  const size =
    typeof input.size === 'number' && Number.isFinite(input.size)
      ? Math.min(CIRCLE_MAX_SIZE, Math.max(CIRCLE_MIN_SIZE, Math.round(input.size)))
      : family.circleSize
  const duration =
    typeof input.duration === 'number' && Number.isFinite(input.duration)
      ? Math.max(MIN_DURATION, Math.floor(input.duration))
      : family.duration
  const wantsPercentage =
    typeof input.showPercentage === 'boolean' ? input.showPercentage : family.showPercentage
  const showPercentage =
    wantsPercentage && !indeterminate && !(shape === 'circle' && size < CIRCLE_CENTER_MIN_SIZE)
  const wantsTime = typeof input.showTime === 'boolean' ? input.showTime : family.showTime

  return {
    id,
    shape,
    label: label.length > 0 ? label : undefined,
    icon: typeof input.icon === 'string' && ICON_PATTERN.test(input.icon) ? input.icon : undefined,
    labelPosition: LABEL_POSITIONS.includes(input.labelPosition as LabelPosition)
      ? (input.labelPosition as LabelPosition)
      : family.labelPosition,
    duration,
    direction: resolveDirection(
      shape,
      input.direction,
      indeterminate,
      family.barDirection,
      family.circleDirection,
    ),
    mode: PROGRESS_MODES.includes(input.mode as ProgressMode)
      ? (input.mode as ProgressMode)
      : family.mode,
    color: typeof input.color === 'string' && isValidHex(input.color) ? input.color : family.color,
    showPercentage,
    showTime:
      wantsTime &&
      !control &&
      !steps &&
      !(shape === 'circle' && size < CIRCLE_CENTER_MIN_SIZE) &&
      !(shape === 'circle' && showPercentage),
    background:
      shape === 'circle'
        ? false
        : typeof input.background === 'boolean'
          ? input.background
          : family.background,
    size,
    indeterminate,
    position: resolvePosition(indeterminate, input.position, family.position),
    control,
    steps,
    startedAt: Date.now(),
  }
}

export const formatRemaining = (ms: number, approximate = false): string => {
  const clamped = Math.max(0, ms)
  const prefix = approximate ? '~' : ''

  if (clamped >= 60000) {
    const totalSeconds = Math.round(clamped / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${prefix}${minutes}:${String(seconds).padStart(2, '0')}`
  }

  if (clamped >= 10000) {
    return `${prefix}${Math.round(clamped / 1000)} s`
  }

  return `${prefix}${(clamped / 1000).toFixed(1).replace('.', ',')} s`
}
