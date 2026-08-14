<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import IcePanel from '@/components/ui/IcePanel.vue'
import ProgressCenter from '@/components/progress/ProgressCenter.vue'
import DevField from '@/components/dev/controls/DevField.vue'
import DevToggleGroup from '@/components/dev/controls/DevToggleGroup.vue'
import DevSwatches from '@/components/dev/controls/DevSwatches.vue'
import DevCheck from '@/components/dev/controls/DevCheck.vue'
import DevButton from '@/components/dev/controls/DevButton.vue'
import { useProgressStore } from '@/stores/progress'
import {
  CIRCLE_DEFAULT_SIZE,
  CIRCLE_MAX_SIZE,
  CIRCLE_MIN_SIZE,
  CIRCLE_CENTER_MIN_SIZE,
  DEFAULT_COLOR,
  LABEL_ADVISED_MAX,
} from '@/utils/progress'
import type {
  ControlMode,
  LabelPosition,
  ProgressDirection,
  ProgressMode,
  ProgressPosition,
  ProgressShape,
} from '@/utils/progress'

const store = useProgressStore()

const kind = ref<'timed' | 'loading' | 'controlled'>('timed')
const controlMode = ref<ControlMode>('hold')
const riseRate = ref(0.35)
const fallRate = ref(0.25)
const pulseGain = ref(0.08)
const failAtEmpty = ref(false)
const directValue = ref(0)
const shape = ref<ProgressShape>('bar')
const label = ref('Fouille du véhicule…')
const icon = ref('')
const labelPosition = ref<LabelPosition>('bottom')
const direction = ref<ProgressDirection>('left-right')
const mode = ref<ProgressMode>('fill')
const duration = ref(5000)
const color = ref(DEFAULT_COLOR)
const showPercentage = ref(true)
const showTime = ref(false)
const position = ref<ProgressPosition>('bottom-center')
const background = ref(true)
const circleSize = ref(CIRCLE_DEFAULT_SIZE)

const KIND_OPTIONS = [
  { value: 'timed', label: 'Progression' },
  { value: 'loading', label: 'Chargement' },
  { value: 'controlled', label: 'Piloté' },
]

const CONTROL_MODE_OPTIONS = [
  { value: 'direct', label: 'Direct' },
  { value: 'hold', label: 'Maintien' },
  { value: 'pulse', label: 'Impulsions' },
]

const SHAPE_OPTIONS = [
  { value: 'bar', label: 'Barre' },
  { value: 'circle', label: 'Cercle' },
]

const BAR_DIRECTION_OPTIONS = [
  { value: 'left-right', label: 'Gauche → droite' },
  { value: 'right-left', label: 'Droite → gauche' },
  { value: 'edges-center', label: 'Bords → centre' },
  { value: 'center-edges', label: 'Centre → bords' },
]

const CIRCLE_DIRECTION_OPTIONS = [
  { value: 'clockwise', label: 'Horaire' },
  { value: 'counter-clockwise', label: 'Anti-horaire' },
  { value: 'bottom-top', label: 'Bas → haut' },
  { value: 'top-bottom', label: 'Haut → bas' },
]

const MODE_OPTIONS = [
  { value: 'fill', label: 'Remplissage' },
  { value: 'drain', label: 'Vidage' },
]

const LABEL_POSITION_OPTIONS = [
  { value: 'top', label: 'Au-dessus' },
  { value: 'bottom', label: 'En dessous' },
]

const TIMED_POSITION_OPTIONS = [
  { value: 'top-center', label: 'Haut' },
  { value: 'center', label: 'Centre' },
  { value: 'bottom-center', label: 'Bas' },
]

