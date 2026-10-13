<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/vue'
import { homeOutline, carSportOutline, calendarOutline, personCircleOutline } from 'ionicons/icons'
const route = useRoute()
const showTabs = computed(() => route.path.startsWith('/tabs/'))
const tabs = [
  { path: '/tabs/home', label: 'Discover', icon: homeOutline },
  { path: '/tabs/explore', label: 'Cars', icon: carSportOutline },
  { path: '/tabs/bookings', label: 'Bookings', icon: calendarOutline },
  { path: '/tabs/profile', label: 'Dashboard', icon: personCircleOutline },
]
</script>
<template>
  <ion-app :class="{ 'with-mobile-nav': showTabs }">
    <ion-router-outlet class="customer-outlet" />
    <nav v-if="showTabs" class="customer-bottom-nav" aria-label="Mobile navigation">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        :aria-current="route.path === tab.path ? 'page' : undefined"
      >
        <ion-icon :icon="tab.icon" />
        <span>{{ tab.label }}</span>
      </router-link>
    </nav>
  </ion-app>
</template>
