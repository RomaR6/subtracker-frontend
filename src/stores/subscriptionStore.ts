import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscriptionApi } from '../api/subscriptions'
import type { Subscription, WorkspaceSummary } from '../types/subscription'

export const useSubscriptionStore = defineStore('subscriptions', () => {
  const subscriptions = ref<Subscription[]>([])
  const summary = ref<WorkspaceSummary>({
    total_subscriptions: 28,
    monthly_budget_uah: 142850,
    monthly_budget_usd: 3440.5,
    active_subscriptions: 24,
    upcoming_payments_count: 2
  })
  const isLoading = ref<boolean>(false)

  const defaultMock: Subscription[] = [
    {
      id: 1,
      name: 'Amazon Web Services',
      description: 'Хмарна інфраструктура виробничих серверів',
      category: 'DevOps & Cloud',
      owner_name: 'Олександр Кравченко',
      owner_department: 'DevOps Team',
      billing_period: 'monthly',
      cost_usd: 840.0,
      cost_uah: 34876.8,
      next_payment_date: '2026-10-21',
      status: 'active'
    },
    {
      id: 2,
      name: 'JetBrains All Products Pack',
      description: 'Корпоративний пакет середовищ розробки',
      category: 'DevTools',
      owner_name: 'Роман Олексюк',
      owner_department: 'Software Engineering',
      billing_period: 'yearly',
      cost_usd: 249.0,
      cost_uah: 10338.48,
      next_payment_date: '2026-10-27',
      status: 'active'
    },
    {
      id: 3,
      name: 'Figma Organization Seats',
      description: 'Ліцензії для відділу UI/UX дизайну',
      category: 'Design',
      owner_name: 'Марія Ковальчук',
      owner_department: 'Product Design',
      billing_period: 'monthly',
      cost_usd: 180.0,
      cost_uah: 7473.6,
      next_payment_date: '2026-10-23',
      status: 'active'
    },
    {
      id: 4,
      name: 'GitHub Copilot Enterprise',
      description: 'AI-асистент програмування для інженерів',
      category: 'AI / DevTools',
      owner_name: 'Технічний департамент',
      owner_department: 'R&D Core',
      billing_period: 'monthly',
      cost_usd: 190.0,
      cost_uah: 7888.8,
      next_payment_date: '2026-11-01',
      status: 'review'
    },
    {
      id: 5,
      name: 'Slack Business+ Workspace',
      description: 'Корпоративний месенджер та канали зв\'язку',
      category: 'Комунікація',
      owner_name: 'Олена Бойко',
      owner_department: 'HR & Operations',
      billing_period: 'monthly',
      cost_usd: 150.0,
      cost_uah: 6228.0,
      next_payment_date: '2026-10-30',
      status: 'active'
    }
  ]

  async function fetchSubscriptions(search?: string, category?: string) {
    isLoading.value = true
    try {
      const data = await subscriptionApi.getAll({ search, category })
      if (data && data.length > 0) {
        subscriptions.value = data
      } else {
        subscriptions.value = defaultMock
      }
    } catch {
      subscriptions.value = defaultMock
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const data = await subscriptionApi.getSummary()
      if (data && data.total_subscriptions > 0) {
        summary.value = data
      }
    } catch {}
  }

  return {
    subscriptions,
    summary,
    isLoading,
    fetchSubscriptions,
    fetchSummary
  }
})
