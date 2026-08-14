<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import ProgressCenter from '@/components/progress/ProgressCenter.vue'
import { useProgressStore } from '@/stores/progress'
import type { ProgressConfigInput } from '@/stores/progress'
import { sendNuiCallback } from '@/utils/nui'
import { applyLocale } from '@/utils/locale'
import type { LocalePayload } from '@/utils/locale'

const store = useProgressStore()

interface ProgressNuiMessage {
  action?: string
  config?: ProgressConfigInput
  locale?: LocalePayload
}

const handleMessage = (event: MessageEvent): void => {
  const payload = event.data as ProgressNuiMessage | null
  if (!payload || typeof payload !== 'object') {
    return
  }
  if (payload.action === 'siku_progress:nui:setConfig' && payload.config) {
    store.setConfig(payload.config)
  } else if (payload.action === 'siku_progress:nui:setLocale' && payload.locale) {
    applyLocale(payload.locale)
  }
}

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
