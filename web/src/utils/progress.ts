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
): ProgressDirection => {
  if (shape === 'circle') {
    if (indeterminate) {
      return direction === 'counter-clockwise' ? 'counter-clockwise' : 'clockwise'
    }
    return CIRCLE_DIRECTIONS.includes(direction as CircleDirection)
      ? (direction as CircleDirection)
      : 'clockwise'
  }
  if (indeterminate) {
    return direction === 'right-left' ? 'right-left' : 'left-right'
  }
  return BAR_DIRECTIONS.includes(direction as BarDirection)
    ? (direction as BarDirection)
    : 'left-right'
}

const resolvePosition = (indeterminate: boolean, position?: ProgressPosition): ProgressPosition => {
  const allowed: readonly ProgressPosition[] = indeterminate ? LOADING_POSITIONS : TIMED_POSITIONS
  return allowed.includes(position as ProgressPosition)
    ? (position as ProgressPosition)
    : 'bottom-center'
}

export const normalizeProgress = (input: ProgressInput, id: number): ProgressItem => {
  const shape = PROGRESS_SHAPES.includes(input.shape as ProgressShape)
    ? (input.shape as ProgressShape)
    : 'bar'
  const size =
    typeof input.size === 'number' && Number.isFinite(input.size)
      ? Math.min(CIRCLE_MAX_SIZE, Math.max(CIRCLE_MIN_SIZE, Math.round(input.size)))
      : CIRCLE_DEFAULT_SIZE
  const label = typeof input.label === 'string' ? input.label.trim() : ''
  const indeterminate = input.indeterminate === true
  const duration =
    typeof input.duration === 'number' && Number.isFinite(input.duration)
      ? Math.max(MIN_DURATION, Math.floor(input.duration))
      : indeterminate
        ? LOADING_DEFAULT_CYCLE
        : DEFAULT_DURATION
  const showPercentage =
    input.showPercentage === true &&
    !indeterminate &&
    !(shape === 'circle' && size < CIRCLE_CENTER_MIN_SIZE)

  return {
    id,
    shape,
    label: label.length > 0 ? label : undefined,
    icon: typeof input.icon === 'string' && ICON_PATTERN.test(input.icon) ? input.icon : undefined,
    labelPosition: LABEL_POSITIONS.includes(input.labelPosition as LabelPosition)
      ? (input.labelPosition as LabelPosition)
      : 'bottom',
    duration,
    direction: resolveDirection(shape, input.direction, indeterminate),
    mode: PROGRESS_MODES.includes(input.mode as ProgressMode)
      ? (input.mode as ProgressMode)
      : 'fill',
    color: typeof input.color === 'string' && isValidHex(input.color) ? input.color : DEFAULT_COLOR,
    showPercentage,
    showTime:
      input.showTime === true &&
      !(shape === 'circle' && size < CIRCLE_CENTER_MIN_SIZE) &&
      !(shape === 'circle' && showPercentage),
    background: shape === 'circle' ? false : input.background !== false,
    size,
    indeterminate,
    position: resolvePosition(indeterminate, input.position),
    startedAt: Date.now(),
  }
}

export const formatRemaining = (ms: number, approximate = false): string => {
  const clamped = Math.max(0, ms)
  const prefix = approximate ? '~' : ''

  if (clamped >= 60000) {
    const minutes = Math.floor(clamped / 60000)
    const seconds = Math.round((clamped % 60000) / 1000)
    return `${prefix}${minutes}:${String(seconds).padStart(2, '0')}`
  }

  if (clamped >= 10000) {
    return `${prefix}${Math.round(clamped / 1000)} s`
  }

  return `${prefix}${(clamped / 1000).toFixed(1).replace('.', ',')} s`
}
