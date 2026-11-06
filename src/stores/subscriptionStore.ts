import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscriptionApi } from '../api/subscriptions'
import { useWorkspaceStore } from './workspace'
import type { Subscription, WorkspaceSummary } from '../types/subscription'

export const useSubscriptionStore = defineStore('subscriptions', () => {
  const subscriptions = ref<Subscription[]>([])
  const summary = ref<WorkspaceSummary>({
    total_subscriptions: 0,
    monthly_budget_uah: 0,
    monthly_budget_usd: 0,
    active_subscriptions: 0,
    upcoming_payments_count: 0
  })
  const isLoading = ref<boolean>(false)

  async function fetchSubscriptions(search?: string, category?: string) {
    const workspaceStore = useWorkspaceStore()
    const workspaceId = workspaceStore.currentWorkspace?.id || 1

    isLoading.value = true
    try {
      const data = await subscriptionApi.getAll({
        workspace_id: workspaceId,
        search,
        category
      })
      subscriptions.value = data || []
    } catch (err) {
      console.error('Не вдалося завантажити підписки:', err)
      subscriptions.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummary() {
    const workspaceStore = useWorkspaceStore()
    const workspaceId = workspaceStore.currentWorkspace?.id || 1

    try {
      const data = await subscriptionApi.getSummary(workspaceId)
      if (data) {
        summary.value = data
      }
    } catch (err) {
      console.error('Не вдалося отримати KPI метрики:', err)
    }
  }

  return {
    subscriptions,
    summary,
    isLoading,
    fetchSubscriptions,
    fetchSummary
  }
})