const LOADING_POSITION_OPTIONS = [
  { value: 'top-left', label: 'Haut G' },
  { value: 'top-center', label: 'Haut' },
  { value: 'top-right', label: 'Haut D' },
  { value: 'center-left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'center-right', label: 'Droite' },
  { value: 'bottom-left', label: 'Bas G' },
  { value: 'bottom-center', label: 'Bas' },
  { value: 'bottom-right', label: 'Bas D' },
]

const COLOR_PRESETS = ['#a1cbe8', '#ecf6ff', '#34d3a6', '#f0be60', '#f46e7a']

const isCircle = computed(() => shape.value === 'circle')
const isLoading = computed(() => kind.value === 'loading')
const isControlled = computed(() => kind.value === 'controlled')

const LOADING_CIRCLE_DIRECTIONS = [
  { value: 'clockwise', label: 'Horaire' },
  { value: 'counter-clockwise', label: 'Anti-horaire' },
]

const LOADING_BAR_DIRECTIONS = [
  { value: 'left-right', label: 'Depuis la gauche' },
  { value: 'right-left', label: 'Depuis la droite' },
]

const centerUnavailable = computed(
  () => isCircle.value && circleSize.value < CIRCLE_CENTER_MIN_SIZE,
)

const timeLabel = computed(() =>
  isLoading.value ? 'Afficher le temps estimé' : 'Afficher le temps restant',
)

const sizeHint = `${CIRCLE_MIN_SIZE}–${CIRCLE_MAX_SIZE} px · centre masqué sous ${CIRCLE_CENTER_MIN_SIZE}`

const directionOptions = computed(() => {
  if (isCircle.value) {
    return isLoading.value ? LOADING_CIRCLE_DIRECTIONS : CIRCLE_DIRECTION_OPTIONS
  }
  return isLoading.value ? LOADING_BAR_DIRECTIONS : BAR_DIRECTION_OPTIONS
})

const durationLabel = computed(() => (isLoading.value ? 'Cycle (ms)' : 'Durée (ms)'))

const positionOptions = computed(() =>
  isLoading.value ? LOADING_POSITION_OPTIONS : TIMED_POSITION_OPTIONS,
)

watch([shape, kind], ([shapeValue]) => {
  direction.value = shapeValue === 'circle' ? 'clockwise' : 'left-right'
})

watch(kind, (value) => {
  if (
    value === 'timed' &&
    !TIMED_POSITION_OPTIONS.some((option) => option.value === position.value)
  ) {
    position.value = 'bottom-center'
  }
})

watch(showTime, (value) => {
  if (value && isCircle.value && showPercentage.value) {
    showPercentage.value = false
  }
})

watch(showPercentage, (value) => {
  if (value && isCircle.value && showTime.value) {
    showTime.value = false
  }
})

const labelHint = computed(() => `${label.value.length}/${LABEL_ADVISED_MAX} conseillés`)
const labelHintTone = computed(() =>
  label.value.length > LABEL_ADVISED_MAX ? ('warning' as const) : ('muted' as const),
)

const start = (): void => {
  directValue.value = 0
  store.start({
    indeterminate: isLoading.value,
    control: isControlled.value
      ? {
          mode: controlMode.value,
          riseRate: riseRate.value,
          fallRate: fallRate.value,
          pulseGain: pulseGain.value,
          failAtEmpty: failAtEmpty.value,
        }
      : undefined,
    shape: shape.value,
    label: label.value,
    icon: icon.value || undefined,
    labelPosition: labelPosition.value,
    direction: direction.value,
    mode: mode.value,
    duration: duration.value,
    color: color.value,
    showPercentage: showPercentage.value,
    showTime: showTime.value,
    background: background.value,
    size: circleSize.value,
    position: position.value,
  })
}

const cancel = (): void => {
  store.cancel()
}

const stop = (): void => {
  store.stop()
}

const fail = (): void => {
  store.fail()
}

const autoResume = ref(0)

const pause = (): void => {
  store.pause(autoResume.value > 0 ? autoResume.value : undefined)
}

const resume = (): void => {
  store.resume()
}

const holdStart = (): void => {
  store.setHeld(true)
}

const holdEnd = (): void => {
  store.setHeld(false)
}

const sendPulse = (): void => {
  store.pulse()
}

const sendDirect = (): void => {
  store.setValue(directValue.value / 100)
}

const presetSearch = (): void => {
  store.start({
    label: 'Fouille en cours…',
    icon: 'mdi-magnify',
    direction: 'left-right',
    mode: 'fill',
    duration: 5000,
    showPercentage: true,
    showTime: true,
  })
}

const presetLockpick = (): void => {
  store.start({
    label: 'Crochetage',
    icon: 'mdi-key',
    direction: 'edges-center',
    mode: 'fill',
    duration: 8000,
    color: '#ecf6ff',
  })
}

const presetHold = (): void => {
  store.start({
    label: 'Tenez la position',
    direction: 'center-edges',
    mode: 'drain',
    duration: 4000,
    color: '#f0be60',
    showPercentage: true,
  })
}

const presetCircle = (): void => {
  store.start({
    shape: 'circle',
    label: 'Réanimation',
    icon: 'mdi-heart-pulse',
    labelPosition: 'bottom',
    direction: 'clockwise',
    mode: 'fill',
    duration: 6000,
    showPercentage: true,
  })
}

const presetCircleDrain = (): void => {
  store.start({
    shape: 'circle',
    label: 'Oxygène',
    labelPosition: 'top',
    direction: 'bottom-top',
    mode: 'drain',
    duration: 5000,
    color: '#f0be60',
    showPercentage: true,
  })
}

const presetCircleMini = (): void => {
  store.start({
    shape: 'circle',
    direction: 'clockwise',
    mode: 'fill',
    duration: 3000,
    size: 64,
    showPercentage: true,
  })
}

const presetLoadingBar = (): void => {
  store.start({
    indeterminate: true,
    label: 'Connexion au serveur…',
    icon: 'mdi-wifi',
    showTime: true,
  })
}

const presetLoadingCircle = (): void => {
  store.start({
    indeterminate: true,
    shape: 'circle',
    label: 'Recherche',
    labelPosition: 'bottom',
    size: 96,
    showTime: true,
  })
}

const presetMinimal = (): void => {
  store.start({
    direction: 'left-right',
    mode: 'fill',
    duration: 2500,
    background: false,
  })
}
</script>

<template>
  <ProgressCenter />

  <div class="panel">
    <IcePanel variant="primary" class="panel__box">
      <div class="panel__body">
        <p class="ice-title panel__title text-[10px]">Progression — Dev</p>

        <DevField label="Type">
          <DevToggleGroup v-model="kind" :options="KIND_OPTIONS" />
        </DevField>

        <DevField label="Forme">
          <DevToggleGroup v-model="shape" :options="SHAPE_OPTIONS" />
        </DevField>

        <DevField label="Direction">
          <DevToggleGroup v-model="direction" :options="directionOptions" :columns="2" />
        </DevField>

        <DevField v-if="!isLoading" label="Mode">
          <DevToggleGroup v-model="mode" :options="MODE_OPTIONS" />
        </DevField>

        <DevField label="Texte" :hint="labelHint" :hint-tone="labelHintTone">
          <input v-model="label" type="text" />
        </DevField>

        <DevField label="Icône (mdi)">
          <input v-model="icon" type="text" placeholder="mdi-magnify" spellcheck="false" />
        </DevField>

        <DevField label="Position">
          <DevToggleGroup v-model="position" :options="positionOptions" :columns="3" />
        </DevField>

        <DevField v-if="isCircle" label="Position du texte">
          <DevToggleGroup v-model="labelPosition" :options="LABEL_POSITION_OPTIONS" />
        </DevField>

        <DevField v-if="isCircle" label="Taille (px)" :hint="sizeHint">
          <input
            v-model.number="circleSize"
            type="number"
            :min="CIRCLE_MIN_SIZE"
            :max="CIRCLE_MAX_SIZE"
            step="4"
          />
        </DevField>

        <div class="panel__row">
          <DevField v-if="!isControlled" :label="durationLabel">
            <input v-model.number="duration" type="number" min="100" step="500" />
          </DevField>

          <DevField label="Couleur (hex)">
            <input v-model="color" type="text" spellcheck="false" />
          </DevField>
        </div>

        <template v-if="isControlled">
          <DevField label="Pilotage">
            <DevToggleGroup v-model="controlMode" :options="CONTROL_MODE_OPTIONS" />
          </DevField>

          <div class="panel__row">
            <DevField v-if="controlMode !== 'direct'" label="Montée (/s)">
              <input v-model.number="riseRate" type="number" min="0.05" step="0.05" />
            </DevField>

            <DevField v-if="controlMode !== 'direct'" label="Descente (/s)">
              <input v-model.number="fallRate" type="number" min="0" step="0.05" />
            </DevField>

            <DevField v-if="controlMode === 'pulse'" label="Gain/impulsion">
              <input v-model.number="pulseGain" type="number" min="0.01" step="0.01" />
            </DevField>
          </div>

          <DevCheck v-model="failAtEmpty" label="Échouer à 0 %" />
        </template>

        <DevSwatches v-model="color" :colors="COLOR_PRESETS" />

        <DevCheck
          v-if="!isLoading"
          v-model="showPercentage"
          label="Afficher le pourcentage"
          :disabled="centerUnavailable"
        />

        <DevCheck
          v-if="!isControlled"
          v-model="showTime"
          :label="timeLabel"
          :disabled="centerUnavailable"
        />

        <DevCheck v-if="!isCircle" v-model="background" label="Fond de panneau" />

        <div class="panel__actions">
          <DevButton variant="primary" @click="start">Lancer</DevButton>
          <DevButton @click="stop">Terminer</DevButton>
          <DevButton v-if="!isLoading" @click="fail">Échouer</DevButton>
          <DevButton @click="cancel">Annuler</DevButton>
        </div>

        <div v-if="isControlled" class="panel__actions">
          <DevButton
            v-if="controlMode === 'hold'"
            variant="primary"
            @pointerdown="holdStart"
            @pointerup="holdEnd"
            @pointerleave="holdEnd"
          >
            Maintenir
          </DevButton>
          <DevButton v-else-if="controlMode === 'pulse'" variant="primary" @click="sendPulse">
            Impulsion
          </DevButton>
          <input
            v-else
            v-model.number="directValue"
            class="panel__slider"
            type="range"
            min="0"
            max="100"
            step="1"
            @input="sendDirect"
          />
        </div>

        <div v-if="!isLoading" class="panel__row panel__row--end">
          <DevField label="Reprise auto (ms)" hint="0 = manuelle">
            <input v-model.number="autoResume" type="number" min="0" step="500" />
          </DevField>
          <DevButton @click="pause">Pause</DevButton>
          <DevButton @click="resume">Reprendre</DevButton>
        </div>

        <div class="ice-divider panel__divider"></div>

        <div class="panel__presets">
          <DevButton variant="ghost" @click="presetSearch">Fouille 5s</DevButton>
          <DevButton variant="ghost" @click="presetLockpick">Crochetage 8s</DevButton>
          <DevButton variant="ghost" @click="presetHold">Attente 4s</DevButton>
          <DevButton variant="ghost" @click="presetMinimal">Minimal 2,5s</DevButton>
          <DevButton variant="ghost" @click="presetCircle">Cercle 6s</DevButton>
          <DevButton variant="ghost" @click="presetCircleDrain">Oxygène 5s</DevButton>
          <DevButton variant="ghost" @click="presetCircleMini">Cercle mini 3s</DevButton>
          <DevButton variant="ghost" @click="presetLoadingBar">Chargement barre</DevButton>
          <DevButton variant="ghost" @click="presetLoadingCircle">Chargement cercle</DevButton>
        </div>
      </div>
    </IcePanel>
  </div>
</template>

<style scoped>
.panel {
  position: fixed;
  top: 50%;
  left: 2.5rem;
  z-index: 60;
  width: 320px;
  max-width: 90vw;
  transform: translateY(-50%);
}

.panel__box {
  max-height: 88vh;
  overflow-y: auto;
}

.panel__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
}

.panel__title {
  text-align: center;
  margin-bottom: 2px;
}

.panel__row {
  display: flex;
  gap: 12px;
}

.panel__row--end {
  align-items: flex-end;
}

.panel__slider {
  flex: 1 1 auto;
  accent-color: #6fa8d4;
  cursor: pointer;
}

.panel__actions {
  display: flex;
  gap: 8px;
}

.panel__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.panel__divider {
  height: 1px;
  width: 100%;
}
</style>
