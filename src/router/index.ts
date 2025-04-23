import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/analog-clock',
      name: 'PageAnalogClock',
      component: () => import('../components/AnalogClock.vue'),
    },
    {
      path: '/digital-clock',
      name: 'PageDigitalClock',
      component: () => import('../components/DigitalClock.vue'),
    },
  ],
})

export default router
