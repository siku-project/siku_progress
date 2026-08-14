LoadingConfig = {
  --- Default fill color used when a loading does not specify one.
  ---
  --- Must be a hexadecimal color ('#RGB' or '#RRGGBB'). An invalid value
  --- falls back to the interface default.
  ---
  --- Default: '#a1cbe8'
  defaultColor = '#a1cbe8',

  --- Default duration in milliseconds of one loading cycle — a full sweep
  --- for the bar, a full turn for the circle. Lower is faster. Must be
  --- strictly positive.
  ---
  --- Default: 1400
  defaultCycle = 1400,

  --- Default screen position used when a loading does not specify one.
  ---
  --- Available: 'top-left', 'top-center', 'top-right', 'center-left',
  --- 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'
  ---
  --- Default: 'bottom-center'
  defaultPosition = 'bottom-center',

  --- Default entry side used when a loading bar does not specify one. The
  --- segment appears on that side and vanishes on the opposite one.
  ---
  --- Available: 'left-right', 'right-left'
  ---
  --- Default: 'left-right'
  defaultBarDirection = 'left-right',

  --- Default spin direction used when a loading circle does not specify one.
  ---
  --- Available: 'clockwise', 'counter-clockwise'
  ---
  --- Default: 'clockwise'
  defaultCircleDirection = 'clockwise',

  --- Whether a loading bar shows its Ice Glass panel background when the
  --- payload does not specify it. Circles never have a background.
  ---
  --- Default: true
  defaultBackground = true,

  --- Default label placement used when a loading circle does not specify
  --- one. Bars always keep their label in the header.
  ---
  --- Available: 'top', 'bottom'
  ---
  --- Default: 'bottom'
  defaultLabelPosition = 'bottom',

  --- Default diameter in pixels used when a loading circle does not specify
  --- one. The interface clamps every size between 64 and 156, and hides the
  --- center text below 96.
  ---
  --- Default: 120
  defaultCircleSize = 120,

  --- Whether a loading shows its estimated remaining time (prefixed with ~)
  --- when the payload does not specify it.
  ---
  --- Default: false
  defaultShowTime = false,
}
