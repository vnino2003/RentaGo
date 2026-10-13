<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, IonIcon } from '@ionic/vue'
import {
  arrowBackOutline,
  peopleOutline,
  speedometerOutline,
  flashOutline,
  heart,
  heartOutline,
  arrowForwardOutline,
} from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import VehicleGallery from '../components/cars/VehicleGallery.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { featuredCars } from '../data/cars'
import { rental, selectCar } from '../stores/rental'
import { useSavedCars } from '../composables/useSavedCars'
import { available } from '../services/mockApi'
import { money } from '../domain/rental'
const route = useRoute(),
  router = useRouter(),
  { saved, toggle } = useSavedCars()
const car = computed(() => featuredCars.find((c) => c.id === route.params.id))
const isAvailable = computed(
  () => car.value && available(car.value.id, rental.draft.pickup, rental.draft.returnDate),
)
function reserve() {
  if (!car.value) return
  selectCar(car.value.id)
  const path = `/reserve/${car.value.id}`
  router.push(rental.account ? path : { path: '/auth', query: { next: path } })
}
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main v-if="car" class="vehicle-detail-page page-shell">
        <router-link class="text-link back-link" to="/tabs/explore">
          <ion-icon :icon="arrowBackOutline" />
          The collection
        </router-link>
        <div class="vehicle-title">
          <div>
            <p class="eyebrow">{{ car.brand }} / {{ car.category }}</p>
            <h1>{{ car.name }}</h1>
          </div>
          <button
            class="icon-button"
            :aria-label="saved.includes(car.id) ? 'Unsave vehicle' : 'Save vehicle'"
            :title="saved.includes(car.id) ? 'Remove from saved' : 'Save vehicle'"
            :aria-pressed="saved.includes(car.id)"
            @click="toggle(car.id)"
          >
            <ion-icon :icon="saved.includes(car.id) ? heart : heartOutline" />
          </button>
        </div>
        <VehicleGallery :key="car.id" :car="car" />
        <div class="vehicle-info-layout">
          <div>
            <section class="vehicle-about">
              <p class="eyebrow">MEET YOUR NEXT RIDE</p>
              <h2>Made for the way you travel.</h2>
              <p>{{ car.description }}</p>
              <div class="detail-spec-grid">
                <div>
                  <ion-icon :icon="peopleOutline" />
                  <strong>{{ car.seats }} seats</strong>
                  <span>Capacity</span>
                </div>
                <div>
                  <ion-icon :icon="speedometerOutline" />
                  <strong>{{ car.transmission }}</strong>
                  <span>Transmission</span>
                </div>
                <div>
                  <ion-icon :icon="flashOutline" />
                  <strong>{{ car.fuel }}</strong>
                  <span>Fuel type</span>
                </div>
              </div>
            </section>
            <section class="conditions-section">
              <h2>The details that matter.</h2>
              <details open>
                <summary>What's included</summary>
                <p>
                  Air-conditioned vehicle, standard maintenance and pickup at your selected branch.
                  Rates include applicable taxes. Fuel, tolls and optional extras are separate.
                </p>
              </details>
              <details>
                <summary>Before you drive</summary>
                <p>
                  Complete your profile and verification before requesting a car. Bring the original
                  valid driver's license and supporting ID at pickup. Eligibility is 21+ and one
                  year of licensed driving.
                </p>
              </details>
              <details>
                <summary>Pickup, return & deposit</summary>
                <p>
                  Rentals are billed per started 24-hour period. A refundable PHP 5,000 security
                  deposit is shown separately. Return with the same fuel level. Different return
                  branches carry a PHP 750 relocation fee.
                </p>
              </details>
              <details>
                <summary>Requests & cancellation</summary>
                <p>
                  Requests require approval. You may cancel a pending or confirmed reservation from
                  My bookings. No real vehicle is reserved and no payment is collected.
                </p>
              </details>
            </section>
          </div>
          <aside class="vehicle-booking-panel">
            <StatusBadge :status="isAvailable ? 'Available' : 'Unavailable'" />
            <p class="eyebrow">DAILY RENTAL FROM</p>
            <strong class="detail-price">
              {{ money(car.pricePerDay) }}
              <small>/ day</small>
            </strong>
            <p>{{ car.location }}</p>
            <p class="muted">
              {{
                isAvailable
                  ? 'Choose your schedule and see the full estimate.'
                  : 'This vehicle is in scheduled maintenance.'
              }}
            </p>
            <button class="primary-button wide" :disabled="!isAvailable" @click="reserve">
              {{ rental.account ? 'Plan this rental' : 'Sign in to reserve' }}
              <ion-icon :icon="arrowForwardOutline" />
            </button>
            <small>Verified drivers only. All requests are subject to approval.</small>
          </aside>
        </div>
      </main>
      <main v-else class="empty-state">
        <h1>Vehicle not found</h1>
        <router-link class="primary-button" to="/tabs/explore">Browse cars</router-link>
      </main>
    </ion-content>
  </ion-page>
</template>
