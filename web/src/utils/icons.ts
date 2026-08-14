import {
  mdiCheck,
  mdiCodeTags,
  mdiMonitorOff,
  mdiProgressClock,
  mdiViewDashboardOutline,
} from '@mdi/js'

export const DEFAULT_ICON_PATH = mdiProgressClock

const ICON_PATHS: Record<string, string> = {
  'mdi-check': mdiCheck,
  'mdi-code-tags': mdiCodeTags,
  'mdi-monitor-off': mdiMonitorOff,
  'mdi-progress-clock': mdiProgressClock,
  'mdi-view-dashboard-outline': mdiViewDashboardOutline,
}

export const resolveIcon = (name: string | undefined): string | undefined => {
  if (!name) {
    return undefined
  }
  return ICON_PATHS[name] ?? DEFAULT_ICON_PATH
}
