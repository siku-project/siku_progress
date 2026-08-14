ProgressConfig = {
  --- Default fill color used when a progress does not specify one.
  ---
  --- Must be a hexadecimal color ('#RGB' or '#RRGGBB'). An invalid value
  --- falls back to the interface default.
  ---
  --- Default: '#a1cbe8'
  defaultColor = '#a1cbe8',

  --- Default lifetime in milliseconds used when a timed progress does not
  --- specify one. Must be strictly positive — an invalid duration falls
  --- back to this value.
  ---
  --- Default: 5000
  defaultDuration = 5000,

  --- Default screen position used when a timed progress (bar or circle)
  --- does not specify one.
  ---
  --- Available: 'top-center', 'center', 'bottom-center'
  ---
  --- Default: 'bottom-center'
  defaultPosition = 'bottom-center',

  --- Default screen position used when a loading does not specify one.
  ---
  --- Available: 'top-left', 'top-center', 'top-right', 'center-left',
  --- 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'
  ---
  --- Default: 'bottom-center'
  defaultLoadingPosition = 'bottom-center',

  --- Default diameter in pixels used when a circular progress does not
  --- specify one. The interface clamps every size between 64 and 156, and
  --- hides the center text below 96.
  ---
  --- Default: 120
  defaultCircleSize = 120,

  --- Default duration in milliseconds of one loading cycle — a full sweep
  --- for the bar, a full turn for the circle. Lower is faster.
  ---
  --- Default: 1400
  defaultLoadingCycle = 1400,
}
