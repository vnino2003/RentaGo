<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { IonIcon } from '@ionic/vue'
import { cloudUploadOutline, closeOutline, documentTextOutline } from 'ionicons/icons'
import type { DocumentPreview } from '../domain/rental'
const props = defineProps<{
  label: string
  kind: 'license' | 'identity' | 'selfie'
  disabled?: boolean
}>()
const model = defineModel<DocumentPreview>()
const progress = ref(0),
  error = ref(''),
  drag = ref(false),
  loading = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
function clear() {
  if (model.value?.url.startsWith('blob:')) URL.revokeObjectURL(model.value.url)
  model.value = undefined
}
async function upload(file?: File) {
  if (props.disabled || loading.value || !file) return
  error.value = ''
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    error.value = 'Choose a JPG, PNG or WebP image under 5 MB.'
    return
  }
  try {
    const bitmap = await createImageBitmap(file)
    bitmap.close()
  } catch {
    error.value = 'This file could not be read as an image. Choose another image.'
    return
  }
  clear()
  progress.value = 0
  loading.value = true
  timer = setInterval(() => {
    progress.value += 25
    if (progress.value >= 100) {
      clearInterval(timer)
      model.value = {
        name: file.name,
        url: URL.createObjectURL(file),
        sample: false,
      }
      loading.value = false
    }
  }, 150)
}
function sample() {
  if (props.disabled || loading.value) return
  clear()
  model.value = {
    name: `Sample ${props.label.toLowerCase()}`,
    url: '',
    sample: true,
  }
  progress.value = 100
  error.value = ''
}
function drop(e: DragEvent) {
  e.preventDefault()
  drag.value = false
  upload(e.dataTransfer?.files[0])
}
onBeforeUnmount(() => clearInterval(timer))
</script>
<template>
  <div class="upload-block">
    <div class="upload-heading">
      <h3>{{ label }}</h3>
      <button
        v-if="model && !disabled"
        class="icon-button"
        type="button"
        :aria-label="`Remove ${label}`"
        :title="`Remove ${label}`"
        @click="clear"
      >
        <ion-icon :icon="closeOutline" />
      </button>
    </div>
    <div
      class="dropzone"
      :class="{ dragging: drag }"
      @dragover.prevent="drag = true"
      @dragleave="drag = false"
      @drop="drop"
    >
      <template v-if="model">
        <img v-if="model.url" :src="model.url" :alt="`${label} local preview`" />
        <div v-else class="sample-document">
          <ion-icon :icon="documentTextOutline" />
          <strong>SAMPLE ONLY</strong>
          <span>{{ label }}</span>
          <small>Alex Santos / Fictional information</small>
        </div>
        <span class="upload-filename">{{ model.name }}</span>
      </template>
      <template v-else>
        <ion-icon :icon="cloudUploadOutline" />
        <strong>{{ loading ? 'Preparing preview...' : 'Choose or drop an image' }}</strong>
        <small>JPG, PNG or WebP / up to 5 MB</small>
        <label class="upload-target">
          <span class="sr-only">{{ label }} image</span>
          <input
            type="file"
            :aria-label="`${label} image`"
            accept="image/jpeg,image/png,image/webp"
            :capture="kind === 'selfie' ? 'user' : undefined"
            :disabled="disabled || loading"
            @change="upload(($event.target as HTMLInputElement).files?.[0])"
          />
        </label>
      </template>
    </div>
    <progress
      v-if="loading"
      :value="progress"
      max="100"
      :aria-label="`${label} preview progress`"
    />
    <button
      v-if="!model"
      type="button"
      class="text-link"
      :disabled="disabled || loading"
      @click="sample"
    >
      Use sample {{ label.toLowerCase() }}
    </button>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
  </div>
</template>
