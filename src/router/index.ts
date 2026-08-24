import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const appRoutes = [
  {
    path: '/analog-clock',
    name: 'AnalogClock',
    component: () => import('../components/AnalogClock.vue'),
    meta: {
      title: 'Analog Color',
    },
  },
  {
    path: '/digital-clock',
    name: 'DigitalClock',
    component: () => import('../components/DigitalClock.vue'),
    meta: {
      title: 'Digital Clock',
    },
  },
  {
    path: '/screen-test',
    name: 'ColorfulScreen',
    component: () => import('../components/ColorfulScreen.vue'),
    meta: {
      title: 'Screen Test',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
    },
    ...appRoutes,
  ],
})

export default router
