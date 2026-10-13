<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, onIonViewWillEnter } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import FlowSteps from '../components/FlowSteps.vue'
import { rental } from '../stores/rental'
import { saveProfile } from '../services/mockApi'
import { manilaToday } from '../domain/rental'
const router = useRouter(),
  route = useRoute(),
  busy = ref(false),
  error = ref('')
const profile = reactive({
  ...(rental.account?.profile || {
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    licenseSince: '',
  }),
})
onIonViewWillEnter(() => {
  if (rental.account) Object.assign(profile, rental.account.profile)
  error.value = ''
})
async function submit() {
  busy.value = true
  error.value = ''
  try {
    await saveProfile(profile)
    router.replace({ path: '/verify', query: { next: route.query.next } })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
function sample() {
  Object.assign(profile, {
    name: 'Alex Santos',
    phone: '09171234567',
    address: '123 Ayala Avenue, Makati City, Metro Manila',
    birthDate: '1995-04-12',
    licenseSince: '2018-06-10',
  })
}
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main class="flow-shell page-shell">
        <FlowSteps :labels="['Your profile', 'Documents', 'Verification']" :current="0" />
        <div class="flow-intro">
          <p class="eyebrow">LET'S GET ACQUAINTED</p>
          <h1>A few details, before the drive.</h1>
          <p class="muted">
            Your details stay in this browser session. Please use sample information.
          </p>
        </div>
        <form class="form-panel" @submit.prevent="submit">
          <div class="section-heading">
            <h2>Personal information</h2>
            <button type="button" class="text-link" @click="sample">Fill sample details</button>
          </div>
          <div class="form-grid">
            <label>
              Full name
              <input v-model="profile.name" required autocomplete="name" maxlength="80" />
            </label>
            <label>
              Mobile number
              <input
                v-model="profile.phone"
                required
                type="tel"
                placeholder="09171234567"
                autocomplete="tel"
              />
            </label>
            <label>
              Date of birth
              <input v-model="profile.birthDate" type="date" required :max="manilaToday()" />
            </label>
            <label>
              Licensed since
              <input v-model="profile.licenseSince" type="date" required :max="manilaToday()" />
            </label>
            <label class="full-width">
              Residential address
              <textarea
                v-model="profile.address"
                required
                rows="2"
                autocomplete="street-address"
                maxlength="240"
              />
            </label>
          </div>
          <div class="notice-block">
            Eligibility: 21+ years old with a driver's license held for at least one year. Final
            business requirements may differ.
          </div>
          <p v-if="rental.verification.status === 'Verified'" class="notice-block">
            Changing profile information requires a new verification.
          </p>
          <p v-if="error" role="alert" class="form-error">{{ error }}</p>
          <div class="form-actions">
            <router-link to="/tabs/profile" class="text-link">Back to dashboard</router-link>
            <button class="primary-button" :disabled="busy">
              {{ busy ? 'Saving...' : 'Continue to documents' }}
            </button>
          </div>
        </form>
      </main>
    </ion-content>
  </ion-page>
</template>
