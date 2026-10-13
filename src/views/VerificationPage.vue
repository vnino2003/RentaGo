<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, IonIcon, onIonViewWillLeave } from '@ionic/vue'
import { shieldCheckmarkOutline, cameraOutline, checkmarkOutline } from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import FlowSteps from '../components/FlowSteps.vue'
import StatusBadge from '../components/StatusBadge.vue'
import DocumentUpload from '../components/DocumentUpload.vue'
import { rental, resetVerification } from '../stores/rental'
import { simulateVerification } from '../services/mockApi'
import type { VerificationStatus } from '../domain/rental'
const route = useRoute(),
  router = useRouter(),
  stage = ref(0),
  progress = ref(0),
  busy = ref(false),
  error = ref(''),
  outcome = ref<VerificationStatus>('Verified'),
  video = ref<HTMLVideoElement>(),
  cameraOpen = ref(false)
let stream: MediaStream | undefined
const v = computed(() => rental.verification)
const final = computed(() => ['Verified', 'Pending Review', 'Rejected'].includes(v.value.status))
const tasks = [
  'Document preview',
  'Sample license fields',
  'Profile preview',
  'Selfie preview',
  'Sample result',
]
const next = computed(() =>
  typeof route.query.next === 'string' && route.query.next.startsWith('/reserve/')
    ? route.query.next
    : '/tabs/profile',
)
function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop())
  stream = undefined
  cameraOpen.value = false
}
async function camera() {
  error.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    })
    cameraOpen.value = true
    await new Promise((resolve) => setTimeout(resolve, 50))
    if (video.value) {
      video.value.srcObject = stream
      await video.value.play()
    }
  } catch {
    error.value =
      'Camera unavailable or permission denied. Choose an image or use the sample selfie.'
    stopCamera()
  }
}
function capture() {
  if (!video.value?.videoWidth) return
  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight
  canvas.getContext('2d')?.drawImage(video.value, 0, 0)
  canvas.toBlob((blob) => {
    if (blob) {
      if (v.value.selfie?.url.startsWith('blob:')) URL.revokeObjectURL(v.value.selfie.url)
      v.value.selfie = {
        name: 'Local camera preview',
        url: URL.createObjectURL(blob),
        sample: false,
      }
    }
    stopCamera()
  }, 'image/jpeg')
}
async function run() {
  busy.value = true
  error.value = ''
  try {
    await simulateVerification(outcome.value, (value) => (progress.value = value))
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
function review(approved: boolean) {
  v.value.status = approved ? 'Verified' : 'Rejected'
  v.value.result = approved
    ? 'Approved by a simulated administrator. No real review occurred.'
    : 'A simulated reviewer requested clearer document images.'
}
function retry() {
  resetVerification()
  stage.value = 0
  progress.value = 0
}
onBeforeUnmount(stopCamera)
onIonViewWillLeave(stopCamera)
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main class="flow-shell page-shell">
        <FlowSteps
          :labels="['Your profile', 'Documents', 'Verification']"
          :current="stage === 0 ? 1 : 2"
        />
        <div class="flow-intro">
          <p class="eyebrow">CONFIDENCE, BEFORE THE KEYS</p>
          <h1>Get ready to drive.</h1>
          <p class="muted">Your profile, documents and selfie in one place.</p>
        </div>
        <p class="muted">
          Identity checks are simulated. Use sample documents; previews stay on this device.
        </p>
        <section v-if="final" class="verification-result">
          <ion-icon :icon="shieldCheckmarkOutline" />
          <StatusBadge :status="v.status" />
          <h2>
            {{
              v.status === 'Verified'
                ? 'Ready for your next journey.'
                : v.status === 'Pending Review'
                  ? 'Your application is in review.'
                  : "Let's try that again."
            }}
          </h2>
          <p>{{ v.result }}</p>
          <button v-if="v.status === 'Verified'" class="primary-button" @click="router.push(next)">
            {{ next.startsWith('/reserve/') ? 'Continue reservation' : 'Open dashboard' }}
          </button>
          <button v-else-if="v.status === 'Rejected'" class="primary-button" @click="retry">
            Resubmit documents
          </button>
          <div v-else class="demo-controls">
            <p>Sample review outcome</p>
            <button class="primary-button" @click="review(true)">Simulate reviewer approval</button>
            <button class="text-link" @click="review(false)">Simulate rejection</button>
          </div>
          <button class="text-link" @click="retry">Start again</button>
        </section>
        <template v-else>
          <section v-if="stage === 0" class="form-panel">
            <div class="section-heading">
              <div>
                <h2>Your documents</h2>
                <p class="muted">A driver's license and one supporting government ID.</p>
              </div>
              <StatusBadge :status="v.status" />
            </div>
            <label class="check-field consent">
              <input
                v-model="v.consent"
                type="checkbox"
                @change="v.status = v.consent ? 'In Progress' : 'Not Started'"
              />
              I consent to local document previews and understand no actual verification is
              performed.
            </label>
            <div class="upload-grid">
              <DocumentUpload
                v-model="v.license"
                label="Driver's license"
                kind="license"
                :disabled="!v.consent"
              />
              <DocumentUpload
                v-model="v.identity"
                label="Supporting ID"
                kind="identity"
                :disabled="!v.consent"
              />
            </div>
            <div class="form-actions">
              <router-link to="/complete-profile" class="text-link">Edit profile</router-link>
              <button
                class="primary-button"
                :disabled="!v.license || !v.identity || !v.consent"
                @click="stage = 1"
              >
                Continue to selfie
              </button>
            </div>
          </section>
          <section v-else class="form-panel">
            <div class="section-heading">
              <h2>A face to the name</h2>
              <button class="text-link" :disabled="busy" @click="stage = 0">
                Back to documents
              </button>
            </div>
            <div class="verification-columns">
              <div>
                <DocumentUpload
                  v-model="v.selfie"
                  label="Selfie"
                  kind="selfie"
                  :disabled="busy || !v.consent"
                />
                <button class="text-link" :disabled="busy || cameraOpen" @click="camera">
                  <ion-icon :icon="cameraOutline" />
                  Open camera
                </button>
                <div v-if="cameraOpen" class="camera-preview">
                  <video ref="video" playsinline muted />
                  <div class="form-actions">
                    <button class="primary-button" @click="capture">Capture selfie</button>
                    <button class="text-link" @click="stopCamera">Close camera</button>
                  </div>
                </div>
              </div>
              <div>
                <div class="demo-extracted">
                  <p class="eyebrow">SAMPLE DOCUMENT RECORD</p>
                  <h3>{{ rental.account?.profile.name }}</h3>
                  <dl>
                    <div>
                      <dt>License number</dt>
                      <dd>DEMO-000-000</dd>
                    </div>
                    <div>
                      <dt>Document details</dt>
                      <dd>Fictional sample record</dd>
                    </div>
                    <div>
                      <dt>Profile comparison</dt>
                      <dd>Sample result</dd>
                    </div>
                  </dl>
                  <p class="muted">Values are sample data, not read from your image.</p>
                </div>
                <label class="demo-scenario">
                  Sample result
                  <select v-model="outcome" :disabled="busy">
                    <option>Verified</option>
                    <option>Pending Review</option>
                    <option>Rejected</option>
                  </select>
                </label>
                <ol class="verification-checks" aria-live="polite">
                  <li
                    v-for="(task, index) in tasks"
                    :key="task"
                    :class="{ done: progress > index }"
                  >
                    <ion-icon :icon="checkmarkOutline" />
                    {{ task }}
                  </li>
                </ol>
                <progress
                  v-if="busy"
                  :value="progress"
                  max="5"
                  aria-label="Simulated verification progress"
                />
                <button
                  class="primary-button wide"
                  :disabled="busy || !v.selfie || !v.consent"
                  @click="run"
                >
                  {{ busy ? 'Processing...' : 'Continue verification' }}
                </button>
              </div>
            </div>
          </section>
        </template>
        <p v-if="error" role="alert" class="form-error">{{ error }}</p>
      </main>
    </ion-content>
  </ion-page>
</template>
