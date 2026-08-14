import type { ProgressDirection, ProgressMode } from './progress'

export type SegmentPlacement = 'full' | 'left' | 'right'
export type SegmentOrigin = 'left' | 'right' | 'center'

export interface ProgressSegment {
  key: string
  placement: SegmentPlacement
  origin: SegmentOrigin
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

export const resolveSegments = (
  direction: ProgressDirection,
  mode: ProgressMode,
): ProgressSegment[] => {
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
