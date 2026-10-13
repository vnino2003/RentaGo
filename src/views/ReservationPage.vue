<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import FlowSteps from '../components/FlowSteps.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { rental, eligible, selectCar } from '../stores/rental'
import { featuredCars } from '../data/cars'
import {
  draftError,
  quoteRental,
  locations,
  money,
  manilaToday,
  type Reservation,
} from '../domain/rental'
import { available, submitReservation } from '../services/mockApi'
const route = useRoute(),
  router = useRouter(),
  step = ref(0),
  error = ref(''),
  busy = ref(false),
  agree = ref(false),
  result = ref<Reservation>()
const car = computed(() => featuredCars.find((car) => car.id === route.params.id))
watch(
  car,
  (value) => {
    if (value) {
      selectCar(value.id)
      step.value = 0
      result.value = undefined
    }
  },
  { immediate: true },
)
const draft = rental.draft
const quote = computed(() => quoteRental(draft, car.value?.pricePerDay || 0))
function next() {
  error.value = draftError(draft)
  if (
    !error.value &&
    !available(draft.carId, draft.pickup, draft.returnDate, draft.pickupTime, draft.returnTime)
  )
    error.value = 'This vehicle is unavailable for this schedule. Please choose another vehicle.'
  if (!error.value) step.value++
}
async function submit() {
  if (busy.value) return
  if (!eligible.value) {
    router.push({
      path: rental.account ? '/verify' : '/auth',
      query: { next: route.fullPath },
    })
    return
  }
  if (!agree.value) {
    error.value = 'Please accept the rental request terms.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    result.value = await submitReservation()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
const nextPath = computed(() => (rental.account?.profileComplete ? '/verify' : '/complete-profile'))
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main v-if="car" class="page-shell reservation-page">
        <template v-if="result">
          <section class="request-success">
            <p class="eyebrow">YOUR NEXT JOURNEY</p>
            <StatusBadge :status="result.status" />
            <h1>Request received.</h1>
            <p>
              You're one step closer. Your rental is not confirmed until the team approves your
              request.
            </p>
            <div class="request-reference">
              <span>Reservation reference</span>
              <strong>{{ result.id }}</strong>
            </div>
            <p>No charge was made. This is a simulated reservation.</p>
            <router-link class="primary-button" to="/tabs/bookings">View my bookings</router-link>
          </section>
        </template>
        <template v-else>
          <router-link class="text-link" :to="`/cars/${car.id}`">Back to vehicle</router-link>
          <div class="flow-intro">
            <p class="eyebrow">MAKE IT A JOURNEY</p>
            <h1>Your rental, your way.</h1>
          </div>
          <FlowSteps :labels="['Schedule', 'Extras', 'Review']" :current="step" />
          <div class="reservation-layout">
            <section class="reservation-form">
              <div v-if="!eligible" class="eligibility-notice">
                <h3>Verification required before submission</h3>
                <p>Your vehicle and schedule will be kept while you complete the required steps.</p>
                <router-link
                  class="text-link"
                  :to="{
                    path: rental.account ? nextPath : '/auth',
                    query: { next: route.fullPath },
                  }"
                >
                  {{ rental.account ? 'Continue verification' : 'Sign in or create an account' }}
                </router-link>
              </div>
              <Transition name="step" mode="out-in">
                <form v-if="step === 0" key="schedule" @submit.prevent="next">
                  <h2>When and where?</h2>
                  <p class="muted">All times are Philippine Standard Time.</p>
                  <div class="form-grid">
                    <label>
                      Pickup date
                      <input v-model="draft.pickup" type="date" :min="manilaToday()" required />
                    </label>
                    <label>
                      Pickup time
                      <input v-model="draft.pickupTime" type="time" required />
                    </label>
                    <label>
                      Return date
                      <input v-model="draft.returnDate" type="date" :min="draft.pickup" required />
                    </label>
                    <label>
                      Return time
                      <input v-model="draft.returnTime" type="time" required />
                    </label>
                    <label>
                      Pickup branch
                      <select v-model="draft.pickupLocation">
                        <option v-for="location in locations" :key="location">
                          {{ location }}
                        </option>
                      </select>
                    </label>
                    <label>
                      Return branch
                      <select v-model="draft.returnLocation">
                        <option v-for="location in locations" :key="location">
                          {{ location }}
                        </option>
                      </select>
                    </label>
                  </div>
                  <div class="form-actions">
                    <span class="muted">24-hour rental blocks</span>
                    <button class="primary-button" type="submit">Continue to extras</button>
                  </div>
                </form>
                <div v-else-if="step === 1" key="extras">
                  <h2>The little extras.</h2>
                  <p class="muted">Choose what you need for a comfortable trip.</p>
                  <label class="extra-option">
                    <div>
                      <strong>Child safety seat</strong>
                      <p>Subject to age and size suitability at pickup.</p>
                      <small>{{ money(250) }} / day</small>
                    </div>
                    <input
                      v-model="draft.childSeat"
                      type="checkbox"
                      aria-label="Add child safety seat"
                    />
                  </label>
                  <label class="extra-option">
                    <div>
                      <strong>Additional driver</strong>
                      <p>A second licensed driver, subject to approval.</p>
                      <small>{{ money(300) }} / day</small>
                    </div>
                    <input
                      v-model="draft.additionalDriver"
                      type="checkbox"
                      aria-label="Add additional driver"
                    />
                  </label>
                  <div class="form-actions">
                    <button class="text-link" @click="step = 0">Back</button>
                    <button class="primary-button" @click="next">Review reservation</button>
                  </div>
                </div>
                <div v-else key="review">
                  <h2>One final look.</h2>
                  <dl class="review-list">
                    <div>
                      <dt>Driver</dt>
                      <dd>
                        {{ rental.account?.profile.name || 'Sign in required' }}
                      </dd>
                    </div>
                    <div>
                      <dt>Pickup</dt>
                      <dd>
                        {{ draft.pickup }} at {{ draft.pickupTime }}
                        <br />
                        {{ draft.pickupLocation }}
                      </dd>
                    </div>
                    <div>
                      <dt>Return</dt>
                      <dd>
                        {{ draft.returnDate }} at {{ draft.returnTime }}
                        <br />
                        {{ draft.returnLocation }}
                      </dd>
                    </div>
                    <div>
                      <dt>Rental duration</dt>
                      <dd>{{ quote.days }} day{{ quote.days === 1 ? '' : 's' }}</dd>
                    </div>
                    <div>
                      <dt>Verification</dt>
                      <dd>
                        <StatusBadge :status="rental.verification.status" />
                      </dd>
                    </div>
                  </dl>
                  <div class="notice-block">
                    Submitting creates a request for approval, not a confirmed rental. Bring your
                    original license and ID at pickup. The refundable security deposit is separate
                    from the rental cost.
                  </div>
                  <label class="check-field">
                    <input v-model="agree" type="checkbox" />
                    I understand this is a practice request, not a real booking or payment.
                  </label>
                  <div class="form-actions">
                    <button class="text-link" :disabled="busy" @click="step = 1">Back</button>
                    <button
                      class="primary-button"
                      :disabled="busy || !agree || !eligible"
                      @click="submit"
                    >
                      {{ busy ? 'Submitting...' : 'Submit reservation request' }}
                    </button>
                  </div>
                </div>
              </Transition>
              <p v-if="error" role="alert" class="form-error">{{ error }}</p>
            </section>
            <aside class="price-summary">
              <img :src="car.imageUrl" :alt="car.name" />
              <p class="eyebrow">{{ car.brand }} / {{ car.category }}</p>
              <h2>{{ car.name }}</h2>
              <dl>
                <div>
                  <dt>{{ money(car.pricePerDay) }} x {{ quote.days }} days</dt>
                  <dd>{{ money(quote.base) }}</dd>
                </div>
                <div v-if="quote.childSeat">
                  <dt>Child seat</dt>
                  <dd>{{ money(quote.childSeat) }}</dd>
                </div>
                <div v-if="quote.additionalDriver">
                  <dt>Additional driver</dt>
                  <dd>{{ money(quote.additionalDriver) }}</dd>
                </div>
                <div v-if="quote.relocation">
                  <dt>Different return branch</dt>
                  <dd>{{ money(quote.relocation) }}</dd>
                </div>
                <div>
                  <dt>Rental subtotal</dt>
                  <dd>{{ money(quote.total) }}</dd>
                </div>
                <div>
                  <dt>Refundable deposit</dt>
                  <dd>{{ money(quote.deposit) }}</dd>
                </div>
                <div class="quote-total">
                  <dt>Estimated amount at pickup</dt>
                  <dd>{{ money(quote.due) }}</dd>
                </div>
              </dl>
              <p class="muted">
                Rates include applicable taxes. Fuel, tolls and penalties are excluded. No payment
                is collected here.
              </p>
            </aside>
          </div>
        </template>
      </main>
      <main v-else class="empty-state">
        <h1>Vehicle not found</h1>
        <router-link to="/tabs/explore" class="primary-button">Browse vehicles</router-link>
      </main>
    </ion-content>
  </ion-page>
</template>
