<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonPage, IonModal, IonIcon } from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { rental } from '../stores/rental'
import { featuredCars } from '../data/cars'
import { money, type Reservation } from '../domain/rental'
import { cancelReservation } from '../services/mockApi'
const router = useRouter(),
  filter = ref('All'),
  selected = ref<Reservation>(),
  cancelPrompt = ref(false),
  busy = ref(false),
  error = ref('')
const bookings = computed(() =>
  rental.reservations.filter(
    (r) =>
      r.accountId === rental.account?.id &&
      (filter.value === 'All' ||
        (filter.value === 'Upcoming' && ['Pending Approval', 'Confirmed'].includes(r.status)) ||
        (filter.value === 'Active' && r.status === 'Active Rental') ||
        (filter.value === 'History' && ['Completed', 'Cancelled'].includes(r.status))),
  ),
)
const vehicle = (id: string) => featuredCars.find((c) => c.id === id)
function openReservation(booking: Reservation) {
  selected.value = booking
  cancelPrompt.value = false
  error.value = ''
}
function viewVehicle() {
  if (!selected.value) return
  router.push(`/cars/${selected.value.draft.carId}`)
  selected.value = undefined
}
async function cancel() {
  if (!selected.value) return
  busy.value = true
  try {
    await cancelReservation(selected.value.id)
    cancelPrompt.value = false
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
      <main class="page-shell browse-page">
        <div class="section-heading">
          <div>
            <p class="eyebrow">YOUR JOURNEYS</p>
            <h1>My bookings.</h1>
            <p class="muted">From the first plan to the last kilometre.</p>
          </div>
          <router-link class="primary-button" to="/tabs/explore">Find your next ride</router-link>
        </div>
        <div v-if="!rental.account" class="empty-state">
          <h2>Your journeys belong here.</h2>
          <p>Sign in to see your rental requests and upcoming trips.</p>
          <router-link class="primary-button" to="/auth?next=/tabs/bookings">Sign in</router-link>
        </div>
        <template v-else>
          <div class="category-row booking-tabs" role="group" aria-label="Booking period">
            <button
              v-for="tab in ['All', 'Upcoming', 'Active', 'History']"
              :key="tab"
              :aria-pressed="filter === tab"
              :class="{ selected: filter === tab }"
              @click="filter = tab"
            >
              {{ tab }}
            </button>
          </div>
          <div class="trip-list">
            <article v-for="booking in bookings" :key="booking.id" class="trip-card">
              <img
                :src="vehicle(booking.draft.carId)?.imageUrl"
                :alt="vehicle(booking.draft.carId)?.name"
              />
              <div class="trip-main">
                <StatusBadge :status="booking.status" />
                <h2>
                  {{ vehicle(booking.draft.carId)?.brand }}
                  {{ vehicle(booking.draft.carId)?.name }}
                </h2>
                <p>{{ booking.draft.pickup }} / {{ booking.draft.returnDate }}</p>
                <small>{{ booking.draft.pickupLocation }} / {{ booking.id }}</small>
              </div>
              <div class="trip-action">
                <strong>{{ money(booking.quote.total) }}</strong>
                <small>rental subtotal</small>
                <button class="text-link" @click="openReservation(booking)">View request</button>
              </div>
            </article>
          </div>
          <div v-if="!bookings.length" class="empty-state">
            <h2>No {{ filter === 'All' ? '' : filter.toLowerCase() }} trips yet.</h2>
            <p>Your next journey is waiting to be discovered.</p>
            <router-link class="primary-button" to="/tabs/explore">
              Browse the collection
            </router-link>
          </div>
        </template>
      </main>
      <ion-modal :is-open="!!selected" @did-dismiss="selected = undefined">
        <ion-content>
          <section v-if="selected" class="modal-body">
            <div class="section-heading">
              <h2>Reservation details</h2>
              <button
                class="icon-button"
                aria-label="Close reservation"
                @click="selected = undefined"
              >
                <ion-icon :icon="closeOutline" />
              </button>
            </div>
            <StatusBadge :status="selected.status" />
            <h3>{{ vehicle(selected.draft.carId)?.name }}</h3>
            <p class="muted">{{ selected.id }}</p>
            <dl class="review-list">
              <div>
                <dt>Pickup</dt>
                <dd>
                  {{ selected.draft.pickup }} {{ selected.draft.pickupTime }}
                  <br />
                  {{ selected.draft.pickupLocation }}
                </dd>
              </div>
              <div>
                <dt>Return</dt>
                <dd>
                  {{ selected.draft.returnDate }} {{ selected.draft.returnTime }}
                  <br />
                  {{ selected.draft.returnLocation }}
                </dd>
              </div>
              <div>
                <dt>Rental cost</dt>
                <dd>{{ money(selected.quote.total) }}</dd>
              </div>
              <div>
                <dt>Refundable deposit</dt>
                <dd>{{ money(selected.quote.deposit) }}</dd>
              </div>
            </dl>
            <p class="notice-block">
              {{
                selected.status === 'Pending Approval'
                  ? 'Practice request saved locally. No real reservation has been placed.'
                  : 'Sample reservation. No payment has been collected.'
              }}
            </p>
            <div v-if="['Pending Approval', 'Confirmed'].includes(selected.status)">
              <button v-if="!cancelPrompt" class="danger-link" @click="cancelPrompt = true">
                Cancel request
              </button>
              <div v-else class="notice-block">
                <p>Cancel this rental request? No payment has been collected.</p>
                <button class="primary-button" :disabled="busy" @click="cancel">
                  {{ busy ? 'Cancelling...' : 'Yes, cancel request' }}
                </button>
                <button class="text-link" @click="cancelPrompt = false">Keep reservation</button>
              </div>
            </div>
            <p v-if="error" role="alert" class="form-error">{{ error }}</p>
            <button
              v-if="selected.status === 'Completed' || selected.status === 'Cancelled'"
              class="primary-button"
              @click="viewVehicle"
            >
              View this vehicle
            </button>
          </section>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>
