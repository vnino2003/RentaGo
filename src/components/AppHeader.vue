<script setup lang="ts">
import { IonHeader, IonToolbar, IonIcon } from '@ionic/vue'
import { personOutline, arrowForwardOutline } from 'ionicons/icons'
import { rental } from '../stores/rental'
</script>
<template>
  <ion-header class="app-header">
    <ion-toolbar>
      <div class="header-inner">
        <router-link to="/tabs/home" class="brand-link" aria-label="RentaGo home">
          <img src="/rentago-logo.png" alt="RentaGo" />
        </router-link>
        <nav class="desktop-nav" aria-label="Main navigation">
          <router-link to="/tabs/home">Discover</router-link>
          <router-link to="/tabs/explore">The collection</router-link>
          <router-link to="/tabs/bookings">My bookings</router-link>
        </nav>
        <router-link
          :to="rental.account ? '/tabs/profile' : '/auth'"
          :aria-label="rental.account ? 'My dashboard' : 'Sign in'"
          class="account-link"
        >
          <ion-icon :icon="personOutline" />
          <span>{{ rental.account ? 'My dashboard' : 'Sign in' }}</span>
          <ion-icon class="account-arrow" :icon="arrowForwardOutline" />
        </router-link>
      </div>
    </ion-toolbar>
  </ion-header>
</template>
