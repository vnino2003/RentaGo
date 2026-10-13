<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main class="empty-state">
        <p class="eyebrow">404</p>
        <h1>A different road.</h1>
        <p>This page isn't part of your journey.</p>
        <router-link class="primary-button" to="/tabs/home">Back to RentaGo</router-link>
      </main>
    </ion-content>
  </ion-page>
</template>
