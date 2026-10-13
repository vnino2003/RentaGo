<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, IonIcon } from '@ionic/vue'
import {
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import Reveal from '../components/Reveal.vue'
import { authenticate, demoEmail, demoPassword } from '../services/mockApi'
const route = useRoute(),
  router = useRouter()
const mode = ref<'login' | 'register'>('login'),
  name = ref(''),
  email = ref(''),
  password = ref(''),
  visible = ref(false),
  busy = ref(false),
  error = ref(''),
  consent = ref(false)
const next = computed(() =>
  typeof route.query.next === 'string' &&
  /^\/(reserve\/[^/?]+|verify|complete-profile|tabs\/(profile|bookings))(\?|$)/.test(
    route.query.next,
  )
    ? route.query.next
    : '/tabs/profile',
)
function switchMode(value: 'login' | 'register') {
  mode.value = value
  error.value = ''
}
async function submit(demo = false) {
  if (busy.value) return
  error.value = ''
  if (
    !demo &&
    mode.value === 'register' &&
    (!consent.value || name.value.trim().split(/\s+/).length < 2)
  ) {
    error.value = 'Enter your full name and accept the acknowledgement.'
    return
  }
  busy.value = true
  try {
    await authenticate(
      demo ? demoEmail : email.value,
      demo ? demoPassword : password.value,
      !demo && mode.value === 'register' ? name.value : undefined,
    )
    password.value = ''
    await router.replace(
      !demo && mode.value === 'register'
        ? { path: '/complete-profile', query: { next: next.value } }
        : next.value,
    )
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main class="auth-layout page-shell">
        <section class="auth-story">
          <p class="eyebrow">A BETTER WAY TO GET THERE</p>
          <h1>
            Your next chapter
            <br />
            starts here.
          </h1>
          <img src="/vehicles/montero.png" alt="Mitsubishi Montero Sport" />
          <div class="trust-line">
            <ion-icon :icon="shieldCheckmarkOutline" />
            <span>One profile. A world of possibilities.</span>
          </div>
        </section>
        <Reveal class="auth-form-wrap">
          <div class="segmented" role="group" aria-label="Account action">
            <button
              :aria-pressed="mode === 'login'"
              :class="{ active: mode === 'login' }"
              @click="switchMode('login')"
            >
              Sign in
            </button>
            <button
              :aria-pressed="mode === 'register'"
              :class="{ active: mode === 'register' }"
              @click="switchMode('register')"
            >
              Create account
            </button>
          </div>
          <h2>{{ mode === 'login' ? 'Welcome back.' : 'Make it yours.' }}</h2>
          <p class="muted">
            {{
              mode === 'login'
                ? 'Your saved cars and next adventure are waiting.'
                : 'Create a profile to begin your rental journey.'
            }}
          </p>
          <form class="field-stack" @submit.prevent="submit(false)">
            <label v-if="mode === 'register'">
              Full name
              <input
                v-model="name"
                autocomplete="name"
                placeholder="Alex Santos"
                required
                maxlength="80"
              />
            </label>
            <label>
              Email address
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <div class="password-field">
                <input
                  v-model="password"
                  :type="visible ? 'text' : 'password'"
                  :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                  minlength="8"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  class="icon-button"
                  :aria-label="visible ? 'Hide password' : 'Show password'"
                  :title="visible ? 'Hide password' : 'Show password'"
                  @click="visible = !visible"
                >
                  <ion-icon :icon="visible ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </label>
            <label v-if="mode === 'register'" class="check-field">
              <input v-model="consent" type="checkbox" required />
              I will use sample information for this local account.
            </label>
            <p v-if="error" class="form-error" role="alert">{{ error }}</p>
            <button class="primary-button" :disabled="busy" type="submit">
              {{ busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account' }}
              <ion-icon :icon="arrowForwardOutline" />
            </button>
          </form>
          <div class="demo-account">
            <span>Just exploring?</span>
            <button class="text-link" :disabled="busy" @click="submit(true)">
              Explore with a sample account
              <ion-icon :icon="arrowForwardOutline" />
            </button>
            <small>Sample login only. Do not enter a real password.</small>
          </div>
        </Reveal>
      </main>
    </ion-content>
  </ion-page>
</template>
