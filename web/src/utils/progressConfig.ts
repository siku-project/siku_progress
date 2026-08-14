import {
  BAR_DIRECTIONS,
  CIRCLE_DIRECTIONS,
  CIRCLE_MAX_SIZE,
  CIRCLE_MIN_SIZE,
  CONTROL_MODES,
  LABEL_POSITIONS,
  LOADING_POSITIONS,
  MIN_DURATION,
  PROGRESS_MODES,
  TIMED_POSITIONS,
  isValidHex,
} from './progress'
import type {
  BarDirection,
  CircleDirection,
  ControlMode,
  LabelPosition,
  ProgressDefaults,
  ProgressMode,
  ProgressPosition,
} from './progress'

export interface TimedConfigInput {
  defaultColor?: string
  defaultDuration?: number
  defaultPosition?: ProgressPosition
  defaultBarDirection?: BarDirection
  defaultCircleDirection?: CircleDirection
  defaultMode?: ProgressMode
  defaultBackground?: boolean
  defaultLabelPosition?: LabelPosition
  defaultCircleSize?: number
  defaultShowPercentage?: boolean
  defaultShowTime?: boolean
}

export interface LoadingConfigInput {
  defaultColor?: string
  defaultCycle?: number
  defaultPosition?: ProgressPosition
  defaultBarDirection?: BarDirection
  defaultCircleDirection?: CircleDirection
  defaultBackground?: boolean
  defaultLabelPosition?: LabelPosition
  defaultCircleSize?: number
  defaultShowTime?: boolean
}

export interface ControlConfigInput {
  defaultColor?: string
  defaultPosition?: ProgressPosition
  defaultBarDirection?: BarDirection
  defaultCircleDirection?: CircleDirection
  defaultBackground?: boolean
  defaultLabelPosition?: LabelPosition
  defaultCircleSize?: number
  defaultShowPercentage?: boolean
  defaultBehavior?: ControlMode
  defaultRiseRate?: number
  defaultFallRate?: number
  defaultPulseGain?: number
  defaultStartAt?: number
  defaultCompleteAtFull?: boolean
  defaultFailAtEmpty?: boolean
}

export interface StepsConfigInput {
  defaultColor?: string
  defaultPosition?: ProgressPosition
  defaultBackground?: boolean
  defaultShowCounter?: boolean
}

export interface ProgressConfigInput {
  progress?: TimedConfigInput
  loading?: LoadingConfigInput
  control?: ControlConfigInput
  steps?: StepsConfigInput
}

const timedPositions: readonly ProgressPosition[] = TIMED_POSITIONS
const loadingPositions: readonly ProgressPosition[] = LOADING_POSITIONS
const barDirections: readonly BarDirection[] = BAR_DIRECTIONS
const circleDirections: readonly CircleDirection[] = CIRCLE_DIRECTIONS
const loadingBarDirections: readonly BarDirection[] = ['left-right', 'right-left']
const loadingCircleDirections: readonly CircleDirection[] = ['clockwise', 'counter-clockwise']
const progressModes: readonly ProgressMode[] = PROGRESS_MODES
const controlModes: readonly ControlMode[] = CONTROL_MODES
const labelPositions: readonly LabelPosition[] = LABEL_POSITIONS

const pickHex = (value: unknown, fallback: string): string =>
  typeof value === 'string' && isValidHex(value) ? value : fallback

const pickDuration = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.max(MIN_DURATION, Math.floor(value))
    : fallback

const pickEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback

const pickBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

const pickSize = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(CIRCLE_MAX_SIZE, Math.max(CIRCLE_MIN_SIZE, Math.round(value)))
    : fallback

const pickRate = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback

const pickFall = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback

const pickRatio = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback

export const mergeProgressConfig = (
  current: ProgressDefaults,
  input: ProgressConfigInput,
): ProgressDefaults => {
  if (typeof input !== 'object' || input === null) {
    return current
  }
  const progress = input.progress ?? {}
  const loading = input.loading ?? {}
  const control = input.control ?? {}
  const steps = input.steps ?? {}
  return {
    progress: {
      color: pickHex(progress.defaultColor, current.progress.color),
      duration: pickDuration(progress.defaultDuration, current.progress.duration),
      position: pickEnum(progress.defaultPosition, timedPositions, current.progress.position),
      barDirection: pickEnum(
        progress.defaultBarDirection,
        barDirections,
        current.progress.barDirection,
      ),
      circleDirection: pickEnum(
        progress.defaultCircleDirection,
        circleDirections,
        current.progress.circleDirection,
      ),
      mode: pickEnum(progress.defaultMode, progressModes, current.progress.mode),
      background: pickBool(progress.defaultBackground, current.progress.background),
      labelPosition: pickEnum(
        progress.defaultLabelPosition,
        labelPositions,
        current.progress.labelPosition,
      ),
      circleSize: pickSize(progress.defaultCircleSize, current.progress.circleSize),
      showPercentage: pickBool(progress.defaultShowPercentage, current.progress.showPercentage),
      showTime: pickBool(progress.defaultShowTime, current.progress.showTime),
    },
    loading: {
      color: pickHex(loading.defaultColor, current.loading.color),
      cycle: pickDuration(loading.defaultCycle, current.loading.cycle),
      position: pickEnum(loading.defaultPosition, loadingPositions, current.loading.position),
      barDirection: pickEnum(
        loading.defaultBarDirection,
        loadingBarDirections,
        current.loading.barDirection,
      ),
      circleDirection: pickEnum(
        loading.defaultCircleDirection,
        loadingCircleDirections,
        current.loading.circleDirection,
      ),
      background: pickBool(loading.defaultBackground, current.loading.background),
      labelPosition: pickEnum(
        loading.defaultLabelPosition,
        labelPositions,
        current.loading.labelPosition,
      ),
      circleSize: pickSize(loading.defaultCircleSize, current.loading.circleSize),
      showTime: pickBool(loading.defaultShowTime, current.loading.showTime),
    },
    control: {
      color: pickHex(control.defaultColor, current.control.color),
      position: pickEnum(control.defaultPosition, timedPositions, current.control.position),
      barDirection: pickEnum(
        control.defaultBarDirection,
        barDirections,
        current.control.barDirection,
      ),
      circleDirection: pickEnum(
        control.defaultCircleDirection,
        circleDirections,
        current.control.circleDirection,
      ),
      background: pickBool(control.defaultBackground, current.control.background),
      labelPosition: pickEnum(
        control.defaultLabelPosition,
        labelPositions,
        current.control.labelPosition,
      ),
      circleSize: pickSize(control.defaultCircleSize, current.control.circleSize),
      showPercentage: pickBool(control.defaultShowPercentage, current.control.showPercentage),
      behavior: pickEnum(control.defaultBehavior, controlModes, current.control.behavior),
      riseRate: pickRate(control.defaultRiseRate, current.control.riseRate),
      fallRate: pickFall(control.defaultFallRate, current.control.fallRate),
      pulseGain: pickRate(control.defaultPulseGain, current.control.pulseGain),
      startAt: pickRatio(control.defaultStartAt, current.control.startAt),
      completeAtFull: pickBool(control.defaultCompleteAtFull, current.control.completeAtFull),
      failAtEmpty: pickBool(control.defaultFailAtEmpty, current.control.failAtEmpty),
    },
    steps: {
      color: pickHex(steps.defaultColor, current.steps.color),
      position: pickEnum(steps.defaultPosition, timedPositions, current.steps.position),
      background: pickBool(steps.defaultBackground, current.steps.background),
      showCounter: pickBool(steps.defaultShowCounter, current.steps.showCounter),
    },
  }
}
