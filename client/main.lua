local VALID_RESULTS <const> = {
  done = true,
  cancelled = true,
  failed = true,
}

local nextToken = 0
local currentToken = nil
local pending = {}

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

--- Settles a pending progress, notifying its handler and the server.
---@param token number The token of the progress to settle.
---@param result string The outcome: 'done', 'cancelled' or 'failed'.
---@return nil
local function settlePending(token, result)
  local entry <const> = pending[token]
  if not entry then
    return
  end

  pending[token] = nil
  if currentToken == token then
    currentToken = nil
  end

  if entry.handler then
    entry.handler(result)
  end
  if entry.serverToken then
    TriggerServerEvent('siku_progress:server:finished', entry.serverToken, result)
  end
end

--- Starts a progress, replacing any active one (settled as cancelled).
---@param data table The progress payload forwarded to the NUI.
---@param onFinish? fun(result: string) Invoked once with 'done', 'cancelled' or 'failed'.
---@param serverToken? number Internal token of a server-initiated progress.
---@return boolean started Whether the progress was accepted.
local function startProgress(data, onFinish, serverToken)
  if type(data) ~= 'table' then
    Siku.print.error(('Start expected a table payload, got %s'):format(type(data)))
    return false
  end

  if currentToken then
    settlePending(currentToken, 'cancelled')
  end

  nextToken = nextToken + 1
  currentToken = nextToken
  pending[currentToken] = {
    handler = type(onFinish) == 'function' and onFinish or nil,
    serverToken = tonumber(serverToken),
  }

  SendNUIMessage({
    action = 'siku_progress:nui:start',
    progress = data,
    token = currentToken,
  })

  return true
end

--- Ends the active progress in success.
---@return boolean stopped Whether an active progress was stopped.
local function stopProgress()
  if not currentToken then
    return false
  end

  SendNUIMessage({ action = 'siku_progress:nui:stop' })
  return true
end

--- Ends the active progress as cancelled.
---@return boolean cancelled Whether an active progress was cancelled.
local function cancelProgress()
  if not currentToken then
    return false
  end

  SendNUIMessage({ action = 'siku_progress:nui:cancel' })
  return true
end

--- Ends the active progress in failure.
---@return boolean failed Whether an active progress was failed.
local function failProgress()
  if not currentToken then
    return false
  end

  SendNUIMessage({ action = 'siku_progress:nui:fail' })
  return true
end

--- Pauses the active progress. Loadings cannot be paused.
---@param autoResumeMs? number Automatic resume delay in milliseconds.
---@return boolean paused Whether the pause was forwarded.
local function pauseProgress(autoResumeMs)
  if not currentToken then
    return false
  end

  SendNUIMessage({
    action = 'siku_progress:nui:pause',
    autoResume = tonumber(autoResumeMs),
  })
  return true
end

--- Resumes the active paused progress.
---@return boolean resumed Whether the resume was forwarded.
local function resumeProgress()
  if not currentToken then
    return false
  end

  SendNUIMessage({ action = 'siku_progress:nui:resume' })
  return true
end

--- Sets the value of the active controlled progress, between 0 and 1.
---@param value number The gauge value to apply.
---@return boolean applied Whether the value was forwarded.
local function setProgressValue(value)
  if not currentToken or type(value) ~= 'number' then
    return false
  end

  SendNUIMessage({
    action = 'siku_progress:nui:setValue',
    value = value,
  })
  return true
end

--- Sets the held state of the active 'hold' controlled progress.
---@param held boolean Whether the gauge is currently held.
---@return boolean applied Whether the state was forwarded.
local function setProgressHeld(held)
  if not currentToken then
    return false
  end

  SendNUIMessage({
    action = 'siku_progress:nui:setHeld',
    held = held == true,
  })
  return true
end

--- Sends one pulse to the active 'pulse' controlled progress.
---@return boolean pulsed Whether the pulse was forwarded.
local function pulseProgress()
  if not currentToken then
    return false
  end

  SendNUIMessage({ action = 'siku_progress:nui:pulse' })
  return true
end

--- Validates the next step of the active stepped progress.
---@return boolean completed Whether the step was forwarded.
local function completeProgressStep()
  if not currentToken then
    return false
  end

  SendNUIMessage({ action = 'siku_progress:nui:completeStep' })
  return true
end

--- Sets the number of validated steps of the active stepped progress.
---@param count number The number of validated steps to apply.
---@return boolean applied Whether the count was forwarded.
local function setProgressSteps(count)
  if not currentToken or type(count) ~= 'number' then
    return false
  end

  SendNUIMessage({
    action = 'siku_progress:nui:setSteps',
    count = count,
  })
  return true
end

--- Clears the active progress instantly, settling it as cancelled.
---@return boolean cleared Whether an active progress was cleared.
local function clearProgress()
  local hadProgress <const> = currentToken ~= nil

  if currentToken then
    settlePending(currentToken, 'cancelled')
  end

  SendNUIMessage({ action = 'siku_progress:nui:clear' })
  return hadProgress
end

--- Checks whether a progress is currently active on this client.
---@return boolean active Whether a progress is active.
local function isProgressActive()
  return currentToken ~= nil
end

RegisterNUICallback('siku_progress:nui:ready', function(_, cb)
  sendLocale()
  sendConfig()
  cb({})
end)

RegisterNUICallback('siku_progress:nui:finished', function(data, cb)
  local token <const> = type(data) == 'table' and tonumber(data.token) or nil
  local result <const> = type(data) == 'table' and data.result or nil

  if token then
    settlePending(token, VALID_RESULTS[result] and result or 'cancelled')
  end

  cb({})
end)

RegisterNetEvent('siku_progress:client:start', function(data, serverToken)
  startProgress(data, nil, serverToken)
end)

RegisterNetEvent('siku_progress:client:stop', function()
  stopProgress()
end)

RegisterNetEvent('siku_progress:client:cancel', function()
  cancelProgress()
end)

RegisterNetEvent('siku_progress:client:fail', function()
  failProgress()
end)

RegisterNetEvent('siku_progress:client:pause', function(autoResumeMs)
  pauseProgress(autoResumeMs)
end)

RegisterNetEvent('siku_progress:client:resume', function()
  resumeProgress()
end)

RegisterNetEvent('siku_progress:client:setValue', function(value)
  setProgressValue(value)
end)

RegisterNetEvent('siku_progress:client:setHeld', function(held)
  setProgressHeld(held)
end)

RegisterNetEvent('siku_progress:client:pulse', function()
  pulseProgress()
end)

RegisterNetEvent('siku_progress:client:completeStep', function()
  completeProgressStep()
end)

RegisterNetEvent('siku_progress:client:setSteps', function(count)
  setProgressSteps(count)
end)

RegisterNetEvent('siku_progress:client:clear', function()
  clearProgress()
end)

exports('Start', function(data, onFinish)
  return startProgress(data, onFinish)
end)
exports('Stop', stopProgress)
exports('Cancel', cancelProgress)
exports('Fail', failProgress)
exports('Pause', pauseProgress)
exports('Resume', resumeProgress)
exports('SetValue', setProgressValue)
exports('SetHeld', setProgressHeld)
exports('Pulse', pulseProgress)
exports('CompleteStep', completeProgressStep)
exports('SetSteps', setProgressSteps)
exports('Clear', clearProgress)
exports('IsActive', isProgressActive)
