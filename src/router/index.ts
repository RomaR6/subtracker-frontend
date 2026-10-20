import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SubscriptionsView from '../views/SubscriptionsView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: SubscriptionsView
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
