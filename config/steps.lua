StepsConfig = {
  --- Default fill color used when a stepped progress does not specify one.
  ---
  --- Must be a hexadecimal color ('#RGB' or '#RRGGBB'). An invalid value
  --- falls back to the interface default. The success wave always uses the
  --- ecosystem green.
  ---
  --- Default: '#a1cbe8'
  defaultColor = '#a1cbe8',

  --- Default screen position used when a stepped progress does not specify
  --- one. Stepped progress is always a bar.
  ---
  --- Available: 'top-center', 'center', 'bottom-center'
  ---
  --- Default: 'bottom-center'
  defaultPosition = 'bottom-center',

  --- Whether a stepped bar shows its Ice Glass panel background when the
  --- payload does not specify it.
  ---
  --- Default: true
  defaultBackground = true,

  --- Whether a stepped bar shows its step counter (e.g. 2/4) when the
  --- payload does not specify it. The step count itself always comes from
  --- the payload, between 1 and 10.
  ---
  --- Default: false
  defaultShowCounter = false,
}
