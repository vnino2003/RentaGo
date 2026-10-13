<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { locationOutline, searchOutline } from 'ionicons/icons'
const router = useRouter()
const location = ref('')
const today = new Date().toLocaleDateString('en-CA')
const pickup = ref('')
const dropoff = ref('')
const error = ref('')
function search() {
  error.value = ''
  if (pickup.value && dropoff.value && dropoff.value <= pickup.value) { error.value = 'Return date must be after pickup.'; return }
  router.push({ path: '/tabs/explore', query: { location: location.value, pickup: pickup.value, return: dropoff.value } })
}
</script>
<template>
  <form class="rental-search" @submit.prevent="search">
    <div class="search-grid">
      <label class="search-field location-field"><ion-icon :icon="locationOutline" /><span><small>Pickup location</small><select v-model="location" aria-label="Pickup location"><option value="">All Metro Manila</option><option>Downtown Manila</option><option>Quezon City Hub</option><option>NAIA Terminal 3</option><option>BGC Taguig</option></select></span></label>
      <label class="search-field"><span><small>Pickup date</small><input v-model="pickup" type="date" aria-label="Pickup date" :min="today" required /></span></label>
      <label class="search-field"><span><small>Return date</small><input v-model="dropoff" type="date" aria-label="Return date" :min="pickup || today" required /></span></label>
      <button class="primary-button search-action" type="submit"><ion-icon :icon="searchOutline" />Find a car</button>
    </div>
    <p v-if="error" role="alert" class="form-error">{{ error }}</p>
  </form>
</template>
