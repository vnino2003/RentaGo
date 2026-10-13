<script setup lang="ts">
import { computed, ref, defineAsyncComponent, watch } from 'vue'
import { IonModal, IonContent, IonIcon } from '@ionic/vue'
import {
  expandOutline,
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons'
import type { Car } from '../../types/car'
const props = defineProps<{ car: Car }>()
const Vehicle3DViewer = defineAsyncComponent(() => import('./Vehicle3DViewer.vue'))
const mode = ref<'photos' | '3d'>('photos')
const viewerKey = ref(0)
const index = ref(0),
  fullscreen = ref(false)
watch(
  () => props.car.id,
  () => {
    mode.value = 'photos'
    index.value = 0
    fullscreen.value = false
  },
)
const images = computed(() =>
  props.car.id === 'mitsubishi-montero-sport'
    ? [
        { url: props.car.imageUrl, label: 'Exterior' },
        { url: '/vehicles/montero.webp', label: 'Front view' },
        { url: '/vehicles/montero-interior.webp', label: 'Interior' },
      ]
    : props.car.id === 'tesla-model-3'
      ? [
          { url: props.car.imageUrl, label: 'Exterior' },
          { url: '/vehicles/coastal-tesla.jpg', label: 'Full landscape' },
        ]
      : [{ url: props.car.imageUrl, label: 'Exterior' }],
)
const selected = computed(() => images.value[index.value] || images.value[0]!)
function move(direction: number) {
  index.value = (index.value + direction + images.value.length) % images.value.length
}
</script>
<template>
  <section class="vehicle-gallery">
    <div class="gallery-toolbar">
      <div class="segmented" role="group" aria-label="Vehicle viewing mode">
        <button
          :class="{ active: mode === 'photos' }"
          :aria-pressed="mode === 'photos'"
          @click="mode = 'photos'"
        >
          Photos
        </button>
        <button
          :class="{ active: mode === '3d' }"
          :aria-pressed="mode === '3d'"
          @click="mode = '3d'"
        >
          3D view
        </button>
      </div>
      <button
        class="icon-button"
        aria-label="Open fullscreen gallery"
        title="Fullscreen"
        @click="fullscreen = true"
      >
        <ion-icon :icon="expandOutline" />
      </button>
    </div>
    <template v-if="mode === '3d'">
      <div v-if="car.model3d" class="model-stage">
        <Vehicle3DViewer
          v-if="!fullscreen"
          :key="viewerKey"
          :src="car.model3d.url"
          :name="car.name"
        />
      </div>
      <div v-else class="model-unavailable">
        <img :src="car.imageUrl" :alt="car.name" />
        <p>3D model not available for this vehicle yet.</p>
        <button class="text-link" @click="mode = 'photos'">View photos</button>
      </div>
      <div v-if="car.model3d" class="model-credit">
        <p>{{ car.model3d.description }}</p>
        <span>
          Model by
          <a :href="car.model3d.sourceUrl" target="_blank" rel="noopener noreferrer">
            {{ car.model3d.author }}
          </a>
          /
          <a :href="car.model3d.licenseUrl" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
        </span>
        <button class="text-link" @click="viewerKey++">Reload 3D</button>
      </div>
    </template>
    <div v-else class="gallery-stage">
      <Transition name="gallery" mode="out-in">
        <img
          :key="selected.url"
          :src="selected.url"
          :alt="`${car.brand} ${car.name}, ${selected.label}`"
        />
      </Transition>
      <div class="gallery-counter">
        {{ String(index + 1).padStart(2, '0') }} /
        {{ String(images.length).padStart(2, '0') }}
        <span>{{ selected.label }}</span>
      </div>
      <div v-if="images.length > 1" class="gallery-arrows">
        <button class="icon-button" aria-label="Previous image" @click="move(-1)">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <button class="icon-button" aria-label="Next image" @click="move(1)">
          <ion-icon :icon="chevronForwardOutline" />
        </button>
      </div>
    </div>
    <div v-if="mode === 'photos'" class="gallery-thumbnails">
      <button
        v-for="(item, i) in images"
        :key="item.url"
        :class="{ selected: index === i }"
        :aria-label="`View ${item.label}`"
        :aria-pressed="index === i"
        @click="index = i"
      >
        <img :src="item.url" :alt="item.label" />
        <span>{{ item.label }}</span>
      </button>
    </div>
    <p v-if="mode === 'photos'" class="gallery-caption">
      Representative model imagery. Actual rental trim and colour may vary.
    </p>
    <ion-modal :is-open="fullscreen" @did-dismiss="fullscreen = false">
      <ion-content>
        <div class="fullscreen-gallery" @keydown.left="move(-1)" @keydown.right="move(1)">
          <button
            class="icon-button close-gallery"
            aria-label="Close fullscreen gallery"
            @click="fullscreen = false"
          >
            <ion-icon :icon="closeOutline" />
          </button>
          <Vehicle3DViewer
            v-if="fullscreen && mode === '3d' && car.model3d"
            :src="car.model3d.url"
            :name="car.name"
          />
          <img v-else :src="selected.url" :alt="`${car.name} ${selected.label}`" />
          <div v-if="mode === 'photos'" class="gallery-controls">
            <button
              class="icon-button"
              :disabled="images.length === 1"
              aria-label="Previous fullscreen image"
              @click="move(-1)"
            >
              <ion-icon :icon="chevronBackOutline" />
            </button>
            <span>{{ selected.label }}</span>
            <button
              class="icon-button"
              :disabled="images.length === 1"
              aria-label="Next fullscreen image"
              @click="move(1)"
            >
              <ion-icon :icon="chevronForwardOutline" />
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </section>
</template>
<style scoped>
.model-stage {
  height: 460px;
  width: 100%;
}
.model-credit {
  padding: 14px 0;
  color: var(--color-muted, #66736e);
  font-size: 12px;
  line-height: 1.6;
}
.model-credit p {
  margin: 0 0 4px;
}
.model-credit .text-link {
  margin-left: 16px;
  font-size: 12px;
}
.model-unavailable {
  min-height: 360px;
  text-align: center;
  padding: 24px;
  background: #f2f4f3;
}
.model-unavailable img {
  height: 230px;
  width: 100%;
  object-fit: contain;
}
.close-gallery {
  z-index: 5;
}
.fullscreen-gallery :deep(.vehicle-3d) {
  height: 100%;
  min-height: 70vh;
}
@media (max-width: 600px) {
  .model-stage {
    height: 360px;
  }
}
</style>
