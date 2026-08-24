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
    name: 'ScreenTest',
    component: () => import('../components/ScreenTest.vue'),
    meta: {
      title: 'Screen Test',
    },
  },
  {
    path: '/marquee-lab',
    name: 'MarqueeLab',
    component: () => import('../components/MarqueeLab.vue'),
    meta: {
      title: 'Marquee Lab',
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

router.afterEach((to) => {
  const baseTitle = 'Always On Screen'
  document.title = to.meta.title ? `${to.meta.title} - ${baseTitle}` : baseTitle
})

export default router
