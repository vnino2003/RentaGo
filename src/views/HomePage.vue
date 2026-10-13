<script setup lang="ts">
import { IonContent, IonPage, IonIcon } from '@ionic/vue'
import {
  arrowForwardOutline,
  shieldCheckmarkOutline,
  receiptOutline,
  carSportOutline,
} from 'ionicons/icons'
import AppHeader from '../components/AppHeader.vue'
import Reveal from '../components/Reveal.vue'
import CarCard from '../components/cars/CarCard.vue'
import { featuredCars } from '../data/cars'
</script>
<template>
  <ion-page>
    <AppHeader />
    <ion-content>
      <main>
        <section class="premium-hero">
          <img
            src="/vehicles/coastal-tesla.jpg"
            alt="White Tesla Model 3 on a coastal road"
            fetchpriority="high"
          />
          <div class="hero-copy page-shell">
            <p class="eyebrow">CAR RENTAL / METRO MANILA</p>
            <h1>RentaGo.</h1>
            <p class="hero-line">Your ride. Your way.</p>
            <p class="hero-description">
              For the everyday plans.
              <br />
              And the roads less ordinary.
            </p>
            <router-link to="/tabs/explore" class="primary-button hero-cta">
              Discover your ride
              <ion-icon :icon="arrowForwardOutline" />
            </router-link>
          </div>
          <div class="hero-bottom">
            <span>THE FREEDOM TO GO FURTHER</span>
            <router-link to="/cars/tesla-model-3">
              Meet the Model 3
              <ion-icon :icon="arrowForwardOutline" />
            </router-link>
          </div>
        </section>
        <section class="home-intro page-shell">
          <p>
            Thoughtful choices.
            <br />
            <strong>Extraordinary journeys.</strong>
          </p>
          <span>
            Explore the fleet, verify your profile, and request your next ride. All in one place.
          </span>
        </section>
        <section class="fleet-section page-shell">
          <Reveal>
            <div class="section-heading">
              <div>
                <p class="eyebrow">THE COLLECTION</p>
                <h2>A car for your kind of day.</h2>
              </div>
              <router-link class="text-link" to="/tabs/explore">
                View collection
                <ion-icon :icon="arrowForwardOutline" />
              </router-link>
            </div>
            <div class="collection-categories">
              <router-link
                v-for="category in ['Sedan', 'SUV', 'Van', 'Premium']"
                :key="category"
                :to="`/tabs/explore?category=${category}`"
              >
                {{ category }}
                <ion-icon :icon="arrowForwardOutline" />
              </router-link>
            </div>
            <div class="car-grid">
              <CarCard v-for="car in featuredCars" :key="car.id" :car="car" />
            </div>
          </Reveal>
        </section>
        <section class="process-band">
          <div class="page-shell">
            <Reveal>
              <div class="section-heading">
                <div>
                  <p class="eyebrow">FROM PLANS TO POSSIBILITIES</p>
                  <h2>Three steps. A new direction.</h2>
                </div>
              </div>
              <div class="process-grid">
                <article>
                  <span>01</span>
                  <h3>Find your fit.</h3>
                  <p>
                    Explore vehicles, compare daily rates, and choose a car that suits your plans.
                  </p>
                  <router-link to="/tabs/explore" class="text-link">
                    Explore cars
                    <ion-icon :icon="arrowForwardOutline" />
                  </router-link>
                </article>
                <article>
                  <span>02</span>
                  <h3>Get ready to drive.</h3>
                  <p>Complete your profile, submit your documents, and finish verification.</p>
                  <router-link to="/verify" class="text-link">
                    Start verification
                    <ion-icon :icon="arrowForwardOutline" />
                  </router-link>
                </article>
                <article>
                  <span>03</span>
                  <h3>Request. Then go.</h3>
                  <p>Choose your schedule and send a request. Pick up your keys once approved.</p>
                  <router-link to="/tabs/bookings" class="text-link">
                    Your bookings
                    <ion-icon :icon="arrowForwardOutline" />
                  </router-link>
                </article>
              </div>
            </Reveal>
          </div>
        </section>
        <section class="promise-section page-shell">
          <Reveal>
            <div class="section-heading">
              <div>
                <p class="eyebrow">THE RENTAGO APPROACH</p>
                <h2>Less guesswork. More getting there.</h2>
              </div>
            </div>
            <div class="promise-grid">
              <div>
                <ion-icon :icon="receiptOutline" />
                <h3>Know the full picture.</h3>
                <p>Rental costs, optional extras, and refundable deposits, clearly separated.</p>
              </div>
              <div>
                <ion-icon :icon="shieldCheckmarkOutline" />
                <h3>Ready before the road.</h3>
                <p>Driver eligibility comes first, with a clear path from profile to approval.</p>
              </div>
              <div>
                <ion-icon :icon="carSportOutline" />
                <h3>The right car for you.</h3>
                <p>City sedans, spacious SUVs, group vans, and something a little special.</p>
              </div>
            </div>
          </Reveal>
        </section>
        <footer class="app-footer page-shell">
          <span>RentaGo</span>
          <p>Your ride. Your way.</p>
          <small>Philippines</small>
        </footer>
      </main>
    </ion-content>
  </ion-page>
</template>
