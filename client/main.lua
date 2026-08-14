--- Loads the full translation table for the active language.
---@return table<string, string>
local function loadTranslations()
  local file <const> =
    LoadResourceFile(GetCurrentResourceName(), ('translations/%s.lua'):format(TranslationConfig.language))
  if not file then
    Siku.print.warn(('No translation file found for language %q'):format(TranslationConfig.language))
    return {}
  end

  local fn <const> = load(file)
  if not fn then
    Siku.print.error(('Unable to compile the translation file for language %q'):format(TranslationConfig.language))
    return {}
  end

  return fn() or {}
end

--- Pushes the active language and its translations to the NUI.
---@return nil
local function sendLocale()
  SendNUIMessage({
    action = 'siku_progress:nui:setLocale',
    locale = {
      language = TranslationConfig.language,
      translations = loadTranslations(),
    },
  })
end

--- Pushes the four family configurations to the NUI.
---@return nil
local function sendConfig()
  SendNUIMessage({
    action = 'siku_progress:nui:setConfig',
    config = {
      progress = {
        defaultColor = ProgressConfig.defaultColor,
        defaultDuration = ProgressConfig.defaultDuration,
        defaultPosition = ProgressConfig.defaultPosition,
        defaultBarDirection = ProgressConfig.defaultBarDirection,
        defaultCircleDirection = ProgressConfig.defaultCircleDirection,
        defaultMode = ProgressConfig.defaultMode,
        defaultBackground = ProgressConfig.defaultBackground,
        defaultLabelPosition = ProgressConfig.defaultLabelPosition,
        defaultCircleSize = ProgressConfig.defaultCircleSize,
        defaultShowPercentage = ProgressConfig.defaultShowPercentage,
        defaultShowTime = ProgressConfig.defaultShowTime,
      },
      loading = {
        defaultColor = LoadingConfig.defaultColor,
        defaultCycle = LoadingConfig.defaultCycle,
        defaultPosition = LoadingConfig.defaultPosition,
        defaultBarDirection = LoadingConfig.defaultBarDirection,
        defaultCircleDirection = LoadingConfig.defaultCircleDirection,
        defaultBackground = LoadingConfig.defaultBackground,
        defaultLabelPosition = LoadingConfig.defaultLabelPosition,
        defaultCircleSize = LoadingConfig.defaultCircleSize,
        defaultShowTime = LoadingConfig.defaultShowTime,
      },
      control = {
        defaultColor = ControlConfig.defaultColor,
        defaultPosition = ControlConfig.defaultPosition,
        defaultBarDirection = ControlConfig.defaultBarDirection,
        defaultCircleDirection = ControlConfig.defaultCircleDirection,
        defaultBackground = ControlConfig.defaultBackground,
        defaultLabelPosition = ControlConfig.defaultLabelPosition,
        defaultCircleSize = ControlConfig.defaultCircleSize,
        defaultShowPercentage = ControlConfig.defaultShowPercentage,
        defaultBehavior = ControlConfig.defaultBehavior,
        defaultRiseRate = ControlConfig.defaultRiseRate,
        defaultFallRate = ControlConfig.defaultFallRate,
        defaultPulseGain = ControlConfig.defaultPulseGain,
        defaultStartAt = ControlConfig.defaultStartAt,
        defaultCompleteAtFull = ControlConfig.defaultCompleteAtFull,
        defaultFailAtEmpty = ControlConfig.defaultFailAtEmpty,
      },
      steps = {
        defaultColor = StepsConfig.defaultColor,
        defaultPosition = StepsConfig.defaultPosition,
        defaultBackground = StepsConfig.defaultBackground,
        defaultShowCounter = StepsConfig.defaultShowCounter,
      },
    },
  })
end

RegisterNUICallback('siku_progress:nui:ready', function(_, cb)
  sendLocale()
  sendConfig()
  cb({})
end)
