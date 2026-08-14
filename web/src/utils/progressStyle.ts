import { hexToRgba } from './progress'

export const frostFillStyle = (color: string) => ({
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 55%, transparent 100%), linear-gradient(180deg, ${hexToRgba(color, 0.82)} 0%, ${hexToRgba(color, 0.52)} 60%, ${hexToRgba(color, 0.62)} 100%)`,
  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 10px ${hexToRgba(color, 0.2)}, 0 0 16px ${hexToRgba(color, 0.32)}`,
})
