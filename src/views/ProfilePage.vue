<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonPage, IonIcon } from '@ionic/vue'
import {
  shieldCheckmarkOutline,
  calendarOutline,
  arrowForwardOutline,
  logOutOutline,
} from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import CarCard from '../components/cars/CarCard.vue'
import { rental, logout } from '../stores/rental'
import { featuredCars } from '../data/cars'
import { useSavedCars } from '../composables/useSavedCars'
const { saved } = useSavedCars(),
  router = useRouter()
const trips = computed(() => rental.reservations.filter((r) => r.accountId === rental.account?.id))
const upcoming = computed(
  () => trips.value.filter((r) => ['Pending Approval', 'Confirmed'].includes(r.status)).length,
)
const active = computed(() => trips.value.filter((r) => r.status === 'Active Rental').length)
const history = computed(() => trips.value.filter((r) => r.status === 'Completed').length)
function signout() {
  logout()
  router.replace('/tabs/home')
}
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main class="page-shell dashboard-page">
        <div v-if="!rental.account" class="empty-state">
          <p class="eyebrow">YOUR RENTAGO</p>
          <h1>A home for every journey.</h1>
          <p>Sign in to manage your profile, verification and rental requests.</p>
          <router-link class="primary-button" to="/auth">Sign in / Create account</router-link>
        </div>
        <template v-else>
          <div class="section-heading">
            <div>
              <p class="eyebrow">YOUR RENTAGO</p>
              <h1>
                Good to see you,
                {{ rental.account.profile.name.split(' ')[0] }}.
              </h1>
              <p class="muted">Your next journey starts with a little peace of mind.</p>
            </div>
            <button class="text-link" @click="signout">
              <ion-icon :icon="logOutOutline" />
              Sign out
            </button>
          </div>
          <section class="dashboard-overview">
            <div class="verification-overview">
              <ion-icon :icon="shieldCheckmarkOutline" />
              <div>
                <StatusBadge :status="rental.verification.status" />
                <h2>
                  {{
                    rental.verification.status === 'Verified'
                      ? "You're ready to request a ride."
                      : "Let's get you ready to drive."
                  }}
                </h2>
                <p>
                  {{
                    !rental.account.profileComplete
                      ? 'Complete your profile, then submit sample documents.'
                      : rental.verification.status === 'Verified'
                        ? 'Profile complete. Every reservation still requires approval.'
                        : 'Finish document and selfie verification before submitting a request.'
                  }}
                </p>
                <router-link
                  class="text-link"
                  :to="rental.account.profileComplete ? '/verify' : '/complete-profile'"
                >
                  {{
                    rental.verification.status === 'Verified'
                      ? 'View verification'
                      : 'Continue setup'
                  }}
                  <ion-icon :icon="arrowForwardOutline" />
                </router-link>
              </div>
            </div>
            <div class="dashboard-stats">
              <router-link to="/tabs/bookings">
                <strong>{{ upcoming }}</strong>
                <span>Upcoming</span>
              </router-link>
              <router-link to="/tabs/bookings">
                <strong>{{ active }}</strong>
                <span>Active rentals</span>
              </router-link>
              <router-link to="/tabs/bookings">
                <strong>{{ history }}</strong>
                <span>Completed</span>
              </router-link>
            </div>
          </section>
          <section class="account-details">
            <div class="section-heading">
              <h2>Account details</h2>
              <router-link class="text-link" to="/complete-profile">Edit profile</router-link>
            </div>
            <dl>
              <div>
                <dt>Full name</dt>
                <dd>{{ rental.account.profile.name }}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{{ rental.account.profile.email }}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{{ rental.account.profile.phone || 'Not provided' }}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{{ rental.account.profile.address || 'Not provided' }}</dd>
              </div>
            </dl>
          </section>
          <section class="dashboard-action">
            <ion-icon :icon="calendarOutline" />
            <div>
              <h2>Every trip, in one place.</h2>
              <p>Track approval, review your dates, or manage a request.</p>
            </div>
            <router-link class="text-link" to="/tabs/bookings">
              My bookings
              <ion-icon :icon="arrowForwardOutline" />
            </router-link>
          </section>
        </template>
        <section class="saved-section">
          <div class="section-heading">
            <h2>Your shortlist</h2>
            <router-link class="text-link" to="/tabs/explore">Explore cars</router-link>
          </div>
          <div v-if="saved.length" class="car-grid">
            <CarCard
              v-for="car in featuredCars.filter((c) => saved.includes(c.id))"
              :key="car.id"
              :car="car"
            />
          </div>
          <div v-else class="empty-state small-empty">
            <h3>A little inspiration for later.</h3>
            <p>Tap the heart on a vehicle to add it to your shortlist.</p>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>
