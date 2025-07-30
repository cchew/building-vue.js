import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/WeatherDisplay.vue')
  }
  // Add more routes as needed
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 