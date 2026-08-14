# siku_progress

The official progress system of the SIKU ecosystem — a modern, modular and high-performance resource for immersive timed interactions, delivering seamless visual feedback, smooth animations, and consistent integration across FiveM experiences.

![Version](https://img.shields.io/badge/version-1.0.0-4785bd)
![FiveM](https://img.shields.io/badge/fx__version-cerulean-4785bd)
![Lua](https://img.shields.io/badge/Lua-5.4-4785bd)
![Vue](https://img.shields.io/badge/NUI-Vue%203-4785bd)

## Features

- **Ice Glass interface** — a Vue 3 NUI following the SIKU art direction: no blur, glacier palette, thin luminous borders, frozen-glass fills.
- **4 progress families**, each in bar and circle form (steps: bar only):
  - **Timed** — fills or drains over a duration, with percentage and remaining time display.
  - **Loading** — indeterminate sweep or spinner, with an honest estimated time.
  - **Controlled** — driven from code: direct values, hold-to-rise or pulse-to-rise behaviors.
  - **Stepped** — 1 to 10 chunks validated one by one from your own conditions.
- **4 endings** — success (glow bloom, the gauge snaps to full even on an early stop), loading success (instant green fill), cancel (frozen desaturated fade), failure (red glitch with chromatic ghosts).
- **Completion callbacks** — every progress reports `done`, `cancelled` or `failed` back to the code that started it, on the client and on the server.
- **Pause and resume** — manual or automatic after a delay (timed, controlled and stepped — a loading never pauses).
- **Bar directions** — left-right, right-left, edges-center, center-edges; **circle directions** — clockwise, counter-clockwise, and symmetric dual-side sweeps (bottom-top, top-bottom).
- **3 screen positions** for progress, **9 positions** for loading.
- **Per-family configuration** — four config files so each family has its own defaults, pushed to the NUI at runtime.
- **CSS-only animation** — transitions and keyframes, zero JavaScript per frame.
- **i18n pipeline** — the server language is pushed to the NUI at runtime.

## Dependencies

| Resource | Required | Purpose |
|---|---|---|
| [`siku_core`](https://github.com/siku-project/siku_core) | Yes | Framework core: dependency guard and version check. |

`siku_core` must be started **before** `siku_progress`.

## Installation

### From a release (recommended)

Download the latest [release](https://github.com/siku-project/siku_progress/releases) zip and extract it into your server resources folder. The zip ships with the NUI **already built** (`web/dist` only) — no build step, ready to run.

> The release does not include the NUI source code. If you want to customize the interface, install from source instead.

### From source

The repository contains the full NUI source but **no build** (`web/dist` is not versioned) — you must build it yourself:

```bash
git clone git@github.com:siku-project/siku_progress.git
cd siku_progress/web
bun install
bun run build
```

### server.cfg

```cfg
ensure siku_core
ensure siku_progress
```

## Configuration

All options live in `config/` and are documented inline. Each family has its own file — customize one without touching the others.

| File | Options |
|---|---|
| `config/progress.lua` | Timed defaults: `defaultColor`, `defaultDuration`, `defaultPosition`, `defaultBarDirection`, `defaultCircleDirection`, `defaultMode` (`fill` / `drain`), `defaultBackground`, `defaultLabelPosition`, `defaultCircleSize`, `defaultShowPercentage`, `defaultShowTime` |
| `config/loading.lua` | Loading defaults: `defaultColor`, `defaultCycle`, `defaultPosition`, `defaultBarDirection`, `defaultCircleDirection`, `defaultBackground`, `defaultLabelPosition`, `defaultCircleSize`, `defaultShowTime` |
| `config/control.lua` | Controlled defaults: visuals plus `defaultBehavior` (`direct` / `hold` / `pulse`), `defaultRiseRate`, `defaultFallRate`, `defaultPulseGain`, `defaultStartAt`, `defaultCompleteAtFull`, `defaultFailAtEmpty` |
| `config/steps.lua` | Stepped defaults: `defaultColor`, `defaultPosition`, `defaultBackground`, `defaultShowCounter` |
| `config/translation.lua` | `language` (`fr` / `en`) |

Every default only applies when the payload does not specify the field — an explicit payload value always wins.

## API

### Starting a progress

```lua
-- Timed bar
exports.siku_progress:Start({
  label = 'Searching the vehicle',   -- advised under 40 characters
  icon = 'mdi-magnify',              -- optional, left of the label
  duration = 8000,                   -- ms
  color = '#a1cbe8',                 -- any hex color
  direction = 'left-right',          -- 'left-right' | 'right-left' | 'edges-center' | 'center-edges'
  mode = 'fill',                     -- 'fill' | 'drain'
  showPercentage = true,
  showTime = true,                   -- stacked under the percentage
  position = 'bottom-center',        -- 'top-center' | 'center' | 'bottom-center'
  background = true,                 -- Ice Glass panel behind the bar
}, function(result)
  -- result: 'done' | 'cancelled' | 'failed'
end)

-- Timed circle
exports.siku_progress:Start({
  shape = 'circle',
  label = 'Reviving',
  labelPosition = 'bottom',          -- 'top' | 'bottom'
  direction = 'bottom-top',          -- 'clockwise' | 'counter-clockwise' | 'bottom-top' | 'top-bottom'
  size = 120,                        -- 64..156, center text hidden below 96
  showPercentage = true,             -- exclusive with showTime on a circle
})

-- Loading (indeterminate) — ends on Stop(), Cancel() or Clear()
exports.siku_progress:Start({
  indeterminate = true,
  label = 'Connecting',
  duration = 1400,                   -- one cycle in ms, lower is faster
  showTime = true,                   -- honest estimated time, prefixed with ~
  position = 'bottom-right',         -- any of the 9 positions
})

-- Controlled — driven from code
exports.siku_progress:Start({
  label = 'Lockpicking',
  control = {
    mode = 'hold',                   -- 'direct' | 'hold' | 'pulse'
    riseRate = 0.35,                 -- gauge fraction per second while held
    fallRate = 0.25,                 -- decay per second
    startAt = 0.2,                   -- 0..1
    completeAtFull = true,           -- 100% ends in success
    failAtEmpty = true,              -- 0% ends in failure
  },
}, onFinish)

-- Stepped — validated from your own conditions
exports.siku_progress:Start({
  steps = 4,                         -- 1..10 chunks
  label = 'Assembling',
  showPercentage = true,             -- shows the 2/4 counter
}, onFinish)
```

Every field is optional and validated: an invalid value falls back to the family's configured default. Starting a new progress replaces the active one, which is settled as `cancelled`.

### Client exports

| Export | Description |
|---|---|
| `Start(data, onFinish?)` | Starts a progress. `onFinish(result)` is invoked once with `'done'`, `'cancelled'` or `'failed'`. |
| `Stop()` | Ends the active progress in success — the gauge snaps to full, steps to `n/n`. |
| `Cancel()` | Ends it as cancelled (frozen fade). |
| `Fail()` | Ends it in failure (red glitch). No effect on a loading. |
| `Pause(autoResumeMs?)` / `Resume()` | Pauses / resumes. No effect on a loading. |
| `SetValue(value)` | Controlled `direct`: sets the gauge, `0..1`. |
| `SetHeld(held)` | Controlled `hold`: whether the gauge is currently held. |
| `Pulse()` | Controlled `pulse`: pushes the gauge up once. |
| `CompleteStep()` | Stepped: validates the next chunk. |
| `SetSteps(count)` | Stepped: sets the validated count (backward allowed). |
| `Clear()` | Wipes the active progress instantly, settled as `cancelled`. |
| `IsActive()` | Whether a progress is currently active. |

The local event `siku_progress:client:finished` is also triggered with the result for observers.

### Server exports

The same surface with the player source as first argument: `Start(source, data, onFinish?)`, `Stop(source)`, `Cancel(source)`, `Fail(source)`, `Pause(source, autoResumeMs?)`, `Resume(source)`, `SetValue(source, value)`, `SetHeld(source, held)`, `Pulse(source)`, `CompleteStep(source)`, `SetSteps(source, count)`, `Clear(source)`, `IsActive(source)`.

Server-initiated progress is tracked per player with a token: the outcome is correlated on return, a stale or forged report is ignored, and a disconnection settles the pending progress as `cancelled`. `IsActive(source)` only reflects server-initiated progress.

> The outcome reported by a client is, by nature, client-side information. For gameplay-critical rewards, validate server-side what the progress was guarding.

### Events

The `siku_progress:client:*` events are `RegisterNetEvent` handlers — usable from the server (`TriggerClientEvent`) or locally from another client resource (`TriggerEvent`): `start`, `stop`, `cancel`, `fail`, `pause`, `resume`, `setValue`, `setHeld`, `pulse`, `completeStep`, `setSteps`, `clear`. Payloads match the export signatures.

### Icons

Icons are resolved from a curated SVG set (`web/src/utils/icons.ts`, tree-shaken from `@mdi/js`). An unknown name falls back to the default progress icon. Supporting a new icon is a one-line addition to the map, followed by a rebuild.

## Endings

| Ending | Trigger | Visual |
|---|---|---|
| `done` | Duration elapsed, 100% reached, all steps validated, or `Stop()` | The gauge snaps to full (180 ms), then a glow bloom with a subtle scale pulse. A stepped bar plays a green sequential wave. A loading fills green instantly. |
| `cancelled` | `Cancel()`, `Clear()`, or replacement by a new progress | Frozen at its current value, desaturated, quick fade. |
| `failed` | `Fail()`, or a controlled gauge reaching 0% with `failAtEmpty` | Turns red, violent glitch with chromatic ghosts, fade out. |

## Translations

The NUI currently renders no static text — labels come from the calling resource, values are numeric. The full i18n pipeline (vue-i18n, `translations/fr.lua` / `translations/en.lua`, runtime push) is nonetheless wired: adding a translated string later requires no structural work.

## Development

The NUI lives in `web/` (Vue 3, Pinia, Tailwind, Vite — built with [bun](https://bun.sh)).

```bash
cd web
bun install
bun dev          # dev playground with a full progress control panel
bun run build    # production build → web/dist
bun run check    # format + type-check + lint
```

In development the app boots into a playground covering every family, option and ending, with presets and interactive controls; in production only the progress view ships.

```
siku_progress/
├── client/            # NUI bridge, exports, completion tracking
├── server/            # dependency guard, per-player tracking, exports
├── shared/utils/      # locale loading
├── config/            # per-family configuration
├── translations/      # fr / en
└── web/               # Vue 3 NUI
```

## Credits

Part of the [SIKU project](https://github.com/siku-project) — © Siku Studio.
