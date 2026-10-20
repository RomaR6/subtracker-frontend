import { apiClient } from './client'
import type { Subscription, WorkspaceSummary } from '../types/subscription'

export const subscriptionApi = {
  async getAll(params?: { category?: string; status?: string; search?: string }): Promise<Subscription[]> {
    const response = await apiClient.get<Subscription[]>('/subscriptions/', { params })
    return response.data
  },

  async create(data: Omit<Subscription, 'id' | 'cost_uah' | 'created_at'>): Promise<Subscription> {
    const response = await apiClient.post<Subscription>('/subscriptions/', data)
    return response.data
  },

  async getSummary(): Promise<WorkspaceSummary> {
    const response = await apiClient.get<WorkspaceSummary>('/subscriptions/summary')
    return response.data
  }
}
