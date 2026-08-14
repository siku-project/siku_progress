ProgressConfig = {
  --- Default fill color used when a timed progress does not specify one.
  ---
  --- Must be a hexadecimal color ('#RGB' or '#RRGGBB'). An invalid value
  --- falls back to the interface default.
  ---
  --- Default: '#a1cbe8'
  defaultColor = '#a1cbe8',

  --- Default lifetime in milliseconds used when a timed progress does not
  --- specify one. Must be strictly positive.
  ---
  --- Default: 5000
  defaultDuration = 5000,

  --- Default screen position used when a timed progress does not specify one.
  ---
  --- Available: 'top-center', 'center', 'bottom-center'
  ---
  --- Default: 'bottom-center'
  defaultPosition = 'bottom-center',

  --- Default travel direction used when a timed bar does not specify one.
  ---
  --- Available: 'left-right', 'right-left', 'edges-center', 'center-edges'
  ---
  --- Default: 'left-right'
  defaultBarDirection = 'left-right',

  --- Default travel direction used when a timed circle does not specify one.
  --- 'bottom-top' and 'top-bottom' are symmetric sweeps running along both
  --- sides at once.
  ---
  --- Available: 'clockwise', 'counter-clockwise', 'bottom-top', 'top-bottom'
  ---
  --- Default: 'clockwise'
  defaultCircleDirection = 'clockwise',

  --- Default progression mode used when a timed progress does not specify
  --- one. 'fill' fills up over the duration, 'drain' empties down.
  ---
  --- Available: 'fill', 'drain'
  ---
  --- Default: 'fill'
  defaultMode = 'fill',

  --- Whether a timed bar shows its Ice Glass panel background when the
  --- payload does not specify it. Circles never have a background.
  ---
  --- Default: true
  defaultBackground = true,

  --- Default label placement used when a timed circle does not specify one.
  --- Bars always keep their label in the header.
  ---
  --- Available: 'top', 'bottom'
  ---
  --- Default: 'bottom'
  defaultLabelPosition = 'bottom',

  --- Default diameter in pixels used when a timed circle does not specify
  --- one. The interface clamps every size between 64 and 156, and hides the
  --- center text below 96.
  ---
  --- Default: 120
  defaultCircleSize = 120,

  --- Whether a timed progress shows its percentage when the payload does
  --- not specify it.
  ---
  --- Default: false
  defaultShowPercentage = false,

  --- Whether a timed progress shows its remaining time when the payload
  --- does not specify it. On a circle, percentage and time are exclusive —
  --- percentage wins when both are enabled.
  ---
  --- Default: false
  defaultShowTime = false,
}
