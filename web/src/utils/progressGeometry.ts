import type { BarDirection, CircleDirection, ProgressMode } from './progress'

export type SegmentPlacement = 'full' | 'left' | 'right'
export type SegmentOrigin = 'left' | 'right' | 'center'

export interface ProgressSegment {
  key: string
  placement: SegmentPlacement
  origin: SegmentOrigin
  from: number
  to: number
}

export type SweepAnchor = 'start' | 'center' | 'end'

export interface CircleSweep {
  rotate: number
  mirror: boolean
  anchor: SweepAnchor
  from: number
  to: number
}

const single = (origin: SegmentOrigin, from: number, to: number): ProgressSegment[] => [
  { key: 'full', placement: 'full', origin, from, to },
]

const dual = (from: number, to: number): ProgressSegment[] => [
  { key: 'left', placement: 'left', origin: 'left', from, to },
  { key: 'right', placement: 'right', origin: 'right', from, to },
]

export const resolveSegments = (direction: BarDirection, mode: ProgressMode): ProgressSegment[] => {
  if (mode === 'fill') {
    switch (direction) {
      case 'left-right':
        return single('left', 0, 1)
      case 'right-left':
        return single('right', 0, 1)
      case 'edges-center':
        return dual(0, 1)
      case 'center-edges':
        return single('center', 0, 1)
    }
  }

  switch (direction) {
    case 'left-right':
      return single('right', 1, 0)
    case 'right-left':
      return single('left', 1, 0)
    case 'edges-center':
      return single('center', 1, 0)
    case 'center-edges':
      return dual(1, 0)
  }
}

export const resolveCircleSweep = (direction: CircleDirection, mode: ProgressMode): CircleSweep => {
  const from = mode === 'fill' ? 0 : 1
  const to = mode === 'fill' ? 1 : 0
  const travelAnchor = mode === 'fill' ? 'start' : 'end'

  switch (direction) {
    case 'clockwise':
      return { rotate: -90, mirror: false, anchor: travelAnchor, from, to }
    case 'counter-clockwise':
      return { rotate: -90, mirror: true, anchor: travelAnchor, from, to }
    case 'bottom-top':
      return { rotate: 90, mirror: false, anchor: 'center', from, to }
    case 'top-bottom':
      return { rotate: -90, mirror: false, anchor: 'center', from, to }
  }
}
