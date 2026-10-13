import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { rental } from '../stores/rental'
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tabs/home' },
  { path: '/tabs', redirect: '/tabs/home' },
  { path: '/tabs/home', component: () => import('../views/HomePage.vue') },
  {
    path: '/tabs/explore',
    component: () => import('../views/ExplorePage.vue'),
  },
  {
    path: '/tabs/bookings',
    component: () => import('../views/BookingsPage.vue'),
  },
  {
    path: '/tabs/profile',
    component: () => import('../views/ProfilePage.vue'),
  },
  { path: '/cars/:id', component: () => import('../views/CarDetailsPage.vue') },
  { path: '/auth', component: () => import('../views/AuthPage.vue') },
  {
    path: '/complete-profile',
    component: () => import('../views/CompleteProfilePage.vue'),
    meta: { account: true },
  },
  {
    path: '/verify',
    component: () => import('../views/VerificationPage.vue'),
    meta: { account: true, profile: true },
  },
  {
    path: '/reserve/:id',
    component: () => import('../views/ReservationPage.vue'),
    meta: { account: true },
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/NotFoundPage.vue'),
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to) => {
  if (to.meta.account && !rental.account) return { path: '/auth', query: { next: to.fullPath } }
  if (to.meta.profile && !rental.account?.profileComplete)
    return { path: '/complete-profile', query: { next: to.query.next } }
})
export default router
