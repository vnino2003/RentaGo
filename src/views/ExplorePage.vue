<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, IonIcon, IonModal } from '@ionic/vue'
import { searchOutline, optionsOutline, closeOutline, heartOutline } from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import CarCard from '../components/cars/CarCard.vue'
import CategoryChips from '../components/cars/CategoryChips.vue'
import { rental } from '../stores/rental'
import { useSavedCars } from '../composables/useSavedCars'
import { getVehicles, available } from '../services/mockApi'
import { locations, manilaToday, money } from '../domain/rental'
import type { Car } from '../types/car'
const route = useRoute(),
  router = useRouter(),
  cars = ref<Car[]>([]),
  loading = ref(true),
  error = ref(''),
  query = ref(''),
  sort = ref('recommended'),
  onlySaved = ref(false),
  filtersOpen = ref(false)
const budget = ref(7000),
  seats = ref(0),
  transmission = ref('All'),
  fuel = ref('All'),
  onlyAvailable = ref(false),
  branch = ref('All')
const { saved } = useSavedCars()
const category = computed({
  get: () => (typeof route.query.category === 'string' ? route.query.category : 'All'),
  set: (value) => router.replace({ query: { ...route.query, category: value } }),
})
const filterCount = computed(
  () =>
    [
      budget.value < 7000,
      seats.value > 0,
      transmission.value !== 'All',
      fuel.value !== 'All',
      onlyAvailable.value,
      branch.value !== 'All',
    ].filter(Boolean).length,
)
const results = computed(() => {
  const term = query.value.trim().toLowerCase()
  const result = cars.value.filter(
    (c) =>
      (category.value === 'All' || category.value === c.category) &&
      c.pricePerDay <= budget.value &&
      c.seats >= seats.value &&
      (transmission.value === 'All' || transmission.value === c.transmission) &&
      (fuel.value === 'All' || fuel.value === c.fuel) &&
      (branch.value === 'All' || branch.value === c.location) &&
      (!onlySaved.value || saved.value.includes(c.id)) &&
      (!onlyAvailable.value || available(c.id, rental.draft.pickup, rental.draft.returnDate)) &&
      [c.name, c.brand, c.category, c.location].some((value) => value.toLowerCase().includes(term)),
  )
  return sort.value === 'low'
    ? result.sort((a, b) => a.pricePerDay - b.pricePerDay)
    : sort.value === 'high'
      ? result.sort((a, b) => b.pricePerDay - a.pricePerDay)
      : result
})
async function load(fail = false) {
  loading.value = true
  error.value = ''
  try {
    cars.value = await getVehicles(fail)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
function reset() {
  budget.value = 7000
  seats.value = 0
  transmission.value = 'All'
  fuel.value = 'All'
  onlyAvailable.value = false
  branch.value = 'All'
  query.value = ''
  onlySaved.value = false
  category.value = 'All'
}
onMounted(() => load())
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main class="page-shell browse-page">
        <div class="section-heading">
          <div>
            <p class="eyebrow">THE RENTAGO COLLECTION</p>
            <h1>Find your kind of freedom.</h1>
            <p class="muted">A thoughtful fleet for every plan.</p>
          </div>
          <span class="collection-number">0{{ cars.length }}</span>
        </div>
        <div class="browse-controls">
          <label class="text-search">
            <ion-icon :icon="searchOutline" />
            <input
              v-model="query"
              type="search"
              placeholder="Search a vehicle or location"
              aria-label="Search cars"
            />
          </label>
          <button
            class="saved-filter"
            :class="{ active: onlySaved }"
            :aria-pressed="onlySaved"
            @click="onlySaved = !onlySaved"
          >
            <ion-icon :icon="heartOutline" />
            Saved
          </button>
          <button class="saved-filter" @click="filtersOpen = true">
            <ion-icon :icon="optionsOutline" />
            Filters {{ filterCount ? `(${filterCount})` : '' }}
          </button>
          <label class="sort-control">
            Sort
            <select v-model="sort" aria-label="Sort cars">
              <option value="recommended">Recommended</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
        <div class="fleet-tools">
          <CategoryChips v-model="category" />
          <span class="result-count" aria-live="polite">{{ results.length }} vehicles</span>
        </div>
        <div v-if="loading" class="car-grid" aria-label="Loading vehicles" aria-busy="true">
          <div v-for="n in 4" :key="n" class="skeleton-car">
            <div />
            <span />
            <span />
          </div>
        </div>
        <div v-else-if="error" class="empty-state" role="alert">
          <h2>Let's try that again.</h2>
          <p>{{ error }}</p>
          <button class="primary-button" @click="load()">Retry</button>
        </div>
        <div v-else class="car-grid">
          <CarCard v-for="car in results" :key="car.id" :car="car" />
        </div>
        <div v-if="!loading && !error && !results.length" class="empty-state">
          <ion-icon :icon="searchOutline" />
          <h2>No match. More possibilities.</h2>
          <p>Try a different category or adjust your filters.</p>
          <button class="primary-button" @click="reset">Reset filters</button>
        </div>
        <p class="availability-note">
          Final confirmation follows approval of your reservation request.
        </p>
      </main>
      <ion-modal
        :is-open="filtersOpen"
        :initial-breakpoint="1"
        :breakpoints="[0, 1]"
        @did-dismiss="filtersOpen = false"
      >
        <ion-content>
          <section class="modal-body">
            <div class="section-heading">
              <h2>Make it your fit.</h2>
              <button class="icon-button" aria-label="Close filters" @click="filtersOpen = false">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>
            <div class="field-stack">
              <label>
                Maximum daily rate
                <strong>{{ money(budget) }}</strong>
                <input
                  v-model.number="budget"
                  type="range"
                  min="1500"
                  max="7000"
                  step="100"
                  aria-label="Maximum daily rate"
                />
              </label>
              <label>
                Seats
                <select v-model.number="seats">
                  <option :value="0">Any capacity</option>
                  <option :value="5">5 or more</option>
                  <option :value="7">7 or more</option>
                  <option :value="8">8 or more</option>
                </select>
              </label>
              <label>
                Transmission
                <select v-model="transmission">
                  <option>All</option>
                  <option>Automatic</option>
                  <option>Manual</option>
                </select>
              </label>
              <label>
                Fuel type
                <select v-model="fuel">
                  <option>All</option>
                  <option>Gasoline</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </label>
              <label>
                Pickup branch
                <select v-model="branch">
                  <option>All</option>
                  <option v-for="location in locations" :key="location">
                    {{ location }}
                  </option>
                </select>
              </label>
              <div class="form-grid">
                <label>
                  Pickup date
                  <input v-model="rental.draft.pickup" type="date" :min="manilaToday()" />
                </label>
                <label>
                  Return date
                  <input v-model="rental.draft.returnDate" type="date" :min="rental.draft.pickup" />
                </label>
              </div>
              <label class="check-field">
                <input v-model="onlyAvailable" type="checkbox" />
                Available for these dates only
              </label>
            </div>
            <div class="form-actions">
              <button class="text-link" @click="reset">Reset all</button>
              <button class="primary-button" @click="filtersOpen = false">
                Show {{ results.length }} vehicles
              </button>
            </div>
          </section>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>
