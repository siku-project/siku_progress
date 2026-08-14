<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ProgressCenter from '@/components/progress/ProgressCenter.vue'
import { useProgressStore } from '@/stores/progress'
import type { ProgressInput } from '@/utils/progress'
import type { ProgressConfigInput } from '@/utils/progressConfig'
import { sendNuiCallback } from '@/utils/nui'
import { applyLocale } from '@/utils/locale'
import type { LocalePayload } from '@/utils/locale'

const store = useProgressStore()
const { phase } = storeToRefs(store)

interface ProgressNuiMessage {
  action?: string
  config?: ProgressConfigInput
  locale?: LocalePayload
  progress?: ProgressInput
  token?: number
  autoResume?: number
  value?: number
  held?: boolean
  count?: number
}

let activeToken: number | null = null

const handleMessage = (event: MessageEvent): void => {
  const payload = event.data as ProgressNuiMessage | null
  if (!payload || typeof payload !== 'object' || typeof payload.action !== 'string') {
    return
  }
  const action = payload.action
  if (action === 'siku_progress:nui:start' && payload.progress) {
    activeToken = typeof payload.token === 'number' ? payload.token : null
    store.start(payload.progress)
  } else if (action === 'siku_progress:nui:stop') {
    store.stop()
  } else if (action === 'siku_progress:nui:cancel') {
    store.cancel()
  } else if (action === 'siku_progress:nui:fail') {
    store.fail()
  } else if (action === 'siku_progress:nui:pause') {
    store.pause(typeof payload.autoResume === 'number' ? payload.autoResume : undefined)
  } else if (action === 'siku_progress:nui:resume') {
    store.resume()
  } else if (action === 'siku_progress:nui:setValue') {
    if (typeof payload.value === 'number') {
      store.setValue(payload.value)
    }
  } else if (action === 'siku_progress:nui:setHeld') {
    store.setHeld(payload.held === true)
  } else if (action === 'siku_progress:nui:pulse') {
    store.pulse()
  } else if (action === 'siku_progress:nui:completeStep') {
    store.completeStep()
  } else if (action === 'siku_progress:nui:setSteps') {
    if (typeof payload.count === 'number') {
      store.setSteps(payload.count)
    }
  } else if (action === 'siku_progress:nui:clear') {
    activeToken = null
    store.clear()
  } else if (action === 'siku_progress:nui:setConfig' && payload.config) {
    store.setConfig(payload.config)
  } else if (action === 'siku_progress:nui:setLocale' && payload.locale) {
    applyLocale(payload.locale)
  }
}

watch(phase, (next, previous) => {
  if (previous !== 'running' || next === 'running' || activeToken === null) {
    return
  }
  const token = activeToken
  activeToken = null
  sendNuiCallback('siku_progress:nui:finished', { token, result: next })
})

onMounted(() => {
  window.addEventListener('message', handleMessage)
  sendNuiCallback('siku_progress:nui:ready')
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0">
    <ProgressCenter />
  </div>
</template>
