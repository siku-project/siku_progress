ControlConfig = {
  --- Default fill color used when a controlled progress does not specify
  --- one.
  ---
  --- Must be a hexadecimal color ('#RGB' or '#RRGGBB'). An invalid value
  --- falls back to the interface default.
  ---
  --- Default: '#a1cbe8'
  defaultColor = '#a1cbe8',

  --- Default screen position used when a controlled progress does not
  --- specify one.
  ---
  --- Available: 'top-center', 'center', 'bottom-center'
  ---
  --- Default: 'bottom-center'
  defaultPosition = 'bottom-center',

  --- Default travel direction used when a controlled bar does not specify
  --- one.
  ---
  --- Available: 'left-right', 'right-left', 'edges-center', 'center-edges'
  ---
  --- Default: 'left-right'
  defaultBarDirection = 'left-right',

  --- Default travel direction used when a controlled circle does not
  --- specify one.
  ---
  --- Available: 'clockwise', 'counter-clockwise', 'bottom-top', 'top-bottom'
  ---
  --- Default: 'clockwise'
  defaultCircleDirection = 'clockwise',

  --- Whether a controlled bar shows its Ice Glass panel background when the
  --- payload does not specify it. Circles never have a background.
  ---
  --- Default: true
  defaultBackground = true,

  --- Default label placement used when a controlled circle does not specify
  --- one. Bars always keep their label in the header.
  ---
  --- Available: 'top', 'bottom'
  ---
  --- Default: 'bottom'
  defaultLabelPosition = 'bottom',

  --- Default diameter in pixels used when a controlled circle does not
  --- specify one. The interface clamps every size between 64 and 156, and
  --- hides the center text below 96.
  ---
  --- Default: 120
  defaultCircleSize = 120,

  --- Whether a controlled progress shows its percentage when the payload
  --- does not specify it.
  ---
  --- Default: false
  defaultShowPercentage = false,

  --- Default behavior used when a controlled progress does not specify one.
  ---
  --- 'direct': the gauge follows the values pushed from the code.
  --- 'hold': the gauge rises while held and falls when released.
  --- 'pulse': each pulse pushes the gauge up, it decays on its own.
  ---
  --- Available: 'direct', 'hold', 'pulse'
  ---
  --- Default: 'direct'
  defaultBehavior = 'direct',

  --- Default rise speed for the 'hold' behavior, as a fraction of the gauge
  --- per second. Must be strictly positive.
  ---
  --- Default: 0.35
  defaultRiseRate = 0.35,

  --- Default fall speed for the 'hold' and 'pulse' behaviors, as a fraction
  --- of the gauge per second. Zero disables the decay.
  ---
  --- Default: 0.25
  defaultFallRate = 0.25,

  --- Default gain of one pulse for the 'pulse' behavior, as a fraction of
  --- the gauge. Must be strictly positive.
  ---
  --- Default: 0.08
  defaultPulseGain = 0.08,

  --- Default starting value of the gauge, between 0 and 1.
  ---
  --- Default: 0
  defaultStartAt = 0,

  --- Whether reaching 100% automatically ends the progress in success when
  --- the payload does not specify it.
  ---
  --- Default: true
  defaultCompleteAtFull = true,

  --- Whether reaching 0% automatically ends the progress in failure when
  --- the payload does not specify it. Only triggers once the gauge rose, or
  --- when it started above 0.
  ---
  --- Default: false
  defaultFailAtEmpty = false,
}
