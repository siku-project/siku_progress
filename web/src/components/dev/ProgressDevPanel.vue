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
  CIRCLE_PERCENT_MIN_SIZE,
  DEFAULT_COLOR,
  LABEL_ADVISED_MAX,
} from '@/utils/progress'
import type {
  LabelPosition,
  ProgressDirection,
  ProgressMode,
  ProgressShape,
} from '@/utils/progress'

const store = useProgressStore()

const kind = ref<'timed' | 'loading'>('timed')
const shape = ref<ProgressShape>('bar')
const label = ref('Fouille du véhicule…')
const labelPosition = ref<LabelPosition>('bottom')
const direction = ref<ProgressDirection>('left-right')
const mode = ref<ProgressMode>('fill')
const duration = ref(5000)
const color = ref(DEFAULT_COLOR)
const showPercentage = ref(true)
const background = ref(true)
const circleSize = ref(CIRCLE_DEFAULT_SIZE)

const KIND_OPTIONS = [
  { value: 'timed', label: 'Progression' },
  { value: 'loading', label: 'Chargement' },
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

const COLOR_PRESETS = ['#a1cbe8', '#ecf6ff', '#34d3a6', '#f0be60', '#f46e7a']

const isCircle = computed(() => shape.value === 'circle')
const isLoading = computed(() => kind.value === 'loading')

const LOADING_CIRCLE_DIRECTIONS = [
  { value: 'clockwise', label: 'Horaire' },
  { value: 'counter-clockwise', label: 'Anti-horaire' },
]

const percentUnavailable = computed(
  () => isCircle.value && circleSize.value < CIRCLE_PERCENT_MIN_SIZE,
)

const sizeHint = `${CIRCLE_MIN_SIZE}–${CIRCLE_MAX_SIZE} px · % masqué sous ${CIRCLE_PERCENT_MIN_SIZE}`

const directionOptions = computed(() => {
  if (isCircle.value) {
    return isLoading.value ? LOADING_CIRCLE_DIRECTIONS : CIRCLE_DIRECTION_OPTIONS
  }
  return BAR_DIRECTION_OPTIONS
})

const showDirection = computed(() => !isLoading.value || isCircle.value)

const durationLabel = computed(() => (isLoading.value ? 'Cycle (ms)' : 'Durée (ms)'))

watch([shape, kind], ([shapeValue]) => {
  direction.value = shapeValue === 'circle' ? 'clockwise' : 'left-right'
})

const labelHint = computed(() => `${label.value.length}/${LABEL_ADVISED_MAX} conseillés`)
const labelHintTone = computed(() =>
  label.value.length > LABEL_ADVISED_MAX ? ('warning' as const) : ('muted' as const),
)

const start = (): void => {
  store.start({
    indeterminate: isLoading.value,
    shape: shape.value,
    label: label.value,
    labelPosition: labelPosition.value,
    direction: direction.value,
    mode: mode.value,
    duration: duration.value,
    color: color.value,
    showPercentage: showPercentage.value,
    background: background.value,
    size: circleSize.value,
  })
}

const cancel = (): void => {
  store.cancel()
}

const stop = (): void => {
  store.stop()
}

const presetSearch = (): void => {
  store.start({
    label: 'Fouille en cours…',
    direction: 'left-right',
    mode: 'fill',
    duration: 5000,
    showPercentage: true,
  })
}

const presetLockpick = (): void => {
  store.start({
    label: 'Crochetage',
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
  })
}

const presetLoadingCircle = (): void => {
  store.start({
    indeterminate: true,
    shape: 'circle',
    label: 'Recherche',
    labelPosition: 'bottom',
    size: 96,
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

        <DevField v-if="showDirection" label="Direction">
          <DevToggleGroup v-model="direction" :options="directionOptions" :columns="2" />
        </DevField>

        <DevField v-if="!isLoading" label="Mode">
          <DevToggleGroup v-model="mode" :options="MODE_OPTIONS" />
        </DevField>

        <DevField label="Texte" :hint="labelHint" :hint-tone="labelHintTone">
          <input v-model="label" type="text" />
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
          <DevField :label="durationLabel">
            <input v-model.number="duration" type="number" min="100" step="500" />
          </DevField>

          <DevField label="Couleur (hex)">
            <input v-model="color" type="text" spellcheck="false" />
          </DevField>
        </div>

        <DevSwatches v-model="color" :colors="COLOR_PRESETS" />

        <DevCheck
          v-if="!isLoading"
          v-model="showPercentage"
          label="Afficher le pourcentage"
          :disabled="percentUnavailable"
        />

        <DevCheck v-if="!isCircle" v-model="background" label="Fond de panneau" />

        <div class="panel__actions">
          <DevButton variant="primary" @click="start">Lancer</DevButton>
          <DevButton @click="stop">Terminer</DevButton>
          <DevButton @click="cancel">Annuler</DevButton>
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
