<script setup lang="ts">
import {
  IonPage,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/vue'
import { calendarOutline, carSportOutline, homeOutline, personCircleOutline } from 'ionicons/icons'
</script>

<template>
  <ion-page>
  <ion-tabs>
    <ion-router-outlet />
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="home" href="/tabs/home">
        <ion-icon :icon="homeOutline" />
        <ion-label>Home</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="explore" href="/tabs/explore">
        <ion-icon :icon="carSportOutline" />
        <ion-label>Cars</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="bookings" href="/tabs/bookings">
        <ion-icon :icon="calendarOutline" />
        <ion-label>Bookings</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="profile" href="/tabs/profile">
        <ion-icon :icon="personCircleOutline" />
        <ion-label>Profile</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
  </ion-page>
</template>
