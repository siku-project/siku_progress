export const PROGRESS_DIRECTIONS = [
  'left-right',
  'right-left',
  'edges-center',
  'center-edges',
] as const

export type ProgressDirection = (typeof PROGRESS_DIRECTIONS)[number]

export const PROGRESS_MODES = ['fill', 'drain'] as const

export type ProgressMode = (typeof PROGRESS_MODES)[number]

export const LABEL_ADVISED_MAX = 40
export const MIN_DURATION = 100
export const DEFAULT_DURATION = 5000
export const DEFAULT_COLOR = '#a1cbe8'

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export interface ProgressInput {
  label?: string
  duration?: number
  direction?: ProgressDirection
  mode?: ProgressMode
  color?: string
  showPercentage?: boolean
  background?: boolean
}

export interface ProgressItem {
  id: number
  label?: string
  duration: number
  direction: ProgressDirection
  mode: ProgressMode
  color: string
  showPercentage: boolean
  background: boolean
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

export const normalizeProgress = (input: ProgressInput, id: number): ProgressItem => {
  const label = typeof input.label === 'string' ? input.label.trim() : ''
  const duration =
    typeof input.duration === 'number' && Number.isFinite(input.duration)
      ? Math.max(MIN_DURATION, Math.floor(input.duration))
      : DEFAULT_DURATION

  return {
    id,
    label: label.length > 0 ? label : undefined,
    duration,
    direction: PROGRESS_DIRECTIONS.includes(input.direction as ProgressDirection)
      ? (input.direction as ProgressDirection)
      : 'left-right',
    mode: PROGRESS_MODES.includes(input.mode as ProgressMode)
      ? (input.mode as ProgressMode)
      : 'fill',
    color: typeof input.color === 'string' && isValidHex(input.color) ? input.color : DEFAULT_COLOR,
    showPercentage: input.showPercentage === true,
    background: input.background !== false,
    startedAt: Date.now(),
  }
}
