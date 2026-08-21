local VALID_RESULTS <const> = {
  done = true,
  cancelled = true,
  failed = true,
}

local nextToken = 0
local pending = {}

--- Resolves and validates a player source.
---@param source any The player source to validate.
---@return number? source The numeric source, or nil when invalid.
local function resolveSource(source)
  local id <const> = tonumber(source)
  if not id or id <= 0 then
    Siku.print.error(('Expected a valid player source, got %s'):format(tostring(source)))
    return nil
  end

  return id
end

--- Settles the pending progress of a player, invoking its handler.
---@param source number The player source.
---@param result string The outcome: 'done', 'cancelled' or 'failed'.
---@return nil
local function settlePending(source, result)
  local entry <const> = pending[source]
  if not entry then
    return
  end

  pending[source] = nil
  if entry.handler then
    entry.handler(result)
  end
end

--- Starts a progress on a player, replacing any pending one (settled as cancelled).
---@param source number The player source.
---@param data table The progress payload forwarded to the client.
---@param onFinish? fun(result: string) Invoked once with 'done', 'cancelled' or 'failed'.
---@return boolean started Whether the progress was accepted.
local function startProgress(source, data, onFinish)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  if type(data) ~= 'table' then
    Siku.print.error(('Start expected a table payload, got %s'):format(type(data)))
    return false
  end

  settlePending(id, 'cancelled')

  nextToken = nextToken + 1
  pending[id] = {
    token = nextToken,
    handler = IsCallable(onFinish) and onFinish or nil,
  }

  TriggerClientEvent('siku_progress:client:start', id, data, nextToken)
  return true
end

--- Ends the active progress of a player in success.
---@param source number The player source.
---@return boolean stopped Whether the stop was forwarded.
local function stopProgress(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:stop', id)
  return true
end

--- Ends the active progress of a player as cancelled.
---@param source number The player source.
---@return boolean cancelled Whether the cancel was forwarded.
local function cancelProgress(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:cancel', id)
  return true
end

--- Ends the active progress of a player in failure.
---@param source number The player source.
---@return boolean failed Whether the fail was forwarded.
local function failProgress(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:fail', id)
  return true
end

--- Pauses the active progress of a player. Loadings cannot be paused.
---@param source number The player source.
---@param autoResumeMs? number Automatic resume delay in milliseconds.
---@return boolean paused Whether the pause was forwarded.
local function pauseProgress(source, autoResumeMs)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:pause', id, tonumber(autoResumeMs))
  return true
end

--- Resumes the active paused progress of a player.
---@param source number The player source.
---@return boolean resumed Whether the resume was forwarded.
local function resumeProgress(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:resume', id)
  return true
end

--- Sets the value of the active controlled progress of a player.
---@param source number The player source.
---@param value number The gauge value to apply, between 0 and 1.
---@return boolean applied Whether the value was forwarded.
local function setProgressValue(source, value)
  local id <const> = resolveSource(source)
  if not id or type(value) ~= 'number' then
    return false
  end

  TriggerClientEvent('siku_progress:client:setValue', id, value)
  return true
end

--- Sets the held state of the active 'hold' controlled progress of a player.
---@param source number The player source.
---@param held boolean Whether the gauge is currently held.
---@return boolean applied Whether the state was forwarded.
local function setProgressHeld(source, held)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:setHeld', id, held == true)
  return true
end

--- Sends one pulse to the active 'pulse' controlled progress of a player.
---@param source number The player source.
---@return boolean pulsed Whether the pulse was forwarded.
local function pulseProgress(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:pulse', id)
  return true
end

--- Validates the next step of the active stepped progress of a player.
---@param source number The player source.
---@return boolean completed Whether the step was forwarded.
local function completeProgressStep(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:completeStep', id)
  return true
end

--- Sets the number of validated steps of the active stepped progress of a player.
---@param source number The player source.
---@param count number The number of validated steps to apply.
---@return boolean applied Whether the count was forwarded.
local function setProgressSteps(source, count)
  local id <const> = resolveSource(source)
  if not id or type(count) ~= 'number' then
    return false
  end

  TriggerClientEvent('siku_progress:client:setSteps', id, count)
  return true
end

--- Clears the active progress of a player instantly.
---@param source number The player source.
---@return boolean cleared Whether the clear was forwarded.
local function clearProgress(source)
  local id <const> = resolveSource(source)
  if not id then
    return false
  end

  TriggerClientEvent('siku_progress:client:clear', id)
  return true
end

--- Checks whether a server-initiated progress is pending for a player.
---@param source number The player source.
---@return boolean active Whether a server-initiated progress is pending.
local function isProgressActive(source)
  local id <const> = tonumber(source)
  return id ~= nil and pending[id] ~= nil
end

RegisterNetEvent('siku_progress:server:finished', function(token, result)
  local id <const> = source
  local entry <const> = pending[id]

  if not entry or entry.token ~= tonumber(token) then
    return
  end

  pending[id] = nil
  if entry.handler then
    entry.handler(VALID_RESULTS[result] and result or 'cancelled')
  end
end)

AddEventHandler('playerDropped', function()
  settlePending(source, 'cancelled')
end)

exports('Start', startProgress)
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
