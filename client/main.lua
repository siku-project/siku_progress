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

--- Pushes the progress configuration to the NUI.
---@return nil
local function sendConfig()
  SendNUIMessage({
    action = 'siku_progress:nui:setConfig',
    config = {
      defaultColor = ProgressConfig.defaultColor,
      defaultDuration = ProgressConfig.defaultDuration,
      defaultPosition = ProgressConfig.defaultPosition,
      defaultLoadingPosition = ProgressConfig.defaultLoadingPosition,
      defaultCircleSize = ProgressConfig.defaultCircleSize,
      defaultLoadingCycle = ProgressConfig.defaultLoadingCycle,
    },
  })
end

RegisterNUICallback('siku_progress:nui:ready', function(_, cb)
  sendLocale()
  sendConfig()
  cb({})
end)
